import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import path from 'node:path';import fs from 'node:fs/promises';import {once} from 'node:events';
test('fixture enforces origin, validation, strong CAS, negative cases and reload persistence',async()=>{
 const port=20000+Math.floor(Math.random()*20000),origin='http://127.0.0.1:'+port,state=path.resolve('.preview-state/test-'+crypto.randomUUID()+'.html');
 const child=spawn(process.execPath,['scripts/preview.mjs'],{env:{...process.env,PORT:String(port),PREVIEW_STATE:state},stdio:['ignore','pipe','pipe']});
 try{
  await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Fixture failed to start');}),new Promise((_,r)=>setTimeout(()=>r(Error('Startup timeout')),5000))]);
  let response=await fetch(origin+'/records/content.html');assert.equal(response.status,200);const original=await response.text(),tag=response.headers.get('etag');assert.ok(tag&&!tag.startsWith('W/'));
  const put=(body,etag,requestOrigin=origin)=>fetch(origin+'/records/content.html',{method:'PUT',headers:{Origin:requestOrigin,'Content-Type':'text/html',...(etag?{'If-Match':etag}:{})},body});
  assert.equal((await put(original,null)).status,428);assert.equal((await put(original,tag,'https://other.example')).status,403);assert.equal((await put(original.replace('data-format="1"','data-format="2"'),tag)).status,422);
  const changed=original.replace('r-sample-1','r-new-identity'),competing=original.replace('r-sample-1','r-competing-identity');const results=await Promise.all([put(changed,tag),put(competing,tag)]);assert.deepEqual(results.map(r=>r.status).sort(),[204,412]);
  const accepted=results[0].status===204?changed:competing;response=await fetch(origin+'/records/content.html');assert.equal(await response.text(),accepted);assert.notEqual(response.headers.get('etag'),tag);assert.equal(await fs.readFile(state,'utf8'),accepted);
 }finally{child.kill();await once(child,'exit');await fs.rm(state,{force:true});}
});
