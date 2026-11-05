import fs from 'node:fs/promises';
import readline from 'node:readline';
import {fileURLToPath} from 'node:url';
import {connection, readSite, deploy} from './deploy-lib.mjs';

async function main() {
  const args = process.argv.slice(2);
  const allowed = new Set(['--host', '--path', '--update', '--verify', '--prepare']);
  for (let i = 0; i < args.length; i++) {
    if (!allowed.has(args[i])) throw Error('Unknown argument. Use --host SITE.onpagelove.com [--path /directory/] [--update|--verify], or --prepare.');
    if (['--host', '--path'].includes(args[i]) && (!args[++i] || args[i].startsWith('--'))) throw Error('Missing argument value.');
  }
  const value = key => args[args.indexOf(key) + 1];
  const files = await readSite(fileURLToPath(new URL('../site/', import.meta.url)));
  if (args.includes('--prepare')) { console.log('Prepared ' + files.length + ' credential-free installation files in site/.'); return; }
  if (!args.includes('--host')) throw Error('Specify --host with the public site hostname.');
  const host = value('--host'), prefix = args.includes('--path') ? value('--path') : '/';
  connection(host, prefix);
  let token = process.env.PAGELOVE_API_TOKEN;
  if (!token) {
    if (!process.stdin.isTTY) throw Error('Use a private terminal prompt or securely provision PAGELOVE_API_TOKEN. Never put the token in a command argument or source file.');
    process.stdin.setRawMode(true);
    const input = readline.createInterface({input: process.stdin, terminal: false});
    console.log('Private API token input ready; terminal echo disabled. Paste token, then press Enter.');
    try { token = (await input[Symbol.asyncIterator]().next()).value; }
    finally { input.close(); process.stdin.setRawMode(false); process.stdin.pause(); }
  }
  const receipt = await deploy({host, prefix, files, token, update: args.includes('--update'), verifyOnly: args.includes('--verify')});
  await fs.mkdir(new URL('../.local/', import.meta.url), {recursive: true});
  await fs.writeFile(new URL('../.local/deployment-receipt.json', import.meta.url), JSON.stringify(receipt, null, 2));
  console.log('Verified ' + receipt.files.length + ' installed files: ' + receipt.url);
  console.log('Sanitized receipt: .local/deployment-receipt.json. Existing records preserved; browser application saving is a separate capability.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
