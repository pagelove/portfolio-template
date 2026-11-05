import test from 'node:test';
import assert from 'node:assert/strict';
import {connection, deploy, canonicalHTML, sha256} from '../scripts/deploy-lib.mjs';
const host = 'example-site-1234.onpagelove.com', token = 'pk_' + 'SYNTHETICTESTONLY'.repeat(2);
const html = text => Buffer.from('<!doctype html><html><head><title>Demo</title></head><body><p>' + text + '</p></body></html>');
const files = [{name: 'index.html', bytes: html('Demo')}, {name: 'assets/app.js', bytes: Buffer.from('export const ready=true;')}, {name: 'records/content.html', bytes: html('Seed')}];
function fixture(initial = {}, {stale = false, weak = false} = {}) {
  const store = new Map(Object.entries(initial).map(([k, v]) => [k, Buffer.from(v)])), calls = [], dirs = new Set(['/']); let revision = 0;
  for (const name of store.keys()) { const parts = name.split('/'); parts.pop(); let p = '/'; for (const part of parts.filter(Boolean)) { p += part + '/'; dirs.add(p); } }
  const fetcher = async (url, options) => {
    const u = new URL(url), p = u.pathname, method = options.method;
    calls.push({origin: u.origin, path: p, method, headers: options.headers, redirect: options.redirect});
    const body = store.get(p), etag = weak ? 'W/"r1"' : '"' + sha256(body || '') + '"';
    if (method === 'PROPFIND') return new Response('', {status: dirs.has(p) ? 207 : 404});
    if (method === 'MKCOL') { const parent = p.slice(0, -1).slice(0, p.slice(0, -1).lastIndexOf('/') + 1); if (!dirs.has(parent)) return new Response('', {status: 409}); dirs.add(p); return new Response('', {status: 201}); }
    if (method === 'GET') return new Response(body || '', {status: body ? 200 : 404, headers: {ETag: etag}});
    if (method === 'PUT') {
      if (stale && options.headers['If-Match']) return new Response('', {status: 412});
      if (body && options.headers['If-None-Match'] === '*') return new Response('', {status: 412});
      if (body && options.headers['If-Match'] !== etag) return new Response('', {status: 412});
      store.set(p, Buffer.from(options.body)); revision++; return new Response('', {status: 201});
    }
    throw Error('Unexpected request');
  };
  return {store, calls, fetcher};
}
test('connection accepts only exact native public/DAV pair and bounded directory', () => {
  assert.equal(connection(host, '/apps/demo/').dav, 'https://dav-' + host);
  for (const bad of ['https://' + host, 'dav-' + host, host + '.evil.test', host + ':443', 'a@' + host]) assert.throws(() => connection(bad));
  for (const bad of ['/../', '/a//', '/a?x/', '//evil/', '/a%2fb/']) assert.throws(() => connection(host, bad));
});
test('fresh install creates nested collections, creates seeds, promotes entry last and verifies', async () => {
  const f = fixture(), r = await deploy({host, prefix: '/apps/demo/', token, files, fetcher: f.fetcher});
  assert.equal(r.publicEntryVerified, true); assert.equal(r.files.length, 3);
  const writes = f.calls.filter(c => c.method === 'PUT'); assert.equal(writes.at(-1).path, '/apps/demo/index.html');
  assert.ok(writes.every(c => c.headers['If-None-Match'] === '*'));
});
test('authoring token is never sent to public origin or recorded in receipt', async () => {
  const f = fixture(), r = await deploy({host, token, files, fetcher: f.fetcher});
  assert.ok(f.calls.filter(c => c.origin === 'https://' + host).every(c => !c.headers.Authorization));
  assert.ok(f.calls.every(c => c.redirect === 'error')); assert.ok(!JSON.stringify(r).includes(token));
});
test('redeploy preserves modified records byte-for-byte and unrelated content', async () => {
  const f = fixture({'/unrelated.html': html('Keep')});
  await deploy({host, token, files, fetcher: f.fetcher}); const edited = html('Owner edited'); f.store.set('/records/content.html', edited); f.calls.length = 0;
  const r = await deploy({host, token, files, update: true, fetcher: f.fetcher});
  assert.equal(r.files.find(x => x.path === '/records/content.html').action, 'preserve-records');
  assert.deepEqual(f.store.get('/records/content.html'), edited); assert.deepEqual(f.store.get('/unrelated.html'), html('Keep'));
  assert.equal(f.calls.filter(c => c.method === 'PUT').length, 0);
});
test('different code is refused before any write unless update explicitly requested', async () => {
  const f = fixture({'/index.html': html('Different')});
  await assert.rejects(deploy({host, token, files, fetcher: f.fetcher}), /Different installed code retained/);
  assert.equal(f.calls.filter(c => c.method === 'PUT' || c.method === 'MKCOL').length, 0);
});
test('explicit update uses strong If-Match and confirms new content', async () => {
  const f = fixture({'/index.html': html('Different')});
  await deploy({host, token, files, update: true, fetcher: f.fetcher});
  assert.ok(f.calls.find(c => c.method === 'PUT' && c.path === '/index.html').headers['If-Match']);
  assert.deepEqual(f.store.get('/index.html'), html('Demo'));
});
test('stale update is refused without retry or data overwrite', async () => {
  const original = html('Concurrent owner version'), f = fixture({'/index.html': original}, {stale: true});
  await assert.rejects(deploy({host, token, files: [files[0]], update: true, fetcher: f.fetcher}), /412/);
  assert.equal(f.calls.filter(c => c.method === 'PUT').length, 1); assert.deepEqual(f.store.get('/index.html'), original);
});
test('weak revision refuses update during preflight', async () => {
  const f = fixture({'/index.html': html('Different')}, {weak: true});
  await assert.rejects(deploy({host, token, files, update: true, fetcher: f.fetcher}), /Strong revision unavailable/);
  assert.equal(f.calls.filter(c => c.method === 'PUT').length, 0);
});
test('verify-only performs no mutation and detects missing install', async () => {
  const f = fixture(); await deploy({host, token, files, fetcher: f.fetcher}); f.calls.length = 0;
  await deploy({host, token, files, verifyOnly: true, fetcher: f.fetcher});
  assert.ok(f.calls.every(c => ['GET', 'PROPFIND'].includes(c.method)));
  f.store.delete('/index.html'); await assert.rejects(deploy({host, token, files, verifyOnly: true, fetcher: f.fetcher}), /Installed file missing/);
});
test('credential in payload and unsafe paths are refused before requests', async () => {
  const f = fixture();
  for (const invalid of [[{name: 'index.html', bytes: Buffer.from(token)}], [files[0], {name: '../escape.js', bytes: Buffer.from('x')}]]) await assert.rejects(deploy({host, token, files: invalid, fetcher: f.fetcher}));
  assert.equal(f.calls.length, 0);
});
test('HTML comparison preserves real changes and ignores only identified public brand footer', () => {
  const source = html('Demo'), branded = Buffer.from(source.toString().replace('</body>', '<div style="position: fixed; bottom: 0"><a href="https://pagelove.com/">Powered by Pagelove</a></div></body>'));
  assert.equal(canonicalHTML(source), canonicalHTML(branded, true)); assert.notEqual(canonicalHTML(source), canonicalHTML(html('Changed')));
});
