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
   Output: `<file>.pptx` in this folder.
