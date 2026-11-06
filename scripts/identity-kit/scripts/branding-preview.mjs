import {escapeAttribute as esc} from '../components/metadata.mjs';

export function renderBrandingPreview({rows, selected, site, pages}) {
  const ordered = [...rows].sort((a, b) => Number(b === selected) - Number(a === selected));
  const cards = ordered.map(row => `<section>
  <h2>${esc(row.name)} / ${row.mode}${row === selected ? ' · Default' : ''}</h2>
  <img width="1200" height="630" src="../${row.prefix}.png" alt="${esc(row.image.alt)}">
  <p><a href="../${row.prefix}.source.svg">Editable SVG</a> · <a href="../${row.prefix}.svg">Outlined SVG</a> · <a href="../${row.prefix}.png">PNG</a></p>
</section>`).join('\n');
  const pageCards = pages.slice(1).map(({slug, metadata}) => {
    const customImage = site.pages.find(page => page.slug === slug)?.image;
    const localImage = !customImage ? '../' + metadata.image.url.slice(site.url.length) : null;
    return `<section><h3>${esc(metadata.title)}</h3>
${localImage ? `<img width="${metadata.image.width || 1200}" height="${metadata.image.height || 630}" src="${esc(localImage)}" alt="${esc(metadata.image.alt)}">` : `<p><a href="${esc(metadata.image.url)}">Custom image</a></p>`}
<p><a href="../assets/metadata/${slug}.head.html">Page head markup</a> · <a href="../assets/metadata/${slug}.json">Page metadata</a></p></section>`;
  }).join('\n');
  const icons = ['light', 'dark'].map(theme => `<div class="icon-context ${theme}" aria-label="${theme} browser background">${[16, 32, 48].map(size => `<img src="../assets/identity/favicon-${size}.png" width="${size}" height="${size}" alt="Sample favicon at ${size} pixels">`).join('')}</div>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Identity and sharing assets</title>
  <link rel="icon" href="../assets/identity/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../styles/app.css">
  <style>
    body{margin:0;padding:clamp(16px,4vw,56px)}
    main{max-width:1200px;margin:auto}
    h1{font-family:var(--design-heading-family)}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:32px}
    .cards img{display:block;width:100%;height:auto}
    .icons{display:flex;align-items:center;gap:24px;flex-wrap:wrap}
    .icon-context{padding:24px;display:flex;gap:24px;align-items:center}
    .light{background:#fff}.dark{background:#111}
    p{max-width:75ch}h2,h3{font-size:1.25rem}
    a{color:var(--link-text-default)}
  </style>
</head>
<body><main>
  <p><a href="designs.html">Design collection</a> · <a href="../docs/identity-and-sharing.md">Integration guide</a></p>
  <h1>Identity and sharing assets</h1>
  <p>Replaceable sample identity, shown in every supported design and mode. The default is ${esc(selected.name)} / ${selected.mode}. App identity stays consistent when the design changes.</p>
  <h2>One identity, light and dark browser contexts</h2>
  <div class="icons">${icons}</div>
  <p>Source: <a href="../branding/mark.svg">sample mark</a>. Exports: <a href="../assets/identity/favicon.ico">ICO</a>, <a href="../assets/identity/favicon.svg">SVG</a>, <a href="../assets/identity/apple-touch-icon.png">Apple touch icon</a>, <a href="../assets/identity/site.webmanifest">web app manifest</a>.</p>
  <div class="cards">${cards}</div>
  <h2>Default and page metadata</h2>
  <p><a href="../assets/metadata/default.head.html">Default head markup</a> · <a href="../assets/metadata/default.json">Structured metadata</a></p>
  <div class="cards">${pageCards}</div>
  <p>Generated metadata uses the address in branding/site.json. Replace the illustrative identity and reserved example.com URL, rebuild, and check publicly hosted URLs before sharing.</p>
</main></body></html>
`;
}
