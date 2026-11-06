import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const sourceRoot=fileURLToPath(new URL('../',import.meta.url));
export const readJSON=p=>JSON.parse(fs.readFileSync(path.join(sourceRoot,p),'utf8'));
export function merge(base,patch){const result=structuredClone(base);for(const [k,v]of Object.entries(patch)){if(v&&typeof v==='object'&&!Array.isArray(v)){result[k]=merge(result[k]??{},v);}else result[k]=structuredClone(v);}return result;}
export function loadDesigns(catalog=readJSON('designs/catalog.json')){
 if(catalog.version!==1||!Array.isArray(catalog.designs)||!catalog.designs.length)throw Error('Invalid catalog structure');
 const ids=new Set();const shared=readJSON('tokens/foundations.json'),roles=readJSON('tokens/semantic.json');
 const designs=catalog.designs.map(entry=>{
  if(!/^[a-z][a-z0-9-]*$/.test(entry.id)||ids.has(entry.id))throw Error('Invalid/duplicate design ID: '+entry.id);ids.add(entry.id);
  const definition=readJSON(`designs/${entry.id}/design.json`);
  if(definition.id!==entry.id)throw Error('Design ID mismatch: '+entry.id);
  for(const key of ['name','description','guidance'])if(typeof definition[key]!=='string'||!definition[key].trim())throw Error('Missing '+key+': '+entry.id);
  for(const key of ['design-radius-card','design-radius-button','design-heading-family','design-body-family','design-content-width','design-section-gap','design-shadow-panel',"design-text-small","design-text-caption","design-title-size-mobile","design-press-offset","design-page-padding","design-panel-padding","design-row-padding","design-radius-input","design-title-size","design-heading-tracking","design-transition-duration"])if(typeof definition.appearance?.[key]!=='string')throw Error('Missing appearance '+key+': '+entry.id);
  const modes=Object.keys(definition.modes);if(!modes.length||modes.some(m=>!['light','dark'].includes(m))||!modes.includes(definition.defaultMode))throw Error('Invalid modes: '+entry.id);
  const semantic=Object.fromEntries(modes.map(mode=>[mode,{...roles[mode],...definition.modes[mode]}]));
  for(const mode of modes){if(Object.keys(semantic[mode]).length!==Object.keys(roles[mode]).length)throw Error('Unknown semantic role: '+entry.id);for(const v of Object.values(semantic[mode]))if(typeof v!=='string'||!/^var\(--color-[a-z0-9-]+\)$/.test(v))throw Error('Invalid semantic alias: '+entry.id);}
  const foundation=merge(shared,definition.foundations??{});
  return {...definition,modes:semantic,foundation};
 });
 const selected=designs.find(d=>d.id===catalog.defaultDesign);if(!selected||!Object.hasOwn(selected.modes,catalog.defaultMode))throw Error('Invalid catalog default design/mode');
 return {catalog,designs};
}
