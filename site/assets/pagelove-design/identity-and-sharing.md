# App identity, favicons and social images

An app owns its name and mark. A design supplies the presentation. Keep the identity recognizable when switching between Classic, Editorial, Forest, Midnight and Invitation. The catalog chooses the default design and mode; currently Midnight/dark. Do not reuse the sample identity as a claim of Pagelove affiliation.

## Start here

1. Edit [branding/site.json](../branding/site.json): app name, description, public base URL, language/locale, icon colors, social title/label and optional page overrides. The reserved example.com address is illustrative. A deployment under a subpath needs the full trailing-slash base, such as `https://example.com/product/`.
2. Replace [branding/mark.svg](../branding/mark.svg) with a simple original or licensed mark. Use a `0 0 64 64` viewBox and self-contained vector shapes. Use `currentColor` for a monochrome identity; no scripts, external images, fonts or linked content. Do not put a wordmark or slogan in a tiny favicon.
3. Edit [branding/templates.json](../branding/templates.json) only for composition changes. Colors and font families come from each design's resolved tokens. Add a template entry when registering a new design. The renderer lives in [scripts/branding.mjs](../scripts/branding.mjs).
4. Run `npm ci`, then `npm run build` and `npm run check`. Development-only image libraries and bundled fonts produce the files; consuming the exported PNG/SVG/ICO and HTML needs no Node runtime or image service.
5. Open [the asset preview](../examples/branding.html) using `npm run serve`. Copy the assets and apply the generated metadata in your app. Publish only after checking the real URLs.

Never independently edit generated files. The source mark, site content, template settings and design tokens are the authorities. Source JSON is build configuration, not a recommendation to replace document-first app content.

The asset index records generated files. Rebuilding removes previously recorded outputs for deleted pages or modes, leaving unrelated files alone. Keep your original custom artwork outside these generated paths.

## Files and intended uses

| File | Purpose |
| --- | --- |
| `assets/identity/favicon.svg` | Scalable browser icon with a stable opaque background |
| `assets/identity/favicon.ico` | 16/32/48px PNG-backed ICO fallback for browsers |
| `assets/identity/favicon-16.png`, `favicon-32.png`, `favicon-48.png` | Tiny-size review and consumers that need PNG |
| `assets/identity/apple-touch-icon.png` | Opaque 180px home-screen icon; let the platform apply its mask |
| `assets/identity/icon-192.png`, `icon-512.png` | General web app icons |
| `assets/identity/maskable-512.png` | Full-background icon with the mark inside the central safe circle |
| `assets/identity/site.webmanifest` | App name, scope, start URL, icon purposes and theme color; not a service worker or proof of installability |
| `designs/ID/assets/social/MODE.png` | Ready-to-publish 1200×630 social image for a supported design/mode |
| Matching `.source.svg` | Editable text/vector source; install the bundled font families to edit accurately |
| Matching `.svg` | Outlined text/vector export; needs no installed font to display |
| Matching `.layout.json` | Review record of selected fonts, wrapped lines and size |
| `assets/social/default.png` | Copy of the catalog's default design/mode image |
| `assets/social/light.png` or `dark.png` | Root aliases for the selected design's supported modes |
| `assets/social/pages/SLUG.png` | Optional generated page image, with matching SVG sources |
| `assets/metadata/default.json`, `default.head.html` | Structured default metadata and plain HTML head fragment |
| `assets/metadata/SLUG.json`, `SLUG.head.html` | Page metadata with its own canonical URL and image choice |
| `assets/social/index.json` | Machine-readable design variants, default and metadata entry points |

SVG is an editing/vector interchange format here. Use PNG for the supplied social images; do not assume a social service accepts SVG. The generated ICO contains modern PNG payloads, not legacy Windows bitmap payloads. Do not rename it to an Apple or Android icon format.

## Favicon design contract

Use one recognizable silhouette, substantial strokes and ample space. Inspect the actual 16px output before judging a large source drawing. The sample uses a high-contrast opaque tile so it remains recognizable in light and dark browser chrome. Its colors belong to app identity and do not change when the catalog default changes.

For an adaptive SVG, preserve the silhouette and define explicit light/dark colors inside the SVG with `prefers-color-scheme`. Browser chrome preferences and an in-page theme toggle can differ. Keep a usable static fallback and test target browsers; adaptive export is not part of this generator.

The generator scales the 64px source into the central 48px square. For arbitrary replacement artwork, a square's corners can extend beyond a maskable icon's safe circle: keep important source geometry inside the circle centered at (32,32), radius 34 source units (which becomes 25.5 output units). Inspect the circular crop as well as rounded-square masks. Leave the background full bleed. The sample mark fits this area. Keep icon contrast high; the checks require at least 3:1 between configured foreground and background.

Home-screen icons have different jobs from a browser favicon. Preserve separate size/purpose declarations even when sharing artwork. Do not infer native app-store icon, platform splash-screen or installability compliance from these web exports.

## Social-image design contract

The supplied landscape canvas is 1200×630. This is a practical default, not a guarantee about every platform's crop. Keep critical content at least 64px from the canvas edges. The frame may extend beyond that area; app identity, title and description may not. Test landscape previews and square center crops. A square crop may remove the brand at the top left; if square presentation is required, provide a separately composed square custom image instead of shrinking the whole landscape design.

The five templates share the app mark and content but vary typography, alignment, surface treatment and frame geometry. Invitation centers its title, Forest uses a softly rounded surface, Editorial separates the masthead, and Classic/Midnight use restrained rules with their respective serif/sans typography. Every supported light/dark mode is generated explicitly. Social crawlers receive a fixed image URL; a visitor's later theme toggle does not select another scraped image.

