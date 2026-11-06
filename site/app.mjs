import {createProduct} from './product.mjs';
import {civilToday} from './product-logic.mjs';
import {sourceText} from './source-response.mjs';
import {createRecovery} from './recovery.mjs';
import {createDomain} from './domain.mjs';
import {config} from './config.mjs';
import {validate,serialize,field,safeURL,money,parseDocument} from './model.mjs';
const $=s=>document.querySelector(s), status=$('#status'), list=$('#collection'), dialog=$('#editor'), form=$('#edit-form');
const acceptedWriter=location.hostname==='127.0.0.1';
let root,etag,baseline='',editingId=null,busy=false,dirty=false,mode='published',lastRemoved=null;
const draftKey='pagelove-draft:'+config.id+':'+location.origin+location.pathname;
const report=(message,error=false)=>{status.textContent=message;status.dataset.error=String(error);};
const drafts=createRecovery(()=>sessionStorage,draftKey);
function parse(text){return parseDocument(text,config);}
function snapshot(){return serialize(root,config);}
function remember(){const stored=drafts.write(snapshot());if(!stored)report('Draft storage unavailable. Export your work before leaving.',true);return stored;}
function edited(){dirty=snapshot()!==baseline;if(!dirty){const cleared=drafts.remove();render();report(cleared?'Changes match the loaded source.':'Changes match the loaded source. An older recovery copy could not be cleared.',!cleared);return;}const stored=remember();render();report(stored?'Unsaved changes. Save to confirm them on the source.':'Unsaved changes. Draft storage unavailable; export your work before leaving.',!stored);}
function rows(){return [...root.children].filter(r=>r.id!=='r-settings');}
const domain=createDomain(config,{getRoot:()=>root,replace:candidate=>{validate(candidate,config);root=candidate;edited();},rerender:()=>render(),viewValue:key=>product.viewValue(key)});
const product=createProduct(config,{getRoot:()=>root,rerender:()=>render(),report,photo:row=>domain.view(row),undo:()=>{if(!lastRemoved||root.querySelector('#'+CSS.escape(lastRemoved.record.id))){report('That record is already present.');return;}const next=lastRemoved.nextId&&root.querySelector('#'+CSS.escape(lastRemoved.nextId));root.insertBefore(lastRemoved.record.cloneNode(true),next||root.querySelector('#r-settings'));lastRemoved=null;edited();}});
function download(text,name,type='text/html'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function button(text,fn){const b=node('button',text,'pl-button pl-button--outlined pl-button--md');b.type='button';b.addEventListener('click',fn);return b;}
function render(){
 const query=$('#search').value.toLowerCase().trim();list.replaceChildren();
 domain.render(root,mode);
 const visible=product.order(rows().filter(row=>domain.include(row)&&product.include(row)).filter(r=>(mode==='edit'||!config.publishing||field(r,'state')==='Published')&&r.textContent.toLowerCase().includes(query)));
 domain.syncVisible?.(visible);product.render(root,mode,visible);
 $('#result-count').textContent=visible.length+' '+(visible.length===1?config.noun:config.plural);
 for(const row of visible){const card=node('article',undefined,'record');card.dataset.recordId=row.id;
  const image=field(row,'image');if(image){const img=node('img');img.src=safeURL(image,{image:true});img.alt=field(row,'alt')||field(row,config.titleField);img.loading='lazy';card.append(img);}
  const body=node('div',undefined,'record-body');body.append(node('h2',field(row,config.titleField)));
  for(const f of config.fields){if(f.key===config.titleField||['image','alt','link'].includes(f.key)||f.key==='state'&&mode!=='edit')continue;
   const value=field(row,f.key);if(!value)continue;const p=node('p',value,['body','description','notes'].includes(f.key)?'record-copy':'record-meta');p.dataset.field=f.key;if(!['body','description','notes','tagline'].includes(f.key))p.prepend(node('strong',f.label+': '));body.append(p);
  }
  if(field(row,'link')){const a=node('a',config.linkLabel||'Open link','pl-button pl-button--strong pl-button--md');a.href=safeURL(field(row,'link'));body.append(a);}
  if(mode==='edit'){const controls=node('div',undefined,'actions');controls.append(button('Edit',()=>openEditor(row)),button('Move up',()=>move(row,-1)),button('Move down',()=>move(row,1)),button('Remove',()=>{if(confirm('Remove this '+config.noun+' from the working draft? Save to apply the change.')){lastRemoved={record:row.cloneNode(true),nextId:row.nextElementSibling?.id};row.remove();edited();product.removed(field(row,config.titleField));}}));const ordered=rows(),position=ordered.indexOf(row);controls.children[1].disabled=position===0;controls.children[2].disabled=position===ordered.length-1;body.append(controls);}
  if(config.id==='photos'&&field(row,'image'))body.append(button('View photo',()=>domain.view(row)));
  card.append(body);product.decorate(card,row);list.append(card);
 }
 if(!visible.length)list.append(node('p',['budget','fitness'].includes(config.id)?'No '+config.plural+' in this view. Change the reporting period or filters, or add a record.':'No matching '+config.plural+'. Clear filters or change the search'+(mode==='edit'?' or add one.':'.')));
 $('#manage').setAttribute('aria-pressed',String(mode==='edit'));$('#manage').textContent=mode==='edit'?'Preview':'Edit content';
 document.querySelectorAll('[data-edit-only]').forEach(e=>e.hidden=mode!=='edit');$('#save').disabled=!dirty||busy||!acceptedWriter;
}
function move(row,direction){const ordered=rows(),other=ordered[ordered.indexOf(row)+direction];if(!other)return;direction<0?root.insertBefore(row,other):root.insertBefore(other,row);edited();}
function openEditor(row){
 editingId=row?.id||null;form.reset();$('#editor-title').textContent=row?'Edit '+config.noun:'Add '+config.noun;
 for(const f of config.fields){const control=form.elements.namedItem(f.key);control.value=row?field(row,f.key):(f.default||(f.key==='date'?product.defaultDate():''));}
 $('#editor-error').textContent='';dialog.showModal();form.elements.namedItem(config.titleField)?.focus();
}
form.addEventListener('submit',e=>{e.preventDefault();try{
 const candidate=root.cloneNode(true);let record=editingId?candidate.querySelector('#'+CSS.escape(editingId)):null;
 if(editingId&&!record)throw Error('Record no longer exists. Close this editor and reconcile the source.');
 if(!record){record=node('article');record.id='r-'+crypto.randomUUID();record.setAttribute('itemscope','');record.setAttribute('itemtype','urn:Pagelove:'+config.id+':Record:1');candidate.append(record);}
 record.replaceChildren();for(const f of config.fields){const value=form.elements.namedItem(f.key).value.trim();const el=node(f.key===config.titleField?'h2':'p',value);el.setAttribute('itemprop',f.key);record.append(el);}
 validate(candidate,config);root=candidate;dialog.close();edited();
}catch(error){$('#editor-error').textContent=error.message;}});
$('#photo-upload')?.addEventListener('change',async e=>{let bitmap;try{const file=e.target.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5000000)throw Error('Choose a PNG, JPEG or WebP image up to 5 MB.');bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>25000000)throw Error('Image dimensions are too large.');const scale=Math.min(1,900/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);const value=canvas.toDataURL('image/jpeg',.78);if(value.length>350000)throw Error('Compressed image is too large; choose a smaller image.');form.elements.namedItem('image').value=value;$('#editor-error').textContent='Photo prepared locally. Add a description, then apply to draft.';}catch(error){$('#editor-error').textContent=error.message;}finally{bitmap?.close();e.target.value='';}});
$('#cancel-edit').addEventListener('click',()=>dialog.close());
dialog.addEventListener('cancel',e=>{e.preventDefault();dialog.close();});
$('#manage').addEventListener('click',()=>{mode=mode==='edit'?'published':'edit';render();report(mode==='edit'?(acceptedWriter?'Local preview: saves update only this fixture.':'Local editing only. Export your changes; live saving is not connected.'):'Content loaded.');});
$('#add').addEventListener('click',()=>openEditor(null));$('#search').addEventListener('input',render);
// Midnight is dark-only; do not offer an unsupported light mode.
$('#export').addEventListener('click',()=>download(snapshot(),config.id+'-records.html'));
$('#import').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2000000)throw Error('Import exceeds 2 MB.');const candidate=parse(await file.text());if(!confirm('Replace the working draft with this validated import? Existing source is unchanged until Save.'))return;root=candidate;edited();}catch(error){report(error.message,true);}finally{e.target.value='';}});
$('#save').addEventListener('click',async()=>{
 if(busy||!acceptedWriter)return;busy=true;const submitted=snapshot(),oldETag=etag;render();report('Saving…');
 try{
  if(!oldETag||oldETag.startsWith('W/'))throw Error('A strong source revision is required. Reload the source before saving.');
  const response=await fetch('./records/content.html',{method:'PUT',headers:{'Content-Type':'text/html; charset=utf-8','If-Match':oldETag},credentials:'same-origin',body:submitted});
  if(response.status===412)throw Error('Conflict: the source changed. Your draft is retained. Export it, then reload and reapply your changes.');
  if(!response.ok)throw Error('Source rejected the save ('+response.status+'). Your draft is retained.');
  const readback=await fetch('./records/content.html',{cache:'no-store',credentials:'same-origin',headers:{Range:'selector=#records'}});if(!readback.ok)throw Error('Saved response received, but readback is unavailable. Retain your draft and reload to reconcile.');
  const accepted=parse(await sourceText(readback));if(serialize(accepted,config)!==submitted)throw Error('The current source differs from the submitted snapshot. Export the draft and reconcile.');
  etag=readback.headers.get('ETag');baseline=submitted;
  if(snapshot()===submitted){root=accepted;dirty=false;const cleared=drafts.remove();report(cleared?'Saved and verified on the source.':'Saved and verified on the source. Older local recovery could not be cleared; export before leaving.',!cleared);}else{report('Earlier snapshot saved. Newer edits remain unsaved.');remember();}
 }catch(error){remember();report(error.message+' No automatic retry was performed.',true);}finally{busy=false;render();}
});
$('#reload').addEventListener('click',()=>{if(!dirty||confirm('Reload the current source? Export your draft first if you need to keep it.')){if(!drafts.remove()){report('Local recovery could not be cleared. Export your work before reloading.',true);return;}location.reload();}});
$('#recover').addEventListener('click',()=>{try{const recovery=drafts.read();if(!recovery.ok)throw Error('Draft storage unavailable. Current source remains usable.');const saved=recovery.value;if(!saved)return;root=parse(saved);dirty=true;mode='edit';$('#recovery').hidden=true;render();report('Recovered local draft. Save still requires source acceptance.');}catch(error){report(error.message,true);}});
$('#download-draft').addEventListener('click',()=>download(drafts.read().value||snapshot(),config.id+'-draft.html'));
window.addEventListener('beforeunload',e=>{if(dirty){remember();e.preventDefault();e.returnValue='';}});
window.addEventListener('pagehide',()=>{if(dirty)remember();});
async function init(){try{const response=await fetch('./records/content.html',{cache:'no-store',credentials:'same-origin',headers:{Range:'selector=#records'}});if(!response.ok)throw Error('Cannot read the source ('+response.status+'). Sign in or ask the owner for access.');root=parse(await sourceText(response));etag=response.headers.get('ETag');baseline=snapshot();const recovery=drafts.read();$('#recovery').hidden=!recovery.value;mode=config.private?'edit':'published';render();report(config.private?(acceptedWriter?'Fictional sample records loaded. Saves update only this local preview.':'Fictional sample records loaded. Local edits can be exported; live saving is not connected.'):'Sample content loaded.');if(!recovery.ok)report('Source loaded. Draft storage unavailable; export changes before leaving.',true);}catch(error){report(error.message,true);$('#manage').disabled=true;}}
init();
