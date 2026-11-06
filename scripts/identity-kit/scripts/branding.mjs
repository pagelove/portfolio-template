import fs from 'node:fs';
import path from 'node:path';
import {Resvg} from '@resvg/resvg-js';
import {openSync} from 'fontkit';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {XMLValidator} from 'fast-xml-parser';
import {sourceRoot, readJSON} from './designs.mjs';
import {createMetadata, renderHead, escapeAttribute as esc, webURL} from '../components/metadata.mjs';
import {renderBrandingPreview} from './branding-preview.mjs';

const fontFiles = {'Inter': 'inter', 'Inter Tight': 'intertight', 'Source Serif 4': 'sourceserif4', 'Fraunces': 'fraunces', 'Fira Code': 'firacode', 'JetBrains Mono': 'jetbrainsmono'};
const fonts = new Map();
const ajv = new Ajv({allErrors: true});
addFormats(ajv);
const validate = ajv.compile(readJSON('schemas/branding.schema.json'));
export function validateSite(site, catalog, designs) {
  if (!validate(site)) throw new Error('Invalid branding/site.json: ' + ajv.errorsText(validate.errors));
  const base = webURL(site.url), url = new URL(base), seen = new Set();
  if (!base.endsWith('/') || url.search || url.hash) throw new Error('Site URL must end in / with no query or fragment');
  for (const page of site.pages) {
    if (seen.has(page.slug)) throw new Error('Duplicate page slug: ' + page.slug);
    seen.add(page.slug);
    if (page.slug === 'default') throw new Error('The page slug default is reserved');
    if (/^(?:[a-z]+:|\/|\\)/i.test(page.path) || /(?:^|\/)\.\.(?:\/|$)/.test(page.path)) throw new Error('Page paths must be relative to the site base');
    const target = new URL(webURL(page.path, base));
    if (target.origin !== url.origin || !target.pathname.startsWith(url.pathname) || target.hash) throw new Error('Page URL must remain in the site base, without a fragment');
    const design = designs.find(d => d.id === (page.design || catalog.defaultDesign));
    const mode = page.mode || (page.design ? design?.defaultMode : catalog.defaultMode);
    if (!design || !design.modes[mode]) throw new Error('Unsupported page design/mode: ' + page.slug);
    if ((page.design || page.mode) && !page.generateImage) throw new Error('Page design/mode requires generateImage: true');
    if (page.image) {
      webURL(page.image.url);
      if (page.generateImage) throw new Error('Choose a custom image OR generateImage');
    }
  }
  return site;
}

