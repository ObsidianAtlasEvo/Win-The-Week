// LG x Best Buy weekly featured-bundle flyer (16:9, 13.333" x 7.5")
// Usage: ./make.sh [week.json] [dark|light]
const pptxgen = require("pptxgenjs");
const fs = require("fs");

const cfg = JSON.parse(fs.readFileSync(process.argv[2] || "week.json", "utf8"));
const THEME = process.argv[3] || cfg.theme || "dark";
const img = (f) => "image/png;base64," + fs.readFileSync(f).toString("base64");

// ---- palettes ----
const PALETTES = {
  dark: {
    BG: "07070B", TEXT: "FFFFFF", SOFT: "B9B9C6", DIM: "8C8C9A",
    ACCENT: "FF5A7E",            // LG red, lifted for contrast on black
    CARD: "16161F", CARD_T: 8, PANEL_T: 4, EDGE: "34343F", RULE: "34343F", DIVIDER: "4A4A56",
    OP_FILL: "07070B", OP_LINE: "5A5A68", CARD_SHADOW: false,
    SAVE_FILL_T: 88, SAVE_TEXT: "FFE000", SAVE_NOTE: "FFFFFF", STICKER_SHADOW: 0.5,
  },
  light: {
    BG: "FFFFFF", TEXT: "14141A", SOFT: "585868", DIM: "6E6E7C",
    ACCENT: "A50034",            // LG red
    CARD: "FFFFFF", CARD_T: 0, PANEL_T: 0, EDGE: "DDDDE5", RULE: "E3E3EA", DIVIDER: "C8C8D2",
    OP_FILL: "FFFFFF", OP_LINE: "C4C4CE", CARD_SHADOW: true,
    SAVE_FILL_T: 0, SAVE_TEXT: "111111", SAVE_NOTE: "1E1E24", STICKER_SHADOW: 0.22,
  },
};
const C = PALETTES[THEME];
const WHITE = C.TEXT, SOFT = C.SOFT, DIM = C.DIM, ACCENT = C.ACCENT;
const GOLD = "FFE000";     // Best Buy yellow — money & savings only
const GLASS = C.CARD, EDGE = C.EDGE;
const FONT = "Calibri";
const cardShadow = () => C.CARD_SHADOW
  ? { type: "outer", color: "1A1A40", opacity: 0.10, blur: 14, offset: 3, angle: 90 } : undefined;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = cfg.headline;
const s = pres.addSlide();
s.background = { color: C.BG };
s.addImage({ path: `build/stage_${THEME}.jpg`, x: 0, y: 0, w: 13.333, h: 7.5, altText: "Featured products" });

const T = (text, o) => s.addText(text, { fontFace: FONT, margin: 0, isTextBox: true, valign: "top", ...o });

// ================= HEADER =================
const MX = 0.5;
s.addImage({ data: img(`build/${THEME}_bestbuy_logo.png`), x: MX, y: 0.4, w: 0.9, h: 0.9 * 103 / 172, altText: "Best Buy logo" });
s.addShape(pres.shapes.LINE, { x: MX + 1.08, y: 0.42, w: 0, h: 0.5, line: { color: C.DIVIDER, width: 1 } });
s.addImage({ data: img(`build/${THEME}_lg_logo.png`), x: MX + 1.26, y: 0.47, w: 0.94, h: 0.94 * 81 / 170, altText: "LG logo" });

const HX = MX + 2.55;
T(cfg.eyebrow, { x: HX, y: 0.34, w: 5.8, h: 0.24, fontSize: 11, bold: true, color: ACCENT, charSpacing: 3 });
T(cfg.headline, { x: HX, y: 0.55, w: 5.9, h: 0.52, fontSize: 32, bold: true, color: WHITE, valign: "middle" });
T(cfg.subhead, { x: HX, y: 1.07, w: 5.9, h: 0.3, fontSize: 15, color: SOFT });

// "1 M7 is FREE" sticker over the hero
if (cfg.audio.badge) {
  s.addText([
    { text: cfg.audio.badge[0], options: { fontSize: 17, bold: true, breakLine: true } },
    { text: cfg.audio.badge[1], options: { fontSize: 11.5 } },
  ], { shape: pres.shapes.ROUNDED_RECTANGLE, x: 6.72, y: 1.72, w: 1.98, h: 0.64, rectRadius: 0.32,
       fill: { color: GOLD }, line: { type: "none" }, color: "111111", fontFace: FONT, margin: 0,
       align: "center", valign: "middle",
       shadow: { type: "outer", color: "000000", opacity: C.STICKER_SHADOW, blur: 10, offset: 3, angle: 90 } });
}

