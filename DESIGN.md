# Alex Morgan — Midnight / dark

Source: pagelove/design-system @ f41f4476b636c3b353f024c2cb9a1e2067b7de6b. Use the complete selected design. Start in dark mode. Use deep plum surfaces, pale lavender interaction accents, sans-serif headings and compact geometry. This design has no light mode; do not generate one by inversion. Use the bundled local fonts and product compositions. Separate page, panel and inset surfaces; keep metadata quiet but readable. Use the exported page/panel/row spacing and title scale consistently, with 44px action targets and brief 160ms interaction feedback. See docs/polish.md for the complete product contract.

Read site/assets/pagelove-design/DESIGN.md (mode-specific), polish.md and identity-and-sharing.md. Use canonical type/spacing/shape roles and local WOFF2 fonts. Neutral borders, no colored card rails or decorative northeast arrows. App-specific layout is site/styles.css; it must not mix another palette into the selected design.

Identity authority: branding/site.json and branding/mark.svg. Update the public URL for a new deployment, then run npm install and npm run branding. The source-pinned renderer lives in scripts/identity-kit; branding/renderer-input.json is derived upstream configuration, not app-domain data. Never edit generated identity/social exports directly.

HTML source records, aggregate boundaries, save/recovery and accepted limits remain in docs/architecture.md and DOCUMENT-FIRST-REVIEW.md. This refresh preserves all records and domain formats. Browser and metadata verification pending for this revision.
