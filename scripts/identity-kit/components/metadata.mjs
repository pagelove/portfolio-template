// Framework-neutral head metadata. No runtime dependencies or network requests.
export const escapeAttribute = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function webURL(value, base) {
  const url = new URL(value, base);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Expected an HTTP(S) URL without credentials');
  return url.href;
}

export function createMetadata({site, page = {}, image}) {
  const base = webURL(site.url);
  if (!base.endsWith('/') || new URL(base).search || new URL(base).hash) throw new Error('Site URL must end in / with no query or fragment');
  if (!image?.alt?.trim()) throw new Error('A social image needs descriptive alt text');
  const result = {
    title: page.title || site.social.title,
    description: page.description || site.description,
    siteName: site.name,
    locale: site.locale,
    url: webURL(page.path || '', base),
    themeColor: site.icon.background,
    image: {...image, url: webURL(image.url, base)},
    icons: {
      svg: webURL('assets/identity/favicon.svg', base),
      ico: webURL('assets/identity/favicon.ico', base),
      apple: webURL('assets/identity/apple-touch-icon.png', base)
    },
    manifest: webURL('assets/identity/site.webmanifest', base)
  };
  if (!result.title?.trim() || !result.description?.trim()) throw new Error('Title and description are required');
  for (const key of ['width', 'height']) if (result.image[key] !== undefined && (!Number.isInteger(result.image[key]) || result.image[key] < 1)) throw new Error('Invalid image ' + key);
  return result;
}

export function headElements(meta) {
  const rows = [
    ['meta', {name: 'description', content: meta.description}],
    ['link', {rel: 'canonical', href: meta.url}],
    ['link', {rel: 'icon', href: meta.icons.ico, sizes: '16x16 32x32 48x48'}],
    ['link', {rel: 'icon', href: meta.icons.svg, type: 'image/svg+xml', sizes: 'any'}],
    ['link', {rel: 'apple-touch-icon', href: meta.icons.apple, sizes: '180x180'}],
    ['link', {rel: 'manifest', href: meta.manifest}],
    ['meta', {name: 'theme-color', content: meta.themeColor}],
    ...Object.entries({type: 'website', title: meta.title, description: meta.description, url: meta.url, site_name: meta.siteName, locale: meta.locale, image: meta.image.url, 'image:secure_url': meta.image.url.startsWith('https:') ? meta.image.url : undefined, 'image:type': meta.image.type, 'image:width': meta.image.width, 'image:height': meta.image.height, 'image:alt': meta.image.alt}).filter(([,v]) => v !== undefined).map(([key, content]) => ['meta', {property: 'og:' + key, content}]),
    ...Object.entries({card: 'summary_large_image', title: meta.title, description: meta.description, image: meta.image.url, 'image:alt': meta.image.alt}).map(([key, content]) => ['meta', {name: 'twitter:' + key, content}])
  ];
  return rows;
}

export function renderHead(meta) {
  return '<title>' + escapeAttribute(meta.title) + '</title>\n' + headElements(meta).map(([tag, attrs]) => '<' + tag + ' ' + Object.entries(attrs).map(([k,v]) => k + '="' + escapeAttribute(v) + '"').join(' ') + '>').join('\n');
}

// Copy these adapters into the consuming app; run its own framework build.
export function toNextMetadata(meta) {
  return {title: meta.title, description: meta.description, alternates: {canonical: meta.url}, icons: {icon: [{url: meta.icons.ico, sizes: '16x16 32x32 48x48'}, {url: meta.icons.svg, type: 'image/svg+xml', sizes: 'any'}], apple: [{url: meta.icons.apple, sizes: '180x180'}]}, manifest: meta.manifest, openGraph: {type: 'website', title: meta.title, description: meta.description, url: meta.url, siteName: meta.siteName, locale: meta.locale, images: [{...meta.image}]}, twitter: {card: 'summary_large_image', title: meta.title, description: meta.description, images: [{url: meta.image.url, alt: meta.image.alt}]}};
}

export function toNuxtHead(meta) {
  const rows = headElements(meta);
  return {title: meta.title, meta: rows.filter(([tag]) => tag === 'meta').map(([,attrs]) => attrs), link: rows.filter(([tag]) => tag === 'link').map(([,attrs]) => attrs)};
}
