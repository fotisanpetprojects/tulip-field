# Changelog

## 0.9.0

- Added Chrome Web Store publication assets and docs
- Added manifest icon set support
- Added privacy policy
- Added store listing draft
- Added packaging script for upload zip

Problem:
- the project was pushed to GitHub but not yet ready for store submission

Solution:
- added the required packaging and listing scaffolding for Chrome Web Store publication

## 0.8.6

- Made field colour assignment stickier during scroll and re-render
- Reduced colour churn by basing cluster identity on stronger content anchors instead of every absorbed fragment
- Kept cached field families instead of letting adjacency reshuffle existing parcels

Problem:
- fields kept recolouring during scroll and during post-scroll settling

Solution:
- prioritise continuity and cached identity over fresh recomputation

## 0.8.5

- Removed the remaining embossed/relief look from the field renderer
- Flattened corridor shading
- Removed opacity from tulip/leaf marks

Problem:
- some blocks still looked glossy, embossed, or shadowed

Solution:
- flattened the procedural paint so fields read as flat parcels

## 0.8.4

- Removed gloss/highlight marks from tulips
- Added previous-frame field inheritance by overlap
- Increased tulip density by roughly 15%

Problem:
- fields still looked glossy and colour flicker was noticeable during scroll

Solution:
- removed highlight marks and added continuity-based field reuse

## 0.8.3

- Removed the bed sheen layer

Problem:
- gloss was reading as a shiny wash over the whole parcel instead of petal detail

Solution:
- removed the field-level sheen and kept the renderer flatter

## 0.8.2

- Switched field identity toward content-first seeding
- Added coarser geometry fallback buckets
- Added persistent field-family cache
- Added glossy experiments

Problem:
- colours were still changing because geometry changed slightly across re-renders

Solution:
- made seeds less dependent on precise geometry

Note:
- the gloss experiments were later removed

## 0.8.1

- Made territories and core blocks fully opaque
- Moved colour assignment after final territory generation
- Added adjacency-aware field family assignment
- Increased field density and narrowed corridors

Problem:
- page content showed through the fields
- adjacent fields could share the same flower colour
- field colour identity changed too easily

Solution:
- removed transparency and assigned families from the final field graph

## 0.8.0

- Dropped PNG tulips completely
- Replaced flat pastel overlays with procedural tulip-field rendering
- Kept vertical brown corridors and top-down tulip marks

Problem:
- sprite/PNG approach was the wrong primitive for a field-based page rewrite

Solution:
- switched to procedural rendering

## 0.7.8

- Added support for small labels and wrapped interactive headers

Examples:
- BBC live headline wrapper
- France24 category labels
- Google and Reddit short label blocks

Problem:
- small editorial labels and wrapped headline clusters kept being missed

Solution:
- added targeted detection for wrapper headers and short tag-like blocks

## 0.7.7

- Improved support for composite heading wrappers and short editorial labels

Problem:
- story headers with badges/icons and tiny topical tags were tricky cases

Solution:
- detect wrapper roots and absorb small label-like blocks into nearby story structure

## 0.7.6

- Added leftover whitespace assignment pass

Problem:
- blocks expanded until they met neighbours, but some page areas still remained uncovered

Solution:
- detect unclaimed regions and assign them to the nearest field cluster

## 0.7.5

- Added micro-block absorption before expansion

Problem:
- tiny metadata and short fragments became isolated micro-fields

Solution:
- absorb small blocks into stronger nearby neighbours before territory growth

## 0.7.4

- Added a second pastel layer for expanded territory ownership

Problem:
- detected blocks were correct but too much whitespace remained untouched

Solution:
- let blocks claim nearby whitespace before any tulip rendering

## 0.7.3

- Added live resync on scroll, resize, and DOM mutation
- Improved metadata and nav detection

Problem:
- on dynamic pages like Facebook, pastel blocks stayed hanging in old positions

Solution:
- re-render continuously with throttling

## 0.7.2

- Split detection into separate media and text passes
- Added grouped nav-row detection

Problem:
- structural boxes were detected, but meaningful text blocks like headlines and descriptions were being missed

Solution:
- bias detection toward media blocks and text blocks instead of generic wrappers

## 0.7.1

- Removed accidental page-wide pastel background wash
- Filtered out large layout wrappers more aggressively

Problem:
- the whole page was turning pastel while actual detection stayed sparse

Solution:
- keep only detected boxes, not a page-wide fill

## 0.7.0

- Reset to a safe modern baseline
- Reintroduced the extension with simple pastel debug blocks

Problem:
- earlier experiments had become unstable and difficult to reason about

Solution:
- return to a transparent debug phase before reintroducing the final visual system

## Pre-0.7 exploration

Main problems encountered:

- semantic parsing was too brittle for arbitrary sites
- page-wide tulip backgrounds created visual chaos
- giant SVG generation could blow up memory on heavy pages
- stale injected scripts caused misleading runtime errors
- opacity and gloss made fields feel like translucent overlays instead of parcels

Main solutions that survived:

- keep a modern overlay architecture
- use broad agnostic detection rather than page-specific parsing
- merge micro-blocks into stronger clusters
- expand fields structurally instead of filling the whole page blindly
- use procedural tulips instead of sprites
