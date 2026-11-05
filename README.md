# Alex Morgan

A fictional designer’s collection of interfaces, systems and carefully considered details.

Fictional sample application for Pagelove. Source records are readable/editable semantic HTML; the browser edits a scoped DOM and saves only with a strong source precondition.

## Run

Node22+; install development dependencies with `bun install --ignore-scripts` (or `npm install --ignore-scripts`), then run `node scripts/check.mjs`, `node --test tests/*.test.mjs` and `node scripts/preview.mjs`. Open http://127.0.0.1:4174/. The loopback fixture stores changes in ignored .preview-state/. Production has no package install; linkedom is a development validator.

## Tasks

Search projects; Manage content; Add project; Apply to draft; Save changes. Edit/reorder/remove existing entries. Export/import validated HTML, recover a local draft, and reconcile conflicts without automatic overwrite. Published view filters drafts; it does not protect their source.

## Scope and readiness

Live mutation, permission and restore checks remain pending. This is an implementation candidate, not a verified production deployment. See [architecture](docs/architecture.md), [deployment](docs/deployment.md), [design](DESIGN.md) and [review](REVIEW.md).

## Design

Uses [Pagelove design-system](https://github.com/pagelove/design-system) at 0ca2336353647b8d2d726470046617163bbf6d67; all styles served locally. No credentials, external APIs or runtime CDN. Code/style license MIT; uploaded media retains its own rights.

## Site details and reports

Manage content reveals Edit profile/preferences. Changes to business identity, contact hours, biography, reporting month/category limits, weekly goals or service availability share the same HTML draft and conditional save as records. Category/tag/album and date controls filter derived views. Budget transfers are excluded from spending totals; fitness reports use Monday–Sunday civil dates; photo galleries include a keyboard viewer. Only controls relevant to this app are shown.

The initial GitHub source is a reviewable candidate. The live editor is deliberately read-only until a supported authenticated persistence adapter is verified. Fictional loopback editing is available now; a DAV upload alone is not that adapter. No real confidential records should be placed in this template yet.
