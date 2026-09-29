// Win The Week — weekly LG pricing slide (16:9, 13.333" x 7.5")
// Editorial redesign: numbered sections, hairline tables, one accent color,
// highlight colors reserved for the key. Every price is a native table cell.
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || "LG_WinTheWeekNPI.pptx";
const LOGO = fs.readFileSync(path.join(__dirname, "logo.png")).toString("base64");

// ---------- palette ----------
const LG = "A50034";      // LG red — the single brand accent
const INK = "15151A";     // primary text
const MUTED = "6B6B78";   // labels, secondary text
const FAINT = "A3A3AE";   // section numbers
const HAIR = "E2E2E8";    // row hairlines
const RULE = "15151A";    // header rule
const PANEL = "F5F5F8";   // promo panel
// Highlight key — the only colors that fill a price cell
const RED = "E31937";     // Price change
const GREEN = "12B76A";   // Bundle & save
const PURPLE = "8B5CF6";  // BBY+ / Total member deal
const HL = { r: RED, g: GREEN, p: PURPLE };

const FONT = "Calibri";
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = "Win The Week";
const s = pres.addSlide();
s.background = { color: "FFFFFF" };

const T = (text, o) => s.addText(text, { fontFace: FONT, margin: 0, isTextBox: true, valign: "top", ...o });

// ---------- grid ----------
const MX = 0.4, SW = 13.333, RIGHT = SW - MX;
const LX = MX, LW = 8.15;                 // TVs
const RX = LX + LW + 0.4, RW = RIGHT - RX; // audio + monitors
const TOP = 1.7, BOTTOM = 6.8;            // content band
const TITLE_H = 0.32, GAP = 0.2;

// ================= HEADER =================
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: MX, y: 0.36, w: 0.96, h: 0.52, rectRadius: 0.1,
  fill: { color: LG }, line: { type: "none" } });
s.addImage({ data: "image/png;base64," + LOGO, x: MX + 0.12, y: 0.36 + 0.07, w: 0.72, h: 0.72 * 337 / 643,
  altText: "LG logo" });
const TX = MX + 1.14;
T("Win the Week", { x: TX, y: 0.28, w: 4.0, h: 0.66, fontSize: 38, bold: true, color: INK, valign: "middle" });
T("BEST BUY EXCLUSIVE PROMOTIONS", { x: TX, y: 1.0, w: 4.0, h: 0.2, fontSize: 10.5, bold: true, color: LG,
  charSpacing: 1.5 });
T("Week of September 28, 2026", { x: TX, y: 1.2, w: 4.0, h: 0.28, fontSize: 15, bold: true, color: INK });

// ---- promo panel ----
const PX = 5.55, PY = 0.3, PW = RIGHT - PX, PH = 1.18;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: PX, y: PY, w: PW, h: PH, rectRadius: 0.14,
  fill: { color: PANEL }, line: { type: "none" } });
const pad = 0.24;
T([
  { text: "BUNDLE & SAVE", options: { fontSize: 13, bold: true, color: INK, charSpacing: 1, breakLine: true } },
  { text: "Qualifying OLED or QNED TV 55″+ with select soundbars", options: { fontSize: 11, color: MUTED } },
], { x: PX + pad, y: PY + 0.2, w: 1.72, h: 0.85, lineSpacingMultiple: 1.05, paraSpaceAfter: 3 });

const divider = (x) => s.addShape(pres.shapes.LINE, { x, y: PY + 0.2, w: 0, h: PH - 0.4,
  line: { color: "D9D9E0", width: 0.75 } });
const chip = (text, x, fill, color) => s.addText(text, { shape: pres.shapes.ROUNDED_RECTANGLE,
  x, y: PY + 0.2, w: 0.1 * text.length + 0.2, h: 0.21, rectRadius: 0.105, fill: { color: fill },
  line: { type: "none" }, fontFace: FONT, fontSize: 9, bold: true, color, charSpacing: 1,
  align: "center", valign: "middle", margin: 0 });

