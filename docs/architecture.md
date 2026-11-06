# Alex Morgan: document-first contract

Guide: Document-first development edition 2.4 (Pagelove, CC BY 4.0). Apply W1–W8 and applicable R01–R12. Source: /records/content.html, section#records[data-app="portfolio"][data-format="1"]. Ordered bounded aggregate, ≤500 records and2MB UTF-8. Stable r-UUID IDs; typed HTML itemtype urn:Pagelove:portfolio:Record:1. Allowed fields/types/bounds: site/config.mjs. Unknown versions/fields/attributes and executable markup are rejected without replacement.

Working DOM is the only editable domain model. View cards are derived and nonauthoritative; controls are outside persisted content. Current form properties produce a validated cloned candidate; Cancel applies nothing. Whole-aggregate conditional PUT has one revision boundary; root GET establishes a strong ETag. No automatic retry after ambiguous writes. Draft HTML snapshot packages in sessionStorage are local recovery only, keyed by app/origin/path; this demo supports one example actor per origin. Authenticated multi-account deployments require actor-scoped recovery and logout cleanup before private use.

A local fixture serializes CAS writes, validates shape and bounds, and persists to ignored .preview-state. It binds loopback, validates Host/Origin and requires If-Match. This fixture is not production authorization. Shared application routes and protected reads/writes must be configured and verified on the target host. Owner DAV is trusted authoring, separate from application validation. No owner tokens are embedded or collected by the browser.

PUBLICATION: Published/Draft here is a view filter, not a security boundary. Private draft content requires separately protected resources and live source/export checks before real confidential drafts are used.

Versioning: format1, behavior1, app0.1; source ETag varies per accepted snapshot. Dates are civil calendar dates; timezone is explicit for booking. Budget uses integer USD cents; fitness uses minutes/km. Derived totals rebuild from records and do not mutate source. No service worker, background delivery or offline shared-write queue.

Operations: GET aggregate; local create/update/delete/reorder/import; conditional aggregate PUT; private export with explicit user action. Deletes remove from the draft until accepted save; export before destructive edits. Concurrency: stale412 preserves draft; missing strong revision disables save. Release code separately from source records; seeds create-only. See deployment.md and REVIEW.md for actual evidence.

## Typed site settings

Optional stable article#r-settings, itemtype Settings:1, shares the same aggregate revision. Its field contract is config.settings. Legacy format1 aggregates without it are accepted; the explicit settings form creates it from visible defaults only when applied. Unknown/duplicate settings reject. Identity/profile, reporting periods/goals and availability are domain content in HTML, never a parallel editable configuration store. Controls render from config contracts; applied values serialize from form properties. Transfer transactions are excluded from budget income/expense totals; category limits use one unique category|USD amount per line. Weekly fitness reports use Monday–Sunday civil dates in the chosen calendar timezone; date records have no inferred clock time. Publication states remain a view filter pending protected-source deployment.

## Edition2.4 review hardening
Complete format1 imports/fixture writes require one records aggregate as the sole body element; ambiguous roots, unrelated body content and duplicate DOM identities are rejected before replacement. Current source and HTML export remain usable when session recovery storage is blocked or full. A verified save remains verified even if clearing the old local recovery copy fails; the interface reports that limitation. Recovery contains HTML snapshots only and never becomes a competing model. See tests/document-first.test.mjs and audit/CHANGELOG.md for current evidence.

The current edition2.4 scope and maintenance acceptance record is DOCUMENT-FIRST-REVIEW.md at repository root. It distinguishes local passes from live/privacy/device gates.

## Identity and sharing build
Runtime domain authority remains the HTML aggregate. The sharing build derives public display name/headline/about from its Settings record; branding/site.json provides deployment, stable icon identity and template fallbacks. Generated head/OG/icon exports are derived publication assets, not another editable domain model. Rebuild static metadata after changing source settings or the deployment URL. No private source details enter OG images.
