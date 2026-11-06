# Product polish contract

The same three working app compositions are available in every design at [the workspace preview](../examples/workspace.html): overview, collection/detail and settings. Midnight/dark remains the default. Use the design and mode controls to compare supported combinations. The component catalog remains the reference for individual controls.

## A distinct character, consistent craft

| Design | Direction | Composition |
| --- | --- | --- |
| Classic | Precise and professional | Source Serif 4 headings, Inter controls, balanced density and quiet separators |
| Editorial | Warm and literary | Paper surfaces, generous serif titles, longer reading measures and square panels |
| Forest | Grounded and calm | Soft sage surfaces, sans-serif hierarchy, rounded containers and comfortable spacing |
| Midnight | Focused and sophisticated | Plum surfaces, tightly tracked sans-serif titles, compact rows and restrained lavender actions |
| Invitation | Expressive and intimate | Fraunces titles, Inter Tight controls, warm text and generous blue-black compositions |

## Typography and rhythm

Load styles/app.css to include bundled fonts. Standalone theme consumers must also load styles/fonts.css, preserving its relative asset paths. Native consumers must register the supplied fonts with their own platform. Regular, medium and semibold weights are included; italic and other weights use platform synthesis/fallback unless separately supplied. System fallbacks remain intentional during font loading and for missing glyphs. Preserve each OFL license when distributing fonts.

Canonical appearance values export page padding, panel padding, row padding, input radius, title size, heading tracking and interaction duration in every format. Use 16px base body copy, 1.5–1.7 reading line-height, no more than 65 characters in prose measures, and tabular numerals for comparable metrics. Small metadata is supplementary; never use it for essential actions or instructions. Main titles shrink to 36px on narrow screens; controls remain at least 44px high.

## Surfaces and composition

Use the light surface role for the page, regular for panels and strong for inset artwork or progress tracks. Keep borders neutral. Reserve functional color for actions, focus and named states. Avoid wrapping every line in a card: combine open metrics, lists with separators, a single focal project and smaller secondary information. An editorial title treatment replaces stock decoration in the sample project artwork.

styles/product.css provides reusable app shell, navigation, metrics, project panels, activity lists, collections, forms, dialog and status compositions. At narrow sizes the sidebar becomes horizontal navigation, columns stack and all content remains in natural document flow. Avoid fixed content heights and truncated task labels. The product CSS requires app.css and is shared across all selected designs.

## Interaction quality

Actions need default, hover, pressed, focus, disabled and pending states. Use 160ms color/border feedback; no ambient motion. Reduced motion removes transitions and pressed movement. Navigation is URL-addressable, preserves design selection and supports browser history. Search has a useful empty state and clear-search recovery. The create-story dialog supports Escape, native focus containment and return focus. New text uses textContent, never HTML interpolation.

Settings demonstrate required-field and email validation, field-associated errors, first-error focus, saving, completion and reset. The settings demo does not simulate a server: edits and created stories last only until reload. A real application must add persistence, permission failures, conflict recovery and network failure/retry behavior appropriate to its service. Do not imply the preview provides those capabilities.

## Acceptance standard

Inspect every supported design/mode at desktop and 320px widths, including all three screens, loaded fonts, long content, keyboard paths, focus, empty results, invalid submissions, pending/completed actions and reduced-motion behavior. Compare scrollWidth to clientWidth for overflow. Verify contrast for the actual composition. Export checks ensure portable values stay synchronized; they do not certify all accessibility or proprietary tool imports.

## Review refinements

The title size in each generated DESIGN.md and Stitch guide now describes the same maximum title size and tracking used by the app. Mobile titles use design-title-size-mobile. Product content width follows design-content-width; action/label text uses design-text-small and supplementary metadata uses design-text-caption. Decorative artwork labels retain fixed sizes to avoid cropping when reading text is enlarged.

Control boundaries use border-strong and focus uses border-focused. Automated checks cover these roles and error outlines against both page and panel surfaces at a minimum contrast ratio of 3:1; ordinary text checks remain at 4.5:1. This is a targeted check, not blanket accessibility certification.

Collection links carry a collection ID in the URL. Each collection's HTML article owns its items; counts, progress and overview summaries are derived from those articles. Creating an item updates the current collection only. Changing designs or screens preserves local edits until reload. Settings capture submitted values, keep later edits marked unsaved and disable Save only when pending or unchanged. Reset cancels pending work and restores the original preview.

The settings screen offers 100%, 125% and 200% reading sizes and a reduced-motion preference. These apply immediately for preview and reset on reload. Device reduced-motion preferences always take precedence. See [quality checks](../examples/quality.html) for actual font loading at all three supplied weights and effective transition durations. Native browser zoom, screen readers and physical devices require separate testing.
