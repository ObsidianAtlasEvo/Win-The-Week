"""Post-process: put the highlight key colors into the theme palette so they appear
in PowerPoint's Fill Color picker, and give empty table cells the body text color."""
import sys, zipfile, re
src, dst = sys.argv[1], sys.argv[2]
zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
ACC = {"accent1": "E31937", "accent2": "12B76A", "accent3": "8B5CF6",
       "accent4": "A50034", "accent5": "6B6B78", "accent6": "F5F5F8"}
CUST = ('<a:custClrLst>'
        '<a:custClr name="Price change"><a:srgbClr val="E31937"/></a:custClr>'
        '<a:custClr name="Bundle &amp; save"><a:srgbClr val="12B76A"/></a:custClr>'
        '<a:custClr name="BBY+ / Total member deal"><a:srgbClr val="8B5CF6"/></a:custClr>'
        '</a:custClrLst>')
masters_theme = None
for item in zin.infolist():
    data = zin.read(item.filename)
    if item.filename.startswith("ppt/theme/theme") and item.filename.endswith(".xml"):
        s = data.decode("utf8")
        s = re.sub(r'<a:clrScheme name="[^"]*">', '<a:clrScheme name="Win The Week">', s)
        s = re.sub(r'<a:dk2>.*?</a:dk2>', '<a:dk2><a:srgbClr val="15151A"/></a:dk2>', s, flags=re.S)
        for k, v in ACC.items():
            s = re.sub(rf'<a:{k}>.*?</a:{k}>', f'<a:{k}><a:srgbClr val="{v}"/></a:{k}>', s, flags=re.S)
        s = s.replace("<a:custClrLst/>", "")
        if "custClrLst" not in s:
            if "<a:extLst>" in s and s.rfind("<a:extLst>") > s.rfind("</a:objectDefaults>"):
                i = s.rfind("<a:extLst>")
            else:
                i = s.rfind("</a:theme>")
            if "<a:extraClrSchemeLst/>" in s or "</a:extraClrSchemeLst>" in s:
                j = s.find("<a:extraClrSchemeLst/>")
                j = j + len("<a:extraClrSchemeLst/>") if j >= 0 else s.find("</a:extraClrSchemeLst>") + len("</a:extraClrSchemeLst>")
                s = s[:j] + CUST + s[j:]
            else:
                s = s[:i] + "<a:extraClrSchemeLst/>" + CUST + s[i:]
        data = s.encode("utf8")
    elif item.filename == "ppt/slides/slide1.xml":
        s = data.decode("utf8")
        s = re.sub(r'(<a:endParaRPr lang="en-US" sz="\d+" dirty="0">)(<a:latin)',
                   r'\1<a:solidFill><a:srgbClr val="15151A"/></a:solidFill>\2', s)
        data = s.encode("utf8")
    zout.writestr(item, data)
zout.close()
