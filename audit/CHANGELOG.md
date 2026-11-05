# Change log

## BOOTSTRAP-001 — 2026-11-04T23:32:54.4501976Z
- Actor: Codex; request: Execute the approved template-app development plan.
- Plan: Initialize this application with pinned Pagelove design-system assets, semantic HTML domain sources and DOM-backed editing, app-specific behavior, documented authority/access/recovery, local fixture checks and browser tasks. Preserve any upstream source/licensing. Remote publication and private-data guarantees require separate exact-path verification. No credentials or real personal data in this public repository.
- Files: initial application, docs, tooling and tests (pending); verification pending.

## BOOTSTRAP-002 — 2026-11-04T23:41:05.2840901Z
- Actor: Codex; reference: BOOTSTRAP-001. Implemented HTML/DOM candidate, semantic design assets, current-value editor, conditional saves/readback, session draft recovery, validated import/export, safe URLs, shape bounds and loopback persistence fixture. Shared model checks added. CAS test first compared a changed write with a no-op write; both could legitimately succeed if no-op won. Corrected test to two distinct competing changes, preserving real conflict expectation. npm unavailable; pinned parser installed through Bun. Live acceptance pending.


## DOMAIN-003 — 2026-11-05T03:44:54.0770934Z
Actor: Codex. Plan reference: approved template-app execution, v1 scope. Before implementation: extend the same semantic HTML/CAS aggregate with a typed settings record (identity/contact, profile, reporting goals/period or availability as applicable), owner edit/cancel controls and app-specific collection views. Keep settings outside ordinary records, validate typed fields and exact cardinality, preserve stable IDs. Add budget/weekly derived tables, gallery viewing and category/date filtering without a second editable model. Verify round-trip, invalid settings, totals and affected browser tasks; live authorization still pending. Affected: site/config.mjs, model.mjs, app.mjs, domain.mjs, records/content.html, styles.css, tests/domain.test.mjs and documentation. Hashes/diff evidence pending after verification.

## DOMAIN-004 — 2026-11-05T03:54:45.8559678Z
Actor: Codex. Before packaging: unknown live write capabilities must leave a read-only source view under R07. Gate Save outside the verified loopback fixture until a production adapter and permissions are accepted; preserve local draft editing/export. Update truthful readiness docs, standalone dependency lock, source hashes and browser evidence. Local13 tests/app pass, budget settings save/readback and gallery viewer passed. Viewport override ineffective; iframe390px checks recorded separately. Live auth pending. Files: app.mjs, docs, REVIEW.md, audit evidence and lockfile.

## DOMAIN-005 — 2026-11-05T03:54:47.482Z
Actor: Codex; references DOMAIN-003/004. Implemented typed optional settings in the existing format1 aggregate, profile controls, collection/date filters, monthly budget comparison with transfer exclusion, weekly fitness goal table and keyboard photo viewer as applicable. All13 tests and source checks passed for this repository. Browser budget settings save/readback and photo viewer passed; all9 apps loaded at390px iframe width. Legacy aggregate without settings retains records and creates settings only on explicit Apply. Live Save now read-only outside the verified loopback fixture until a supported adapter is accepted. npm executable unavailable locally; Bun install used and reproducible direct Node commands documented. Live provider access/private-data/physical-device checks pending. Reviewable evidence: source-sha256.json records candidate closure; staged diff review to follow before publication.

Domain control reconciliation: static record controls now match updated option contracts (including Transfer and Archived where applicable); Journal tags corrected to optional text after a generator argument mismatch was found during review. Affected index.html/config.mjs. This is a correction, not a retrospective test claim.

## PACKAGE-006 — 2026-11-05T04:01:42.179Z
Actor: Codex; reference approved execution / initial public candidate plan. Credential-pattern scan passed for the candidate text closure; source-sha256.json records 34 non-audit source files and hashes. Only fictional seeds and licensed assets included. Review boundaries in REVIEW.md retained. Standalone Bun dependency installation passed after the restricted temp-directory attempt failed; lifecycle scripts skipped. Initial public push to an empty main is planned, without force; runtime live acceptance remains pending. Staged review evidence follows.