function getFont(stack, weight) {
  const family = stack.split(',')[0].replace(/["']/g, '').trim();
  if (!fontFiles[family]) throw new Error('Register a bundled social-image font for ' + family);
  const key = fontFiles[family] + '-' + weight;
  if (!fonts.has(key)) fonts.set(key, openSync(path.join(sourceRoot, 'assets/fonts', key + '.ttf')));
  return {font: fonts.get(key), family};
}

const normalText = value => String(value).normalize('NFC').replace(/\s+/gu, ' ').trim();
function glyphRun(text, font) {
  for (const char of text) if (!font.hasGlyphForCodePoint(char.codePointAt(0))) throw new Error('Bundled font lacks ' + JSON.stringify(char) + '; supply a suitable font or a custom image');
  const run = font.layout(text);
  if (run.glyphs.some(g => g.id === 0)) throw new Error('Unrenderable social-image text');
  return run;
}
function width(text, font, size) {return glyphRun(text, font).advanceWidth * size / font.unitsPerEm;}

export function fitText(text, font, {size, minSize, maxWidth, maxLines}) {
  text = normalText(text);
  if (!text) throw new Error('Image text cannot be empty');
  for (let px = size; px >= minSize; px -= 2) {
    const lines = [];
    let line = '';
    for (const word of text.split(' ')) {
      const candidate = line ? line + ' ' + word : word;
      if (width(candidate, font, px) <= maxWidth) {line = candidate; continue;}
      if (line) {lines.push(line); line = '';}
      // Break long URLs/identifiers by grapheme instead of overflowing or clipping.
      for (const {segment} of new Intl.Segmenter(undefined, {granularity: 'grapheme'}).segment(word)) {
        if (line && width(line + segment, font, px) > maxWidth) {lines.push(line); line = '';}
        line += segment;
      }
    }
    if (line) lines.push(line);
    if (lines.length <= maxLines && lines.every(row => width(row, font, px) <= maxWidth)) {
      // Avoid a lonely final word when moving a word reduces the widest line.
      if (lines.length > 1) {
        const i = lines.length - 2;
        while (lines[i].includes(' ')) {
          const words = lines[i].split(' '), word = words.pop();
          const previous = words.join(' '), last = word + ' ' + lines[i + 1];
          const oldWidth = Math.max(width(lines[i], font, px), width(lines[i + 1], font, px));
          if (Math.max(width(previous, font, px), width(last, font, px)) >= oldWidth) break;
          lines[i] = previous; lines[i + 1] = last;
        }
      }
      return {lines, size: px};
    }
  }
  throw new Error('Social-image text does not fit; shorten it or supply a custom image');
}

function textLayer(text, fontInfo, size, x, y, color, align = 'left') {
  const {font, family} = fontInfo, run = glyphRun(text, font), scale = size / font.unitsPerEm;
  const start = x - (align === 'center' ? run.advanceWidth * scale / 2 : 0);
  let cursor = 0;
  const paths = run.glyphs.map((glyph, i) => {
    const position = run.positions[i];
    const output = '<path transform="translate(' + (start + (cursor + position.xOffset) * scale).toFixed(4) + ' ' + (y - position.yOffset * scale).toFixed(4) + ') scale(' + scale.toFixed(8) + ' ' + (-scale).toFixed(8) + ')" d="' + glyph.path.toSVG() + '"/>';
    cursor += position.xAdvance;
    return output;
  }).join('');
  return {
    outlined: '<g fill="' + color + '" aria-label="' + esc(text) + '">' + paths + '</g>',
    editable: '<text x="' + x + '" y="' + y + '" fill="' + color + '" font-family="' + esc(family) + '" font-size="' + size + '" font-weight="' + font['OS/2'].usWeightClass + '" text-anchor="' + (align === 'center' ? 'middle' : 'start') + '">' + esc(text) + '</text>'
  };
}

export function readMark(filename = path.join(sourceRoot, 'branding/mark.svg')) {
  const svg = fs.readFileSync(filename, 'utf8');
  if (XMLValidator.validate(svg) !== true || !/viewBox="0 0 64 64"/.test(svg)) throw new Error('Mark must be valid SVG with viewBox="0 0 64 64"');
  if (/<\s*(?:script|style|image|use|foreignObject|text|animate|set)\b|\bon\w+\s*=|\b(?:href|src)\s*=|url\s*\(|<!DOCTYPE|<!ENTITY/i.test(svg)) throw new Error('Mark must contain static, self-contained vector geometry');
  return svg.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<!--[\s\S]*?-->/g, '').trim();
}

export function iconSVG(site, mark) {
  // The opaque square survives light/dark tabs. Maskable foreground sits inside r=0.4w.
  return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 64 64"><title>' + esc(site.name) + '</title><rect width="64" height="64" fill="' + site.icon.background + '"/><g transform="translate(8 8) scale(.75)" color="' + site.icon.foreground + '" fill="' + site.icon.foreground + '">' + mark + '</g></svg>\n';
}

export function rasterize(svg, width) {
  return new Resvg(svg, {font: {loadSystemFonts: false}, ...(width ? {fitTo: {mode: 'width', value: width}} : {})}).render().asPng();
}

export function icoFile(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({size, png}, i) => {
    const at = 6 + i * 16;
    header[at] = size; header[at + 1] = size;
    header.writeUInt16LE(1, at + 4); header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(png.length, at + 8); header.writeUInt32LE(offset, at + 12); offset += png.length;
  });
  return Buffer.concat([header, ...images.map(image => image.png)]);
}

export function socialSVG({design, mode, values, site, mark, template, page = {}}) {
  if (!template || !['left', 'center'].includes(template.align) || !['rule', 'editorial', 'panel', 'invitation'].includes(template.frame)) throw new Error('Missing/invalid social template for ' + design.id);
  const heading = getFont(values['design-heading-family'], template.titleWeight);
  const body = getFont(values['design-body-family'], 400);
  const title = normalText(page.title || site.social.title), description = normalText(page.description || site.description);
  const fitted = fitText(title, heading.font, {size: template.titleSize, minSize: 48, maxWidth: 1008, maxLines: 3});
  const detail = fitText(description, body.font, {size: 26, minSize: 22, maxWidth: 1008, maxLines: 2});
  const brand = fitText(site.name, body.font, {size: 26, minSize: 18, maxWidth: 440, maxLines: 1});
  const label = fitText(site.social.label, body.font, {size: 18, minSize: 16, maxWidth: 450, maxLines: 1});
  const background = values['background-surface-light'], foreground = values['text-regular'], muted = values['text-light'];
  let shapes = '<rect width="1200" height="630" fill="' + background + '"/>';
  if (template.frame === 'panel') shapes += '<rect x="32" y="32" width="1136" height="566" rx="' + Math.min(40, parseFloat(values['design-radius-card']) * 2) + '" fill="' + values['background-surface-regular'] + '" stroke="' + values['border-regular'] + '"/>';
  if (['rule', 'editorial'].includes(template.frame)) shapes += '<path d="M80 147H1120" stroke="' + values['border-regular'] + '"/>';
  if (template.frame === 'invitation') shapes += '<rect x="32" y="32" width="1136" height="566" rx="' + parseFloat(values['design-radius-card']) + '" fill="none" stroke="' + values['border-regular'] + '"/>';
  shapes += '<g transform="translate(76 72) scale(.625)" color="' + foreground + '" fill="' + foreground + '">' + mark + '</g>';
  const layers = [textLayer(brand.lines[0], body, brand.size, 130, 101, foreground)];
  layers.push(textLayer(label.lines[0], body, label.size, 1120 - width(label.lines[0], body.font, label.size), 99, muted));
  const lineHeight = fitted.size * 1.13, blockHeight = fitted.lines.length * lineHeight;
  const firstBaseline = 188 + (246 - blockHeight) / 2 + fitted.size;
  const x = template.align === 'center' ? 600 : 80;
  fitted.lines.forEach((line, i) => layers.push(textLayer(line, heading, fitted.size, x, firstBaseline + i * lineHeight, foreground, template.align)));
  detail.lines.forEach((line, i) => layers.push(textLayer(line, body, detail.size, x, 500 + i * 34, muted, template.align)));
  const alt = site.name + ' — ' + title;
  const wrap = content => '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title"><title id="title">' + esc(alt) + '</title>' + shapes + content + '</svg>\n';
  return {svg: wrap(layers.map(layer => layer.outlined).join('')), source: wrap(layers.map(layer => layer.editable).join('')), alt, layout: {design: design.id, mode, titleLines: fitted.lines, titleSize: fitted.size, descriptionLines: detail.lines, fonts: [heading.family, body.family], safeInset: 64}};
}

export function buildBranding({catalog, designs, built, outputRoot, site = readJSON('branding/site.json'), mark = readMark()}) {
  validateSite(site, catalog, designs);
  const templates = readJSON('branding/templates.json');
  const indexPath = path.join(outputRoot, 'assets/social/index.json');
  const previousFiles = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')).generatedFiles || [] : [];
  const generatedFiles = new Set();
  const put = (filename, content) => {const file = path.join(outputRoot, filename); fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, content); generatedFiles.add(filename);};
  const json = (filename, content) => put(filename, JSON.stringify(content, null, 2) + '\n');
  const icon = iconSVG(site, mark), icons = [16, 32, 48].map(size => ({size, png: rasterize(icon, size)}));
  put('assets/identity/favicon.svg', icon);
  put('assets/identity/favicon.ico', icoFile(icons));
  for (const {size, png} of icons) put('assets/identity/favicon-' + size + '.png', png);
  for (const [filename, size] of [['apple-touch-icon', 180], ['icon-192', 192], ['icon-512', 512], ['maskable-512', 512]]) put('assets/identity/' + filename + '.png', rasterize(icon, size));
  json('assets/identity/site.webmanifest', {id: site.url, name: site.name, short_name: site.shortName, description: site.description, lang: site.lang, start_url: site.url, scope: site.url, display: 'standalone', background_color: site.icon.background, theme_color: site.icon.background, icons: [{src: './icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'}, {src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'}, {src: './maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'}]});
  const rows = [];
  const exportImage = (design, mode, prefix, page = {}) => {
    const image = socialSVG({design, mode, values: built.get(design.id).resolved[mode], site, mark, template: templates[design.id], page});
    put(prefix + '.svg', image.svg); put(prefix + '.source.svg', image.source); put(prefix + '.png', rasterize(image.svg));
    json(prefix + '.layout.json', image.layout);
    return {url: webURL(prefix + '.png', site.url), width: 1200, height: 630, type: 'image/png', alt: image.alt};
  };
  for (const design of designs) for (const mode of Object.keys(design.modes)) {
    const prefix = 'designs/' + design.id + '/assets/social/' + mode;
    const image = exportImage(design, mode, prefix);
    rows.push({design: design.id, name: design.name, mode, prefix, image});
  }
  const selected = rows.find(row => row.design === catalog.defaultDesign && row.mode === catalog.defaultMode);
  for (const mode of ['light', 'dark']) for (const suffix of ['.svg', '.source.svg', '.png', '.layout.json']) {
    const row = rows.find(item => item.design === catalog.defaultDesign && item.mode === mode);
    const target = 'assets/social/' + mode + suffix;
    if (row) put(target, fs.readFileSync(path.join(outputRoot, row.prefix + suffix)));
    else if (fs.existsSync(path.join(outputRoot, target))) fs.unlinkSync(path.join(outputRoot, target));
  }
  for (const suffix of ['.svg', '.source.svg', '.png', '.layout.json']) put('assets/social/default' + suffix, fs.readFileSync(path.join(outputRoot, selected.prefix + suffix)));
  const fallback = {...selected.image, url: webURL('assets/social/default.png', site.url)};
  const rootMetadata = createMetadata({site, image: fallback});
  const pages = [{slug: 'default', metadata: rootMetadata}];
  for (const page of site.pages) {
    const design = designs.find(d => d.id === (page.design || catalog.defaultDesign));
    const mode = page.mode || (page.design ? design.defaultMode : catalog.defaultMode);
    const image = page.image || (page.generateImage ? exportImage(design, mode, 'assets/social/pages/' + page.slug, page) : fallback);
    pages.push({slug: page.slug, metadata: createMetadata({site, page, image})});
  }
  for (const {slug, metadata} of pages) {
    json('assets/metadata/' + slug + '.json', metadata);
    put('assets/metadata/' + slug + '.head.html', '<!-- Generated head fragment. Configure the public site URL before publishing. -->\n' + renderHead(metadata) + '\n');
  }
  put('examples/branding.html', renderBrandingPreview({rows, selected, site, pages}));
  generatedFiles.add('assets/social/index.json');
  json('assets/social/index.json', {defaultDesign: catalog.defaultDesign, defaultMode: catalog.defaultMode, defaultImage: fallback, designs: rows, pages: pages.map(({slug}) => 'assets/metadata/' + slug + '.json'), generatedFiles: [...generatedFiles].sort()});
  // Delete only previously declared generated files, never arbitrary app assets.
  const realRoot = fs.realpathSync(outputRoot);
  for (const filename of previousFiles.filter(file => !generatedFiles.has(file))) {
    if (typeof filename !== 'string' || filename.split('/').includes('..') || !/^(?:assets\/(?:identity|metadata|social)\/[a-z0-9./-]+|designs\/[a-z0-9-]+\/assets\/social\/[a-z0-9.-]+|examples\/branding\.html)$/.test(filename)) throw new Error('Invalid generated asset record');
    const file = path.resolve(outputRoot, filename);
    if (!file.startsWith(path.resolve(outputRoot) + path.sep)) throw new Error('Generated asset outside output root');
    if (fs.existsSync(file)) {
      if (!fs.realpathSync(path.dirname(file)).startsWith(realRoot + path.sep)) throw new Error('Generated asset directory outside output root');
      fs.unlinkSync(file);
    }
  }
  return {designModes: rows.length, pages: pages.length};
}
