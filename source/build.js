// Win The Week — redesigned weekly slide (16:9, 13.333" x 7.5")
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || "LG_WinTheWeekNPI.pptx";
const LOGO = fs.readFileSync(path.join(__dirname, "logo.png")).toString("base64");

// ---- palette (matches original deck) ----
const LG = "A50034";    // LG brand red
const INK = "19191E";   // body text
const MUTED = "62626B"; // secondary text
const RULE = "D9D9DE";  // row separators
const HEAD = "EDEDF0";  // table header fill
const CARD = "F5F5F7";  // card tint
// Highlight key — the only three colors used to fill price cells
const RED = "FF0000";    // Price change
const GREEN = "00C07A";  // Bundle & save
const PURPLE = "B060FF"; // BBY+ / Total member deal

const FONT = "Calibri";
const PT = 14;          // table text size everywhere

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = "Win The Week";
const s = pres.addSlide();
s.background = { color: "FFFFFF" };

// ---------- helpers ----------
const HL = { r: RED, g: GREEN, p: PURPLE };
// A price value may be "$699" or ["$699", "r"] (r/g/p = highlight)
function cell(v, opts = {}) {
  let text = v, fill;
  if (Array.isArray(v)) { text = v[0]; fill = HL[v[1]]; }
  const o = {
    fontFace: FONT, fontSize: PT, bold: true, color: INK, align: "right", valign: "middle",
    margin: [0, 0.09, 0, 0.06],
    border: [{ type: "none" }, { pt: 2, color: "FFFFFF" }, { pt: 0.75, color: RULE }, { pt: 2, color: "FFFFFF" }],
    ...opts,
  };
  if (fill) {
    o.fill = { color: fill };
    if (fill !== GREEN) o.color = "FFFFFF"; // white text reads best on red / purple
  }
  return { text: text || "", options: o };
}
const modelCell = (t) => cell(t, { bold: true, align: "left", margin: [0, 0.06, 0, 0.09] });
const headCell = (t, align = "right") =>
  cell(t, { bold: true, color: MUTED, fill: { color: HEAD }, align, fontSize: PT - 1,
            margin: align === "left" ? [0, 0.06, 0, 0.09] : [0, 0.09, 0, 0.06],
            border: [{ type: "none" }, { pt: 2, color: "FFFFFF" }, { type: "none" }, { pt: 2, color: "FFFFFF" }] });

function sectionTitle(text, x, y, w) {
  s.addText(text, { x, y, w, h: 0.3, margin: 0, fontFace: FONT, fontSize: 17, bold: true,
                    color: LG, valign: "bottom", isTextBox: true });
}

// ---------- layout constants ----------
const MX = 0.35, SW = 13.333;
const LX = MX, LW = 8.45;              // left column (TVs)
const RX = 9.1, RW = SW - MX - 9.1;    // right column (audio / monitors)
const TOP = 1.74;                      // content start
const TITLE_H = 0.3, TITLE_GAP = 0.05, SEC_GAP = 0.14;

// ================= HEADER =================
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: MX, y: 0.3, w: 1.1, h: 0.62, rectRadius: 0.08,
  fill: { color: LG }, line: { type: "none" } });
s.addImage({ data: "image/png;base64," + LOGO, x: MX + 0.12, y: 0.3 + 0.1, w: 0.86, h: 0.457,
  altText: "LG logo" });
s.addText("WIN THE WEEK", { x: MX + 1.25, y: 0.26, w: 4.4, h: 0.7, margin: 0, fontFace: FONT,
  fontSize: 40, bold: true, color: INK, valign: "middle", isTextBox: true });
s.addText([
  { text: "BEST BUY EXCLUSIVE PROMOTIONS", options: { bold: true, color: LG, breakLine: true } },
  { text: "Week of September 28, 2026", options: { bold: true, color: INK } },
], { x: MX, y: 1.0, w: 5.3, h: 0.5, margin: 0, fontFace: FONT, fontSize: 15, valign: "top",
     lineSpacingMultiple: 1.0, isTextBox: true });

// ---- Bundle & Save card ----
const BX = 5.8, BY = 0.3, BW = 5.35, BH = 1.3;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: BX, y: BY, w: BW, h: BH, rectRadius: 0.1,
  fill: { color: CARD }, line: { type: "none" } });
s.addText([
  { text: "BUNDLE & SAVE", options: { bold: true, color: LG, fontSize: 17, breakLine: true } },
  { text: "Qualifying OLED or QNED TV 55″+ with select soundbars", options: { color: INK, fontSize: 13 } },
], { x: BX + 0.15, y: BY + 0.07, w: BW - 0.3, h: 0.5, margin: 0, fontFace: FONT, valign: "top",
     isTextBox: true });
const chips = [["SAVE $200", "S95AR / SC9S"], ["SAVE $100", "S90TR / S90TY"], ["SAVE $50", "S70TR"]];
const CW = (BW - 0.3 - 0.2) / 3;
chips.forEach(([amt, models], i) => {
  const cx = BX + 0.15 + i * (CW + 0.1);
  s.addText(amt, { shape: pres.shapes.ROUNDED_RECTANGLE, x: cx, y: BY + 0.62, w: CW, h: 0.38,
    rectRadius: 0.06, fill: { color: GREEN }, line: { type: "none" }, margin: 0,
    fontFace: FONT, fontSize: 19, bold: true, color: INK, align: "center", valign: "middle" });
  s.addText(models, { x: cx, y: BY + 1.01, w: CW, h: 0.25, margin: 0, fontFace: FONT,
    fontSize: 14, bold: true, color: INK, align: "center", valign: "middle", isTextBox: true });
});

