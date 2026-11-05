// Loopback-only persistence fixture. This is not a production authentication server.
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {DOMParser} from 'linkedom';import {validate} from '../site/model.mjs';import {config} from '../site/config.mjs';
const root=path.resolve(fileURLToPath(new URL('../site/',import.meta.url))),state=path.resolve(process.env.PREVIEW_STATE||'.preview-state/content.html'),port=Number(process.env.PORT||4174);
await fs.mkdir(path.dirname(state),{recursive:true});try{await fs.access(state);}catch{await fs.copyFile(path.join(root,'records/content.html'),state);}
const etag=bytes=>'"'+createHash('sha256').update(bytes).digest('hex')+'"';
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
let queue=Promise.resolve();
const server=http.createServer(async(req,res)=>{try{
 const expected='127.0.0.1:'+port;if(req.headers.host!==expected){res.writeHead(403);return res.end('Invalid host');}
 const uri=decodeURIComponent(new URL(req.url,'http://'+expected).pathname);
 if(req.method==='PUT'){
  if(uri!=='/records/content.html'||req.headers.origin!=='http://'+expected){res.writeHead(403);return res.end('Cross-origin or unsupported write');}
  let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>2000000){res.writeHead(413);return res.end('Too large');}}
  try{validate(new DOMParser().parseFromString(body,'text/html').querySelector('#records'),config);}catch(e){res.writeHead(422);return res.end(e.message);}
  const task=async()=>{const old=await fs.readFile(state);if(!req.headers['if-match']){res.writeHead(428);return res.end('Precondition required');}if(req.headers['if-match']!==etag(old)){res.writeHead(412);return res.end('Stale revision');}await fs.writeFile(state+'.pending',body);await fs.rename(state+'.pending',state);res.writeHead(204,{ETag:etag(body)});res.end();};queue=queue.then(task,task);await queue;return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Unsupported method');}
 const file=uri==='/records/content.html'?state:path.resolve(root,'.'+(uri==='/'?'/index.html':uri));if(file!==state&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Invalid path');}
 const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream',ETag:etag(bytes),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
}catch{res.writeHead(404);res.end('Not found');}});
server.listen(port,'127.0.0.1',()=>console.log('Local fixture: http://127.0.0.1:'+port));
