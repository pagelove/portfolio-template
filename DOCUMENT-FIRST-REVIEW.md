# Document-first review — portfolio

Guide: Pagelove Document-first development edition2.4, revised2026-11-04; supplied source SHA256 `322d0c1c1c016787edeb67702c62c69610f26916933d0f34ec3dd7b2468b26dc`. Actor: Codex. Review source: `0d6363dee3c15305dcd79b3eecacbc0e72dd31dc`. Maintainer: repository maintainers. Profiles: A1/A5.

## Model, authority and lifecycle

docs/architecture.md and site/config.mjs define source /records/content.html: one section#records[data-format="1"], stable r-UUID records and optional r-settings. The working HTML DOM is the only editable domain authority; cards/reports and filters are derived.

## Operation, state and recovery contract

Current controls create a validated cloned candidate; Cancel changes no source. Bounded whole-aggregate conditional PUT uses strong ETag and readback in the local fixture. Stale412 and ambiguous outcomes preserve HTML draft; no automatic replay. Seed deployment is create-only and preserves existing mutable records.

Format1/behavior1; <=500 rows and2MB UTF-8. Unknown/future data and ambiguous roots reject before replacement. Session recovery is origin/path/app-scoped HTML snapshots, no offline shared queue. Storage failure does not disable source viewing/editing/export or mislabel a verified save. See config for civil dates/timezones/units and domain tests for totals.

## Enforcement and effects

Live browser saving is deliberately disabled outside the loopback fixture. Public sample content is fictional. Real private deployment/direct/list/export authorization and native application writes remain exact-host gates; owner DAV is trusted authoring and supplies no server validation guarantee.

## W1–W8 / R01–R12 acceptance

- W1–W3 / R01–R04: selected profiles, HTML preference, stable identities, owned aggregates and the representation exception above are the governing source contract. Derived caches/runtime arrays cannot become independent editable authorities.
- W4 / R05–R07: inspect exact canonical address/selector, actor, source revision and actual enforcement before enabling a newly relied-on mutation. Local fixtures and declaration review do not establish target-host privacy or validation.
- W5–W6 / R08–R10: distinguish working draft, frozen pending command, accepted state and unknown outcome. Preserve original data on rejected/future imports. No automatic external-effect replay. Offline collaboration/subscription features are not implied by browser storage; add tested scope/disposal/reconnect contracts before offering them.
- W7–W8 / R09–R12: audit/CHANGELOG.md records current commands, revisions and results. Existing REVIEW evidence remains historical. Re-run the appropriate source/shape/round-trip/concurrency/negative checks, then actual affected browser tasks. Never label pending live, maximum-device, assistive, restore or security checks as passed.

## Release and maintenance gates

Preserve user records, mutable source paths and incompatible backups during code updates. Do not replace a live document containing user records with a seed. Exclude credentials/private payloads from source, logs, public examples and previews. Pin coupled runtime/definition versions and retain rollback assets. Before real private or consequential use, verify supported read/write paths with valid and known-invalid/unauthorized requests on the actual host, exercise restoration in isolation, and record device/performance/accessibility limits. No new service or identity provider is authorized by this record. Re-review when format, source route, write adapter, host configuration, rules or runtime changes.
