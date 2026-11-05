// Trusted owner authoring only. This module does not implement application authentication.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {DOMParser} from 'linkedom';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function connection(host, prefix = '/') {
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.onpagelove\.com$/.test(host) || host.startsWith('dav-')) throw Error('Use the public onpagelove.com site hostname without a protocol, path or port.');
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(prefix)) throw Error('Use an absolute deployment directory ending in /; traversal and URL parameters are refused.');
  return {origin: 'https://' + host, dav: 'https://dav-' + host, prefix};
}
export function canonicalHTML(bytes, publicView = false) {
  const d = new DOMParser().parseFromString(Buffer.from(bytes).toString('utf8'), 'text/html');
  if (publicView) for (const e of [...(d.querySelector('body')?.children || [])]) {
    const links = e.querySelectorAll('a');
    if (e.tagName === 'DIV' && e.textContent.replace(/\s/g, '') === 'PoweredbyPagelove' && links.length === 1 && links[0].getAttribute('href') === 'https://pagelove.com/' && /position:\s*fixed/.test(e.getAttribute('style') || '') && /bottom:\s*0/.test(e.getAttribute('style') || '')) e.remove();
  }
  function walk(n, preserve = false) {
    if (n.nodeType === 3) return preserve || n.textContent.trim() ? ['text', n.textContent] : null;
    if (n.nodeType !== 1) return null;
    const tag = n.tagName.toLowerCase();
    return [tag, [...n.attributes].map(a => [a.name, a.value]).sort((a, b) => a[0].localeCompare(b[0])), [...n.childNodes].map(c => walk(c, preserve || ['script', 'style', 'textarea', 'pre'].includes(tag))).filter(Boolean)];
  }
  return JSON.stringify(walk(d.documentElement));
}
const equivalent = (name, a, b, pub = false) => name.endsWith('.html') ? canonicalHTML(a, false) === canonicalHTML(b, pub) : sha256(a) === sha256(b);
const seed = name => /^(records|data|submissions|scores)\//.test(name);
const type = name => ({'.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.webmanifest': 'application/manifest+json'}[path.extname(name)] || 'application/octet-stream');
const strong = etag => typeof etag === 'string' && /^"[^"\r\n]+"$/.test(etag);
export async function readSite(dir) {
  const files = [];
  async function walk(folder, base = '') {
    for (const entry of await fs.readdir(folder, {withFileTypes: true})) {
      const name = base + entry.name;
      if (entry.isSymbolicLink()) throw Error('Symbolic link refused in installation payload.');
      if (entry.isDirectory()) await walk(path.join(folder, entry.name), name + '/');
      else {
        if (!/^[a-zA-Z0-9_./-]+$/.test(name) || /(^|\/)\./.test(name)) throw Error('Unexpected payload path.');
        const bytes = await fs.readFile(path.join(folder, entry.name));
        if (/\bpk_[a-zA-Z0-9]{20,}\b|\bgh[pousr]_[a-zA-Z0-9]{30,}\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(bytes.toString('utf8'))) throw Error('Credential-like material refused in installation payload.');
        files.push({name, bytes});
      }
    }
  }
  await walk(dir);
  if (!files.some(f => f.name === 'index.html')) throw Error('Prepared site/index.html is missing.');
  return files.sort((a, b) => (a.name === 'index.html') - (b.name === 'index.html') || a.name.localeCompare(b.name));
}

