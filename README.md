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

## Live fictional review

[Open this app preview](https://camel-boom-0460.onpagelove.com/template-review-20261105/portfolio-template/index.html) · [All app previews](https://camel-boom-0460.onpagelove.com/).

The disposable review copy contains only fictional data and is publicly accessible. Source files were staged create-only, then verified through both owner WebDAV and public reads. Browser tasks loaded the deployed app. A390×844 browser viewport was checked; this is emulation, not physical-phone acceptance.

The review loads its sample records; draft editing/export is available and shared Save remains gated. Authentication and private-app access are not accepted merely because this fictional page loads.

Pagelove native authentication has not been shown to fail. A401 on an application route with no matching write grant is not evidence that a separate identity system is required. Owner WebDAV authoring is already authenticated; browser actor/session integration and exact per-app read/write rules remain to be established before enabling protected functions. Public reading and local game play need no account by themselves.

## Slide 4 build and deploy

Use the repository URL, site hostname and private API token supplied in the generated prompt. After adapting and checking the app, run `node scripts/deploy.mjs --prepare`, then `node scripts/deploy.mjs --host YOUR-SITE.onpagelove.com`. The token is entered privately; existing records are retained. See [deployment instructions](docs/deployment.md) for verify/update commands, isolated paths and exact guarantees. No console-session handoff is required for trusted authoring deployment. Published browser code never contains the owner token.

## Document-first development review

Read [the edition2.4 project record](DOCUMENT-FIRST-REVIEW.md) for source authority, operation/recovery contracts, justified runtime exceptions and current acceptance limits. Plans and verification are recorded in audit/CHANGELOG.md. Local tests do not establish live privacy, authorization or physical-device acceptance.

## Current design and sharing assets

See DESIGN.md and branding/README.md. `npm run branding` rebuilds identity and OG assets from the pinned canonical renderer; set branding/site.json to the actual public URL before deploying elsewhere. The linked review demo uses fictional seed data and retains the documented runtime write/privacy limits.
