# Weekly featured-bundle flyer

One LG TV + one LG audio product, restaged each week on a dark "OLED black" set.

## Update for a new week
1. Drop the new product photos in `assets/` (white-background screenshots are fine:
   the TV is cropped to its screen, audio is cut out automatically).
2. Edit `week.json`: names, descriptions, prices, chips, bundle math, fine print, notes.
   - `audio.layout`: `"flank"` for a speaker pair (one each side of the TV), `"front"`
     for a single product such as a soundbar.
   - `audio.badge`: the yellow sticker over the hero (remove it to hide the sticker).
3. Run `./make.sh` (needs Python + Pillow + numpy, Node + pptxgenjs).
   Output: `<file>.pptx` (dark) and `<file>_Light.pptx` (white background) in this folder.
   `./make.sh week.json light` builds just one theme.

## Locked design rules
The format is fixed. Each week only the content in `week.json` and the photos change.

| Zone | Answers | Rule |
|---|---|---|
| Top left | What are we selling? | Best Buy + LG logos, eyebrow, headline, subhead |
| Center hero | What does the solution look like? | TV centered; audio flanks it (pair) or sits in front (single) |
| Bottom cards | What does each part cost? | TV card **+** audio card **=** summary rail |
| Yellow | What's the win? | Best Buy yellow is used only for value: free badge, chips, savings block |
| Right rail | What's the complete transaction? | Total, line items, savings, financing |

- Color: LG red/magenta for category labels and section headers only; Best Buy yellow for value only.
- Type: Calibri. Big bold numbers for prices and financing. Fine print stays at 9pt, never smaller.
- Copy: the savings block holds at most a number + label and one supporting line.
- Wording: "Total" means **My Best Buy Total** (the membership). When the price includes
  the membership, the rail header says "BUNDLE + MY BEST BUY TOTAL", never "BUNDLE TOTAL".
- Geometry, radii, shadows and spacing live in `build.js` / `compose.py`. Don't change them week to week.