export async function deploy({host, prefix = '/', token, files, update = false, verifyOnly = false, fetcher = fetch}) {
  const c = connection(host, prefix);
  if (typeof token !== 'string' || !/^pk_[a-zA-Z0-9]+$/.test(token) || token.length < 20) throw Error('A real private Pagelove API token is required.');
  if (!files.length || !files.some(f => f.name === 'index.html')) throw Error('Missing prepared entry.');
  // Never allow a custom caller to escape the checked namespace or bypass the payload scan.
  for (const f of files) {
    if (!/^[a-zA-Z0-9_-]+(?:[./-][a-zA-Z0-9_-]+)*$/.test(f.name) || f.name.split('/').some(p => p === '..' || p === '.')) throw Error('Unsafe payload path.');
    if (Buffer.from(f.bytes).includes(Buffer.from(token))) throw Error('Private credential found in payload.');
  }
  async function request(origin, method, resource, options = {}) {
    if (![c.dav, c.origin].includes(origin) || !resource.startsWith('/')) throw Error('Unapproved destination.');
    let r;
    try { r = await fetcher(origin + resource, {method, ...options, headers: {...options.headers, ...(origin === c.dav ? {Authorization: 'Bearer ' + token} : {})}, redirect: 'error', signal: AbortSignal.timeout(25000)}); }
    catch { throw Error('Network operation failed for ' + method + ' ' + resource + '; no automatic write retry. Reconcile destination before continuing.'); }
    return {status: r.status, bytes: Buffer.from(await r.arrayBuffer()), etag: r.headers.get('etag')};
  }
  const inventory = await request(c.dav, 'PROPFIND', '/', {headers: {Depth: '1'}});
  if (inventory.status !== 207) throw Error('Destination inventory refused: ' + inventory.status);
  const planned = [];
  // Preflight the entire release before creating collections or writing files.
  for (const f of files) {
    const resource = c.prefix + f.name, old = await request(c.dav, 'GET', resource);
    if (![200, 404].includes(old.status)) throw Error('Baseline unavailable: ' + old.status + ' ' + resource);
    let action = old.status === 404 ? 'create' : seed(f.name) ? 'preserve-records' : equivalent(f.name, f.bytes, old.bytes) ? 'unchanged' : 'update';
    if (verifyOnly && action === 'create') throw Error('Installed file missing: ' + resource);
    if (action === 'update' && (verifyOnly || !update)) throw Error('Different installed code retained: ' + resource + '. Review it, then explicitly use --update.');
    if (action === 'update' && !strong(old.etag)) throw Error('Strong revision unavailable: ' + resource);
    planned.push({...f, resource, action, old});
  }
  const collections = new Set(['/']);
  async function ensure(folder) {
    if (collections.has(folder)) return;
    const trimmed = folder.slice(0, -1), parent = trimmed.slice(0, trimmed.lastIndexOf('/') + 1);
    if (parent && parent !== folder) await ensure(parent);
    const listed = await request(c.dav, 'PROPFIND', folder, {headers: {Depth: '0'}});
    if (listed.status === 404) {
      const made = await request(c.dav, 'MKCOL', folder, {headers: {'If-None-Match': '*'}});
      if (made.status !== 201) throw Error('Directory creation refused: ' + made.status + ' ' + folder);
    } else if (listed.status !== 207) throw Error('Directory inventory refused: ' + listed.status + ' ' + folder);
    collections.add(folder);
  }
  const results = [];
  for (const f of planned.sort((a, b) => (a.name === 'index.html') - (b.name === 'index.html') || a.name.localeCompare(b.name))) {
    if (['create', 'update'].includes(f.action) && !verifyOnly) {
      await ensure(f.resource.slice(0, f.resource.lastIndexOf('/') + 1));
      const written = await request(c.dav, 'PUT', f.resource, {headers: {'Content-Type': type(f.name), ...(f.action === 'create' ? {'If-None-Match': '*'} : {'If-Match': f.old.etag})}, body: f.bytes});
      if (![200, 201, 204].includes(written.status)) throw Error('Conditional write refused: ' + written.status + ' ' + f.resource + '; existing data retained; no automatic retry.');
    }
    const actual = await request(c.dav, 'GET', f.resource);
    if (actual.status !== 200 || !equivalent(f.name, f.action === 'preserve-records' ? f.old.bytes : f.bytes, actual.bytes)) throw Error('Authoring readback mismatch: ' + f.resource);
    results.push({path: f.resource, action: f.action, sourceSha256: sha256(f.bytes), installedSha256: sha256(actual.bytes), verified: true});
  }
  const entry = await request(c.origin, 'GET', c.prefix + 'index.html');
  const expected = files.find(f => f.name === 'index.html');
  if (entry.status !== 200 || !equivalent('index.html', expected.bytes, entry.bytes, true)) throw Error('Public entry verification failed.');
  return {utc: new Date().toISOString(), actor: 'Repository deploy tool', url: c.origin + c.prefix + 'index.html', mechanism: 'Trusted owner WebDAV authoring; not application authentication', verifyOnly, files: results, publicEntryVerified: true};
}
