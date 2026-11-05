# Deployment

Install dependencies with npm install, run npm run check and npm test, then npm run preview (loopback fixture, port4174 or PORT). Only site/ contents are runtime payload. Do not upload docs, node_modules, .preview-state, credentials or audits.

Before a live app release, establish actual supported authenticated application mutation path, source read protection, strong conditional writes and validator behavior with valid/invalid/unauthorized/concurrent tests. Static hosting alone does not implement edits. Until these checks pass, use fictional data and treat live editors as unverified. Private apps must not be deployed with personal data.

Use an authorized fresh test site. List DAV destination read-only first; use documented MKCOL/PUT and create-only If-None-Match for seed records. Stage assets, read back bytes, then promote entry page. Routine upgrades omit records/ entirely. Back up source records privately and test restoration in isolation. Never put API tokens in site/ or Git. A successful DAV upload proves authoring, not application enforcement.

Available alternative development commands: `bun install --ignore-scripts`, `node scripts/check.mjs`, `node --test tests/*.test.mjs`, `node scripts/preview.mjs`. The live Save action is gated until an accepted authenticated application adapter exists; do not enable it based only on an advertised PUT method or successful owner-DAV upload. Keep source reads protected separately.