// ---- Free install card ----
const FX = BX + BW + 0.15, FW = SW - MX - FX;
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: FX, y: BY, w: FW, h: BH, rectRadius: 0.1,
  fill: { color: CARD }, line: { type: "none" } });
s.addText([
  { text: "FREE", options: { bold: true, color: LG, fontSize: 26, breakLine: true } },
  { text: "Install & delivery", options: { bold: true, color: INK, fontSize: 14, breakLine: true } },
  { text: "97″–100″ TVs", options: { color: MUTED, fontSize: 13 } },
], { x: FX + 0.12, y: BY + 0.08, w: FW - 0.24, h: BH - 0.16, margin: 0, fontFace: FONT,
     align: "center", valign: "middle", isTextBox: true });

// ================= LEFT: OLED =================
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
    ["NU700B",  ["$219", "$249", "$279", "$379", "$529", ["$749", "r"], ""]],
    ["NU85",    ["", "", "$329", "$399", "$499", "$799", "98″  $1,499"]],
    ["QNED74B", ["TBD", "TBD", "", "", "TBD", "TBD", ""]],
    ["QNED75B", ["$299", "$329", "$349", "$459", "$649", "$949", ""]],
    ["QNED7S",  ["", "", "$329", "$429", "$549", "", ""]],
    ["QNED84B", ["", "", "$599", "$699", "$999", "$1,399", "100″  $3,299"]],
    ["QNED91A", ["", "", "$699", "$799", "$1,049", "$1,499", ""]],
    ["QNED92B", ["", "", "", "", "", "", "115″  $12,999"]],
    ["LX7B",    ["", "", "$899", "$1,099", "", "", ""]],
    ["MRG95",   ["", "", "", "", "$3,599", "", "86″  $5,299    100″  $6,999"]],
  ],
};

const LEGEND_Y = 6.95;
const leftRows = oled.rows.length + 1 + uhd.rows.length + 1;
const LRH = (LEGEND_Y - 0.12 - TOP - 2 * (TITLE_H + TITLE_GAP) - SEC_GAP) / leftRows;

function priceTable(data, x, y, colW) {
  const rows = [[headCell("Model", "left"), ...data.sizes.map((t) => headCell(t))]];
  data.rows.forEach(([m, prices]) => rows.push([modelCell(m), ...prices.map((p) => cell(p))]));
  s.addTable(rows, { x, y, w: colW.reduce((a, b) => a + b, 0), colW,
                     rowH: Array(rows.length).fill(LRH), autoPage: false });
  return y + rows.length * LRH;
}

let y = TOP;
sectionTitle("OLED", LX, y, LW); y += TITLE_H + TITLE_GAP;
const MODEL_W = 1.35;
y = priceTable(oled, LX, y, [MODEL_W, ...Array(7).fill((LW - MODEL_W) / 7)]);
y += SEC_GAP;
sectionTitle("UHD / QNED / SPECIALTY TVs", LX, y, LW); y += TITLE_H + TITLE_GAP;
const SIZE_W = 0.76, OTHER_W = LW - MODEL_W - 6 * SIZE_W;
priceTable(uhd, LX, y, [MODEL_W, ...Array(6).fill(SIZE_W), OTHER_W]);

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
const rightRows = soundbars.length + soundSuite.length + ultragear.length;
const RRH = (LEGEND_Y - 0.12 - TOP - 3 * (TITLE_H + TITLE_GAP) - 2 * SEC_GAP) / rightRows;

function listTable(rows, x, y, colW) {
  const body = rows.map((r) => r.map((v, i) =>
    i === 0 ? modelCell(v)
    : (colW.length === 3 && i === 1) ? cell(v, { align: "center", color: MUTED, bold: false })
    : cell(v)));
  s.addTable(body, { x, y, w: colW.reduce((a, b) => a + b, 0), colW,
                     rowH: Array(body.length).fill(RRH), autoPage: false });
  return y + body.length * RRH;
}

y = TOP;
sectionTitle("SOUNDBARS", RX, y, RW); y += TITLE_H + TITLE_GAP;
y = listTable(soundbars, RX, y, [1.55, 1.0, RW - 2.55]) + SEC_GAP;
sectionTitle("SOUND SUITE", RX, y, RW); y += TITLE_H + TITLE_GAP;
y = listTable(soundSuite, RX, y, [2.55, RW - 2.55]) + SEC_GAP;
sectionTitle("ULTRAGEAR OLED", RX, y, RW); y += TITLE_H + TITLE_GAP;
listTable(ultragear, RX, y, [2.55, RW - 2.55]);

// ================= COLOR KEY =================
const key = [[RED, "Price change", 1.3], [GREEN, "Bundle & save", 1.45], [PURPLE, "BBY+ / Total member deal", 2.6]];
s.addText("KEY", { x: MX, y: LEGEND_Y, w: 0.5, h: 0.3, margin: 0, fontFace: FONT, fontSize: 13,
  bold: true, color: MUTED, valign: "middle", isTextBox: true });
let kx = MX + 0.55;
key.forEach(([c, label, w]) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: kx, y: LEGEND_Y + 0.03, w: 0.42, h: 0.24,
    rectRadius: 0.04, fill: { color: c }, line: { type: "none" } });
  s.addText(label, { x: kx + 0.52, y: LEGEND_Y, w, h: 0.3, margin: 0, fontFace: FONT, fontSize: 14,
    bold: true, color: INK, valign: "middle", isTextBox: true });
  kx += 0.52 + w + 0.3;
});

// ---- speaker notes carried over from the original deck ----
s.addNotes(fs.readFileSync(path.join(__dirname, "notes_full.txt"), "utf8"));

pres.writeFile({ fileName: OUT }).then((f) => console.log("wrote", f));
