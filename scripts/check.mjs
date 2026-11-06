import fs from 'node:fs/promises';import path from 'node:path';import {DOMParser} from 'linkedom';import {validate,parseDocument} from '../site/model.mjs';import {config} from '../site/config.mjs';
parseDocument(await fs.readFile('site/records/content.html','utf8'),config,DOMParser);
const html=new DOMParser().parseFromString(await fs.readFile('site/index.html','utf8'),'text/html');
const ids=[...html.querySelectorAll('[id]')].map(e=>e.id);if(new Set(ids).size!==ids.length)throw Error('Duplicate interface IDs');
for(const label of html.querySelectorAll('label[for]'))if(!ids.includes(label.getAttribute('for')))throw Error('Broken label');
for(const el of html.querySelectorAll('[src],[href]')){const ref=el.getAttribute('src')||el.getAttribute('href');if(!ref||/^(?:https?:|mailto:|#)/.test(ref))continue;await fs.access(path.resolve('site',ref));}
for(const file of ['README.md','DESIGN.md','ASSETS.md','REVIEW.md','LICENSE','AGENTS.md','pagelove.html','docs/architecture.md','docs/deployment.md','audit/CHANGELOG.md'])await fs.access(file);
console.log('PASS: semantic seed, form IDs/labels, entry dependencies and required project records.');

for(const f of config.fields){
 if(!['text','textarea','select','date','number','money','url','image'].includes(f.type))throw Error('Unknown field contract type: '+f.key);
 const control=html.querySelector('#field-'+f.key);if(!control||control.hasAttribute('required')!==!!f.required)throw Error('Required control parity: '+f.key);
 if(f.options&&JSON.stringify([...control.querySelectorAll('option')].map(e=>e.getAttribute('value')??e.textContent))!==JSON.stringify(f.options))throw Error('Select option parity: '+f.key);
}
console.log('PASS: static record controls match typed contract options and required fields.');