const UX = PX + pad + 1.86, UW = 1.14;
[["$200", "S95AR / SC9S"], ["$100", "S90TR / S90TY"], ["$50", "S70TR"]].forEach(([amt, models], i) => {
  const x = UX + i * (UW + 0.08);
  divider(x - 0.1);
  chip("SAVE", x, GREEN, INK);
  T(amt, { x, y: PY + 0.43, w: UW, h: 0.44, fontSize: 28, bold: true, color: INK, valign: "middle" });
  T(models, { x, y: PY + 0.88, w: UW + 0.05, h: 0.2, fontSize: 11, bold: true, color: MUTED });
});
const FX = UX + 3 * (UW + 0.08);
divider(FX - 0.1);
chip("FREE", FX, LG, "FFFFFF");
T("Install & delivery", { x: FX, y: PY + 0.43, w: RIGHT - pad - FX, h: 0.44, fontSize: 14, bold: true,
  color: INK, valign: "middle" });
T("97″–100″ TVs", { x: FX, y: PY + 0.88, w: RIGHT - pad - FX, h: 0.2, fontSize: 11, bold: true, color: MUTED });

// ================= TABLE KIT =================
const NONE = { type: "none" };
const SIDE = { pt: 2, color: "FFFFFF" };            // keeps neighbouring highlights apart
function cell(v, o = {}) {
  let text = v, fill;
  if (Array.isArray(v)) { text = v[0]; fill = HL[v[1]]; }
  const opts = {
    fontFace: FONT, fontSize: o.size || 14.5, bold: true, color: INK, align: "right", valign: "middle",
    margin: [0, 0.09, 0, 0.06], border: [NONE, SIDE, { pt: 0.75, color: HAIR }, SIDE], ...o,
  };
  delete opts.size;
  if (fill) { opts.fill = { color: fill }; if (fill !== GREEN) opts.color = "FFFFFF"; }
  return { text: text || "", options: opts };
}
const model = (t, size) => cell(t, { align: "left", margin: [0, 0.04, 0, 0.1], size });
const head = (t, align = "right") => cell(t, { size: 11, color: MUTED, align,
  margin: align === "left" ? [0, 0.04, 0, 0.1] : [0, 0.09, 0, 0.06],
  border: [NONE, SIDE, { pt: 1.25, color: RULE }, SIDE] });

function sectionTitle(n, text, x, y, w) {
  T([
    { text: n + "  ", options: { color: FAINT } },
    { text, options: { color: LG } },
  ], { x, y, w, h: TITLE_H - 0.06, fontSize: 13, bold: true, charSpacing: 1.5, valign: "bottom" });
}

// ================= LEFT: TVs =================
const oled = {
  sizes: ["42″", "48″", "55″", "65″", "77″", "83″", "97″"],
  rows: [
    ["B6",       ["", ["$699", "p"], "", "$1,399", "$2,299", "$3,499", ""]],
    ["B6E",      ["", "", "$899", "$1,099", "$1,699", "", ""]],
    ["C6 / C6H", ["$1,149", "$1,199", "$1,499", "$1,699", "$2,599", "$4,299", ""]],
    ["G6",       ["", "", ["$1,999", "r"], "$2,799", "$3,799", ["$5,499", "r"], "$19,999"]],
    ["W6",       ["", "", "", "", ["$4,299", "r"], ["$5,999", "r"], ""]],
  ],
};
const uhd = {
  sizes: ["43″", "50″", "55″", "65″", "75″", "85″", "Other sizes"],
  rows: [
    ["NU700B",       ["$219", "$249", "$279", "$379", "$529", ["$749", "r"], ""]],
    ["NU85",         ["", "", "$329", "$399", "$499", "$799", "98″  $1,499"]],
    ["QNED74B",      ["TBD", "TBD", "", "", "TBD", "TBD", ""]],
    ["QNED75B",      ["$299", "$329", "$349", "$459", "$649", "$949", ""]],
    ["QNED7S",       ["", "", "$329", "$429", "$549", "", ""]],
    ["QNED84B",      ["", "", "$599", "$699", "$999", "$1,399", "100″  $3,299"]],
    ["QNED91A",      ["", "", "$699", "$799", "$1,049", "$1,499", ""]],
    ["QNED92B",      ["", "", "", "", "", "", "115″  $12,999"]],
    ["LX7B",         ["", "", "$899", "$1,099", "", "", ""]],
    ["MRG95",        ["", "", "", "", "$3,599", "", "86″  $5,299   100″  $6,999"]],
  ],
};
const HEAD_H = 0.3;
const LRH = (BOTTOM - TOP - 2 * TITLE_H - 2 * HEAD_H - GAP) / (oled.rows.length + uhd.rows.length);