The title can wrap to three lines, reducing from the template size to 48px. The description allows two lines down to 22px. Long words break by grapheme. Content that still does not fit fails generation instead of being silently clipped. Exact local font metrics determine wrapping. Outlined SVGs and PNGs preserve those shapes without system-font fallback; editable SVGs retain live text and need the fonts installed.

The bundled fonts cover a limited character set. Unsupported glyphs, including many emoji and writing systems, fail explicitly. Supply appropriate licensed fonts and register them in the renderer, or use a custom image. This release does not certify complex-script/RTL image composition. Keep generated image alt text meaningful; custom images require an explicit description.

## Default and page overrides

Every page gets the site image unless it supplies one of these alternatives in `branding/site.json`:

```json
{
  "slug": "release-notes",
  "path": "releases/",
  "title": "What changed this month",
  "description": "Improvements to your everyday work.",
  "generateImage": true,
  "design": "forest",
  "mode": "dark"
}
```

With an explicit design and no mode, use that design's default mode. With neither, use the catalog defaults. Unknown designs, unavailable modes, duplicate slugs and conflicting custom/generated images fail validation. Page paths are relative to the public base URL; the slug is only the safe output filename. If `generateImage` is omitted/false, the root default image remains the fallback even when the page title differs.

For a hand-designed image, omit `generateImage`, `design` and `mode`, and supply `image` with an absolute HTTP(S) `url` and descriptive `alt`. Supply its true `width`, `height` and MIME `type` when known. The build does not fetch or validate remote images. Custom imagery takes precedence over the site fallback. Do not put private content into public preview images.

## Metadata and integration

Copy the identity assets under the public base's `assets/identity/` and social images at the paths recorded in the generated metadata. Copy all referenced files, including manifest icons. The default requires `assets/social/default.png`; a page can instead reference `assets/social/pages/SLUG.png`. Per-design files can be used explicitly. Keep the actual deployment path and configured URL consistent.

Insert the generated `.head.html` contents inside the document's existing `<head>`, alongside charset and viewport declarations. It includes title, description, canonical URL, favicon/touch-icon links, web manifest, theme color, Open Graph and large-image Twitter/X card metadata. Width, height, MIME type and image alt text accompany generated images. Values are escaped. Do not duplicate the same fields through another SEO plugin.

For other templates or frameworks, [components/metadata.mjs](../components/metadata.mjs) exposes dependency-free `createMetadata`, `renderHead`, `toNextMetadata` and `toNuxtHead` helpers. They consume the same structured metadata; there is no framework lock-in.

Next.js App Router example in `app/layout.js` (copy the helper into your root components folder):

```js
import page from '../public/assets/metadata/default.json';
import {toNextMetadata} from '../components/metadata.mjs';
export const metadata = toNextMetadata(page);
export const viewport = {themeColor: page.themeColor};
```

For an individual route, use its page JSON instead. Avoid competing file-based icon/OG conventions if using these explicit declarations. Next.js metadata objects replace nested objects across routes; return a complete page-specific Open Graph object through the adapter.

Nuxt example inside a layout/page:

```js
import page from '~~/public/assets/metadata/default.json';
import {toNuxtHead} from '~~/components/metadata.mjs';
useHead(toNuxtHead(page));
```

Render metadata in the initial HTML or the framework's supported crawler-aware metadata path. Client-only changes after navigation are insufficient evidence of a working social preview. The framework adapters are examples with structural checks; full Next/Nuxt app builds and live crawler fetches remain consumer verification tasks.

## Verification before publishing

- Inspect all eight design/mode PNGs, 16/32/48px icons on light/dark backgrounds, and the circular maskable crop. Review long titles and punctuation as well as normal content.
- Confirm every metadata URL resolves publicly without authentication, returns the intended file and correct content type, and survives your hosting base path. Check canonical URLs and image alt text in the fetched HTML.
- Inspect crop previews, readability at feed size and file weight. Repository checks cap each generated social PNG below 1 MB; that is a project budget, not a platform-wide limit.
- Use the target platforms' preview/debugging tools after deployment. Cached previews can persist; use a versioned filename/URL for a changed image and re-scrape where supported.
- Test home-screen installation and browser favicon caching on the actual devices you support. Replacing a file does not prove an already-cached icon changed.

`npm run check:branding` validates the emitted assets, metadata, override/default rules, fitting and escaping. `npm run test:browser` adds local HTTP asset/type checks, image decoding, responsive preview, accessibility and rendered captures in the configured engines. These checks do not substitute for real social-platform previews, physical-device icon installation or native app-store validation.

## References

- [GOV.UK Frontend identity assets](https://frontend.design-system.service.gov.uk/using-govuk-frontend-without-govuk-branding/): an integrated favicon/mobile-icon/sharing-image kit.
- [Open Graph protocol](https://ogp.me/): image properties and structured metadata.
- [Next.js metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images): file conventions, overrides and generated images.
- [Nuxt OG Image](https://nuxtseo.com/docs/og-image/getting-started/introduction): optional template-based generation for Nuxt consumers.
- [Maskable icon guidance](https://web.dev/articles/maskable-icon): purpose declarations and safe-zone behavior.

All newly authored templates, sample mark and guidance are MIT licensed. Bundled typefaces retain their OFL notices; keep those notices when redistributing font files. This kit conveys no right to third-party trademarks.
