# App identity and social sharing

Edit site.json for app identity, public trailing-slash deployment URL and safe public social copy; edit mark.svg for the stable 64-unit silhouette. Keep identity colors stable across theme changes. Then npm install and npm run branding. Build inputs follow pagelove/design-system @ f41f4476b636c3b353f024c2cb9a1e2067b7de6b; canonical renderer and licenses are under scripts/identity-kit. Never use an owner token in metadata or public assets.

The generated default OG PNG is 1200×630; supported selected-design modes remain under .local/identity-build/designs for review. SVG/ICO (16/32/48), opaque 180px touch, 192/512 and maskable icons and manifest are separate outputs. Inspect 16px rendering and circular crops, and verify actual metadata/asset URLs after deployment. A manifest does not establish installability; no social-platform or physical-device acceptance is claimed.

App display name, headline and about text are derived from the authoritative HTML Settings record at build time when present. site.json supplies deployment/identity settings and template fallbacks; it is not a competing editable app-content store. After changing source settings, rebuild the static metadata.
