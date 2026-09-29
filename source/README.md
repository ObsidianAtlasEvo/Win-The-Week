# Win The Week slide source

The deck at the repo root is a normal PowerPoint file. Edit it directly in PowerPoint each week.
These files regenerate it from scratch if you ever need to:

```bash
npm install pptxgenjs
node build.js raw.pptx && python3 post.py raw.pptx LG_WinTheWeekNPI.pptx
```

- `build.js`: layout, prices and highlights (`["$749", "r"]` = red, `"g"` = green, `"p"` = purple)
  Key colors: Price change `E31937`, Bundle & save `12B76A`, BBY+ / Total member deal `8B5CF6`
- `post.py`: adds the three key colors to the theme so they appear in PowerPoint's color picker
- `notes_full.txt`: speaker notes (editing tips plus the original notes)
