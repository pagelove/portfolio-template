# Prompt-driven build and deployment

Slide 4 supplies the selected repository URL, public site hostname and private API token to the user's coding AI. The AI reads this repository's instructions, adapts the actual app, runs its checks, prepares site/ and deploys that directory using trusted owner WebDAV authoring. This flow does not require a console-to-app browser session handoff. No outside identity provider is used.

## Commands

Use Node22 or newer. Install pinned development dependencies with npm install or bun install --ignore-scripts. Run the repository's check and test commands, plus node --test tests/deployment.test.mjs. For Mahjong, run node tools/prepare-template.mjs after changing game source; other apps already author their runtime under site/.

1. node scripts/deploy.mjs --prepare — validate the prepared installation closure and scan for credentials. This does not create a site or upload anything.
2. node scripts/deploy.mjs --host YOUR-SITE.onpagelove.com — paste the account API token at the private terminal prompt. Terminal echo is disabled. An automation may instead receive PAGELOVE_API_TOKEN through its private credential mechanism; never put a real token in shell command text, a prompt transcript committed to Git, browser code, URLs or logs.
3. node scripts/deploy.mjs --host YOUR-SITE.onpagelove.com --verify — read-only owner/public verification of the prepared release.

Use --path /isolated-directory/ for a separate install on an existing authorized test site. Root / is the default for the user's own selected site. The tool only accepts an exact native onpagelove.com hostname and its corresponding dav- hostname; custom domains need an explicitly reviewed adaptation. Network redirects are refused. Site creation and connection provisioning are handled by Pagelove, before this command.

## Preservation and updates

The tool inventories the destination and preflights the complete payload before writing. Fresh files and records use If-None-Match: *. Existing records/, data/, submissions/ and scores/ resources are retained, including owner edits; unrelated files are never deleted. Existing different code is refused unless you inspect it and deliberately pass --update. Code updates require a strong ETag and If-Match; stale412 and network ambiguity stop without automatic retry. Assets are uploaded before index.html. Publication across several files is not one atomic transaction; retain old immutable assets when designing release changes.

Every installed file is read back through owner authoring. HTML is compared by parsed structure to accommodate platform serialization; other payloads are byte-compared. The public entry is also checked, ignoring only the known platform branding footer. Existing mutable records are verified against the destination baseline, not reset to template seeds. The sanitized receipt is stored in ignored .local/deployment-receipt.json. It contains paths/hashes/results, never the token. It is verification evidence, not a backup. Back up real records privately before a migration and verify restoration separately.

## What this establishes

A successful run establishes build-payload installation and readback on the selected site. Browser review still checks actual user journeys and network assets. The supplied token stays in the coding AI's private authoring process; the published app never receives it.

Browser-based private record editing, protected drafts and booking administration remain separate supported-authentication/authorization integrations. Do not add a fake signed-in flag or embed the owner token to enable them. Use fictional review data until the target's protected read/write paths are accepted. Games retain device-local progress as documented. A deployment succeeds independently of these optional runtime integrations; it does not claim they passed.

Official references: https://docs.pagelove.com/ and https://docs.pagelove.com/reference/reading-and-writing/ . Follow docs/architecture.md (where present), REVIEW.md and the document-first guide for the actual app's authority and limitations.
