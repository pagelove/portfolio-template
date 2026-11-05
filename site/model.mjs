// Document-first editing: the HTML subtree is the editable domain model.
export const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value,{image=false}={}){
 if(!value)return '';
 if(image&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)&&value.length<350000)return value;
 if(!/^(https:\/\/|mailto:|tel:)/i.test(value))throw Error('Use a complete HTTPS, email or telephone URL.');
 const url=new URL(value);
 if(!['https:','mailto:','tel:'].includes(url.protocol)||image&&url.protocol!=='https:')throw Error('Use an HTTPS URL'+(image?'':', email or telephone link')+'.');
 return url.href;
}
export function money(value){if(!/^-?\d+(?:\.\d{1,2})?$/.test(String(value)))throw Error('Enter an amount with no more than two decimal places.');const negative=String(value).startsWith('-');const [whole,part='']=String(value).replace('-','').split('.');const result=Number(whole)*100+Number(part.padEnd(2,'0'));if(!Number.isSafeInteger(result)||result>1e11)throw Error('Amount exceeds the supported limit.');return negative?-result:result;}
export function validate(root,config){
 if(root?.id!=='records'||root.dataset.app!==config.id||root.dataset.format!=='1')throw Error('This document belongs to a different app or unsupported format. Original retained.');
 if(new TextEncoder().encode(root.outerHTML).length>2000000)throw Error('Document exceeds 2 MB. Export or archive records first.');
 if(root.querySelector('script,style,iframe,object,embed,form,input,button,link,meta'))throw Error('Unexpected executable content or controls in the source.');
 const ids=new Set();
 const allowed=new Set(['section','article','h2','p','span','time']);
 for(const el of [root,...root.querySelectorAll('*')]){
  if(!allowed.has(el.tagName.toLowerCase()))throw Error('Unsupported document structure.');
  for(const attr of el.attributes){if(!['id','data-app','data-format','itemscope','itemtype','itemid','itemprop'].includes(attr.name))throw Error('Unsupported attribute: '+attr.name);}
 }
 const rows=[...root.children];if(rows.length>500)throw Error('Maximum 500 records.');
 for(const row of rows){
  if(row.tagName!=='ARTICLE'||!/^r-[a-z0-9-]{1,70}$/.test(row.id)||ids.has(row.id))throw Error('Each record needs a unique stable identity.');ids.add(row.id);
  if(row.id!=='r-settings'&&row.getAttribute('itemtype')!=='urn:Pagelove:'+config.id+':Record:1')throw Error('Unexpected record type.');
  const contract=row.id==='r-settings'?config.settings:config.fields;
  if(row.id==='r-settings'&&row.getAttribute('itemtype')!=='urn:Pagelove:'+config.id+':Settings:1')throw Error('Unexpected settings type.');
  const fields=[...row.children];if(fields.length!==contract.length)throw Error('Missing, duplicate or unknown fields.');
  for(const f of contract){const matches=fields.filter(el=>el.getAttribute('itemprop')===f.key);if(matches.length!==1||matches[0].children.length)throw Error('Invalid field '+f.label);const value=matches[0].textContent;
   if(value.length>(f.max||5000)||f.required&&!value.trim())throw Error(f.label+' is required or too long.');
   if(f.type==='url'&&value)safeURL(value);if(f.type==='image'&&value)safeURL(value,{image:true});
   if(f.type==='date'&&value&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||new Date(value+'T00:00Z').toISOString().slice(0,10)!==value))throw Error('Use a valid calendar date.');
   if(f.type==='number'&&value&&(!Number.isFinite(Number(value))||Number(value)<0||Number(value)>1000000))throw Error(f.label+' must be between 0 and 1,000,000.');
   if(f.type==='money'&&value&&money(value)<0)throw Error('Use a non-negative amount; choose Income, Expense or Transfer separately.');
   if(f.type==='month'&&value&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(value))throw Error('Use a valid reporting month.');
   if(f.key==='limits')parseLimits(value);
   if(f.options&&!f.options.includes(value))throw Error('Unsupported '+f.label+'.');
   if(f.key==='timezone'&&value){try{new Intl.DateTimeFormat('en',{timeZone:value}).format();}catch{throw Error('Use a supported IANA timezone.');}}
   if(f.key==='contact'&&value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw Error('Enter a valid contact email.');
  }
 }
 return root;
}
export function field(row,key){return [...row.children].find(el=>el.getAttribute('itemprop')===key)?.textContent||'';}
export function serialize(root,config){validate(root,config);return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>'+escape(config.title)+' records</title></head><body>'+root.outerHTML+'</body></html>';}

export function parseLimits(text){const result=new Map();for(const line of text.split('\n').filter(v=>v.trim())){const [label,value,...extra]=line.split('|');if(extra.length||!label?.trim()||!value||result.has(label.trim())||money(value)<0)throw Error('Use one unique category|amount per line.');result.set(label.trim(),money(value));}return result;}