function priceTable(data, x, y, colW) {
  const rows = [[head("Model", "left"), ...data.sizes.map((t) => head(t))]];
  data.rows.forEach(([m, prices]) => rows.push([model(m), ...prices.map((p) => cell(p))]));
  s.addTable(rows, { x, y, w: colW.reduce((a, b) => a + b, 0), colW,
    rowH: [HEAD_H, ...Array(data.rows.length).fill(LRH)], autoPage: false });
  return y + HEAD_H + data.rows.length * LRH;
}

let y = TOP;
const MODEL_W = 1.42;
sectionTitle("01", "OLED", LX, y, LW); y += TITLE_H;
y = priceTable(oled, LX, y, [MODEL_W, ...Array(7).fill((LW - MODEL_W) / 7)]) + GAP;
sectionTitle("02", "UHD / QNED / SPECIALTY TVs", LX, y, LW); y += TITLE_H;
const SIZE_W = 0.74;
priceTable(uhd, LX, y, [MODEL_W, ...Array(6).fill(SIZE_W), LW - MODEL_W - 6 * SIZE_W]);

// ================= RIGHT: audio + monitors =================
const soundbars = [
  ["S95AR", "9.1.5", "$1,499"], ["S90TR", "7.1.3", "$1,199"], ["S90TY", "5.1.3", "$999"],
  ["S70TR", "5.1.1", ["$349", "r"]], ["S60TR", "5.1", ["$249", "r"]], ["SC9S", "3.1.3", "$699"],
  ["S35A", "2.1", "$149"], ["S20A", "2.0", ["$99", "r"]],
];
const soundSuite = [["H7", "$999"], ["W7", "$599"], ["M7", "$399"], ["M5", "$249"]];
const ultragear = [
  ["45GX90SB-B", "$1,099"], ["45GX950A-B", "$1,699"], ["39GX950B-B", ["$1,599", "r"]],
  ["32GX850A-B", "$799"], ["27GM950B-B", ["$799", "r"]],
];
const RRH = (BOTTOM - TOP - 3 * TITLE_H - 2 * GAP) / (soundbars.length + soundSuite.length + ultragear.length);
const RS = 14;
const PRICE_W = 1.3;

function listTable(rows, x, y) {
  const three = rows[0].length === 3;
  const colW = three ? [1.5, RW - 1.5 - PRICE_W, PRICE_W] : [RW - PRICE_W, PRICE_W];
  const body = rows.map((r) => r.map((v, i) =>
    i === 0 ? model(v, RS)
    : (three && i === 1) ? cell(v, { size: RS, bold: false, color: MUTED, align: "center" })
    : cell(v, { size: RS })));
  s.addTable(body, { x, y, w: RW, colW, rowH: Array(body.length).fill(RRH), autoPage: false });
  return y + body.length * RRH;
}

y = TOP;
sectionTitle("03", "SOUNDBARS", RX, y, RW); y += TITLE_H;
y = listTable(soundbars, RX, y) + GAP;
sectionTitle("04", "SOUND SUITE", RX, y, RW); y += TITLE_H;
y = listTable(soundSuite, RX, y) + GAP;
sectionTitle("05", "ULTRAGEAR OLED", RX, y, RW); y += TITLE_H;
listTable(ultragear, RX, y);

// ================= FOOTER: key + fine print =================
const FY = 7.0;
T("KEY", { x: MX, y: FY, w: 0.4, h: 0.26, fontSize: 10.5, bold: true, color: MUTED, charSpacing: 1.5,
  valign: "middle" });
let kx = MX + 0.5;
[[RED, "Price change", 1.05], [GREEN, "Bundle & save", 1.15], [PURPLE, "BBY+ / Total member deal", 2.0]]
  .forEach(([c, label, w]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: kx, y: FY + 0.04, w: 0.34, h: 0.18, rectRadius: 0.09,
      fill: { color: c }, line: { type: "none" } });
    T(label, { x: kx + 0.44, y: FY, w, h: 0.26, fontSize: 12, bold: true, color: INK, valign: "middle" });
    kx += 0.44 + w + 0.25;
  });
T("Prices subject to change  ·  For internal Best Buy use only", { x: RIGHT - 4.2, y: FY, w: 4.2, h: 0.26,
  fontSize: 10.5, color: MUTED, align: "right", valign: "middle" });

s.addNotes(fs.readFileSync(path.join(__dirname, "notes_full.txt"), "utf8"));
pres.writeFile({ fileName: OUT }).then((f) => console.log("wrote", f));
