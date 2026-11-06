---
"name": "Midnight"
"colors":
  "primary": "#dcd4ec"
  "neutral": "#100d17"
  "accent": "#b491ec"
  "border": "#33283f"
"typography":
  "heading":
    "fontFamily": "Inter"
    "fontSize": "2.75rem"
    "fontWeight": 400
    "lineHeight": 1.1
    "letterSpacing": "-.04em"
  "body":
    "fontFamily": "Inter"
    "fontSize": "1rem"
    "fontWeight": 400
    "lineHeight": 1.5
"rounded":
  "card": "8px"
  "button": "8px"
"spacing":
  "small": "8px"
  "medium": "16px"
  "large": "20px"
---

# Midnight

## Overview

Build readable applications with visible structure and one clear next action per task. Apply this design's declared heading and body families, surfaces and geometry consistently. Prefer meaningful content and neutral separators over decorative panels. The values above describe the selected starting style; the complete scales and roles live in this design's exports.

Start in dark mode. Use deep plum surfaces, pale lavender interaction accents, sans-serif headings and compact geometry. This design has no light mode; do not generate one by inversion. Use the bundled local fonts and product compositions. Separate page, panel and inset surfaces; keep metadata quiet but readable. Use the exported page/panel/row spacing and title scale consistently, with 44px action targets and brief 160ms interaction feedback. See docs/polish.md for the complete product contract. Available modes: dark. Initial mode: dark.

## Colors

Use purpose-named text, background, button, border and status roles. Keep panels neutral. Use functional color on error/focus/selection states with explicit labels, not decorative card rails. Available modes are declared above; do not invent an unsupported mode. Check contrast in each actual composition; a palette value is not a blanket accessibility approval.

## Typography

Use the declared heading family for headings, body family for reading text and controls, and monospace for code. Start body text at 16px with a 1.5 line-height and normal tracking. Allow headings and labels to wrap. The repository bundles OFL-licensed regular, medium and semibold fonts in assets/fonts; styles/fonts.css loads them locally. Include that stylesheet alongside standalone theme files, or use styles/app.css. Preserve the supplied font licenses. For an independent single-design integration, load shared fonts, library-components.css and base.css, then the selected theme.css; follow that design’s preview.html and docs/designs.md. Avoid squeezing long content into small captions.

## Layout

Use the published website grid: 4 columns at 320–479px, 8 at 480–1023px, and 12 from 1024px. Gutters are 16px on smaller screens and 24px on desktop. Outer margins are 16px, 32px and 64px by range. Console layouts retain 16px gutters/margins. Stack dense regions on narrow screens; use natural scrolling and preserve browser zoom.

Use meaningful semantic HTML for document-based application content, stable resource IDs and DOM-backed editing. Keep efficient specialized runtimes where justified. Token JSON is design interchange, not the default application domain model. Read docs/document-first.md when implementing persistence and editors.

## Elevation & Depth

Favor flat surfaces, whitespace and thin neutral borders. Use small shadows only when they communicate layering. Avoid glossy device frames, continuous ambient motion and gradients that dominate a reading surface. Honor reduced motion while preserving visible loading and status text.

## Shapes

Apply this design's declared card and button radii. Utility icon actions can remain rounded or squared according to purpose. Keep control hit regions at least 44px as a design default, independently of icon size. Do not infer physical size or native dp/sp from CSS pixels.

## Product polish

Use the exported design-page-padding, design-panel-padding, design-row-padding, design-radius-input, design-title-size, design-heading-tracking and design-transition-duration values. The heading size in the metadata is the desktop maximum; use design-title-size-mobile on narrow screens. Use design-text-small for action labels and design-text-caption for supplementary metadata. Follow docs/polish.md and examples/workspace.html for overview, collection/detail and settings compositions. Preserve readable metadata, 44px controls and all error, empty, pending and recovery states.

## Components

Use native buttons for actions and links for navigation. Support default, hover, pressed, focus, disabled and loading states. Keep labels available during pending work. Forms need visible labels, associated hints/errors and current-value serialization. Passwords use native masking; verification codes should support paste and autofill. Group related checkboxes/radios with a legend; use named switches for settings.

Progress must distinguish indeterminate work, actual percent, completion and failure. A local preview or accepted request is not proof of shared persistence or delivery. Preserve dirty work and provide a recovery action after conflicts or failures.

## Do's and Don'ts

- Do use the canonical tokens, public component contracts and meaningful status labels.
- Do make the primary task usable with keyboard, narrow layouts and enlarged text.
- Do show loading, empty, error and recovery states with useful next steps.
- Do retain original design files and add portable exports with explicit conversion limits.
- Do not add decorative northeast arrow icons or colored panel side rails.
- Do not invent backend capabilities, supported imports or verification results.
- Do not include private account metadata, operating procedures or non-Pagelove repository links.
