# Tulip Field Generator

Tulip Field Generator is a Chrome extension that transforms a webpage into a stylized Dutch field composition.

It does not replace the DOM with screenshots or PNG sprites. Instead, it:

- detects visible page components
- groups related small blocks into larger clusters
- expands those clusters to partition more of the page
- renders procedural tulip parcels on top of the layout

## Current State

Current extension version: `0.8.6`

What the current build does well:

- catches a broad set of content blocks across editorial and application-style pages
- merges tiny metadata-like fragments into stronger nearby parcels
- expands fields into surrounding whitespace so the page feels partitioned
- renders procedural tulip fields with fixed Dutch-style vertical corridors
- keeps field colors more stable while scrolling than earlier builds

What is still being tuned:

- perfect coverage on highly dynamic pages
- color stability during heavy lazy-loading and layout settling
- long-scroll behavior on complex app UIs

## How It Works

The runtime pipeline in `content.js` is:

1. detect candidate blocks:
   - nav rows
   - wrapped/composite headers
   - media
   - text
2. dedupe overlapping candidates
3. absorb micro-blocks into stronger neighboring blocks
4. build clusters
5. expand cluster territories
6. assign leftover uncovered regions to the nearest cluster
7. assign stable tulip color families to the final fields
8. render territories first, then core blocks

## Visual System

- Flowers are procedural, not image-based
- Allowed tulip families:
  - red
  - yellow
  - pink
  - white
  - purple
  - orange
  - maroon
- Corridors run vertically
- Fields are dense and overlap slightly
- Core blocks and expanded territories share one field family

## Local Development

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the project folder
5. Reload the extension after file changes

Main files:

- `manifest.json`
- `background.js`
- `content.js`

## Publishing Later

Before Chrome Web Store publication, we should still do:

- final naming/icons review
- permissions sanity pass
- README/screenshots for store listing
- version discipline and release notes
- a stability pass on dynamic sites like GitHub, Facebook, and Reddit