// ================= PRODUCT CARDS =================
const CY = 4.76, CH = 2.02;
// Calibri Bold advance widths (em): digits and $ are 0.507, "," "." about 0.25
const priceWidth = (t, pt) => (pt / 72) * [...t].reduce((a, c) => a + (/[,.]/.test(c) ? 0.25 : 0.507), 0);
function card(p, x, w) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: CY, w, h: CH, rectRadius: 0.12,
    fill: { color: GLASS, transparency: C.CARD_T }, line: { color: EDGE, width: 0.75 }, shadow: cardShadow() });
  const ix = x + 0.25, iw = w - 0.5;
  T(p.tag, { x: ix, y: CY + 0.17, w: iw, h: 0.22, fontSize: 11, bold: true, color: ACCENT, charSpacing: 2 });
  T(p.name, { x: ix, y: CY + 0.38, w: iw, h: 0.38, fontSize: 21, bold: true, color: WHITE, valign: "middle" });
  T(p.desc, { x: ix, y: CY + 0.78, w: iw, h: 0.42, fontSize: 12.5, color: SOFT, lineSpacingMultiple: 0.95 });
  const PF = 36, pw = priceWidth(p.price, PF);
  T(p.price, { x: ix, y: CY + 1.24, w: pw + 0.1, h: 0.62, fontSize: PF, bold: true, color: WHITE, valign: "middle" });
  const cx = ix + pw + 0.16;
  s.addText(p.chip, { shape: pres.shapes.ROUNDED_RECTANGLE, x: cx, y: CY + 1.3, w: 0.085 * p.chip.length + 0.3, h: 0.28,
    rectRadius: 0.14, fill: { color: GOLD }, line: { type: "none" }, fontFace: FONT, fontSize: 12.5,
    bold: true, color: "111111", align: "center", valign: "middle", margin: 0 });
  T(p.note, { x: cx, y: CY + 1.61, w: iw - (cx - ix), h: 0.24, fontSize: 12, color: SOFT });
}
const TVX = 0.5, TVW = 4.6, AUX = 5.35, AUW = 3.4;
card(cfg.tv, TVX, TVW);
card(cfg.audio, AUX, AUW);

// equation badges:  TV  +  audio  =  bundle
function opBadge(sym, cx, cy) {
  s.addText(sym, { shape: pres.shapes.OVAL, x: cx - 0.2, y: cy - 0.2, w: 0.4, h: 0.4,
    fill: { color: C.OP_FILL }, line: { color: C.OP_LINE, width: 1 }, fontFace: FONT, fontSize: 20,
    bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
}
opBadge("+", (TVX + TVW + AUX) / 2, CY + CH / 2);

// ================= BUNDLE PANEL =================
const PX = 9.05, PY = 0.4, PW = 13.333 - 0.5 - PX, PH = CY + CH - PY;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: PX, y: PY, w: PW, h: PH, rectRadius: 0.16,
  fill: { color: GLASS, transparency: C.PANEL_T }, line: { color: EDGE, width: 0.75 }, shadow: cardShadow() });
opBadge("=", (AUX + AUW + PX) / 2, CY + CH / 2);

const b = cfg.bundle, ix = PX + 0.3, iw = PW - 0.6;
let y = PY + 0.3;
T(b.label, { x: ix, y, w: iw, h: 0.26, fontSize: 13, bold: true, color: ACCENT, charSpacing: 3 });
y += 0.28;
T(b.total, { x: ix, y, w: iw, h: 0.86, fontSize: 48, bold: true, color: WHITE, valign: "middle" });
y += 0.86;
T(b.totalNote, { x: ix, y, w: iw, h: 0.26, fontSize: 13, color: SOFT });
y += 0.42;
const rule = (yy) => s.addShape(pres.shapes.LINE, { x: ix, y: yy, w: iw, h: 0, line: { color: C.RULE, width: 1 } });
rule(y); y += 0.16;
b.lines.forEach(([label, val]) => {
  T(label, { x: ix, y, w: iw - 1.3, h: 0.32, fontSize: 15, color: WHITE, valign: "middle" });
  T(val, { x: ix + iw - 1.4, y, w: 1.4, h: 0.32, fontSize: 17, bold: true, color: WHITE, align: "right", valign: "middle" });
  y += 0.36;
});
T(b.lineNote, { x: ix, y, w: iw, h: 0.24, fontSize: 12, color: SOFT });
y += 0.24;
const finY = PY + PH - 0.3 - 0.5 - 0.72 - 0.24;   // finance block sits on the panel floor
y += (finY - y - 0.86) / 2;

// savings block
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ix - 0.1, y, w: iw + 0.2, h: 0.86, rectRadius: 0.1,
  fill: { color: GOLD, transparency: C.SAVE_FILL_T },
  line: C.SAVE_FILL_T ? { color: GOLD, width: 0.75, transparency: 55 } : { type: "none" } });
T([
  { text: b.savings, options: { fontSize: 26, bold: true, color: C.SAVE_TEXT } },
  { text: " " + b.savingsLabel, options: { fontSize: 13, bold: true, color: C.SAVE_TEXT } },
], { x: ix + 0.08, y: y + 0.08, w: iw - 0.16, h: 0.44, valign: "middle" });
T(b.savingsNote, { x: ix + 0.08, y: y + 0.52, w: iw - 0.16, h: 0.24, fontSize: 12.5, color: C.SAVE_NOTE });
y = finY;
T(b.financeLabel, { x: ix, y, w: iw, h: 0.24, fontSize: 12, bold: true, color: ACCENT, charSpacing: 1 });
y += 0.24;
T([
  { text: b.monthly, options: { fontSize: 44, bold: true, color: WHITE } },
  { text: " /mo.*", options: { fontSize: 18, color: SOFT } },
], { x: ix, y, w: iw, h: 0.7, valign: "middle" });
y += 0.72;
T(b.financeNotes.join("\n"), { x: ix, y, w: iw, h: 0.5, fontSize: 12, color: SOFT, lineSpacingMultiple: 1.05 });

// ================= FINE PRINT =================
T(cfg.disclaimers.join("\n"), { x: MX, y: 6.93, w: 13.333 - 2 * MX, h: 0.45, fontSize: 8, color: DIM,
  lineSpacingMultiple: 1.0 });

if (cfg.notes) s.addNotes(cfg.notes);

const out = (cfg.file || "flyer") + (THEME === "light" ? "_Light" : "") + ".pptx";
pres.writeFile({ fileName: out }).then((f) => console.log("wrote", f));
