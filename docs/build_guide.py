from pathlib import Path
import re
from html import escape
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, CondPageBreak
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/SME-Compliance-Copilot-Complete-Guide.md'
OUTPUT = ROOT / 'output/pdf/SME-Compliance-Copilot-Complete-Guide.pdf'
for name, filename in [('Guide','arial.ttf'),('GuideBold','arialbd.ttf'),('GuideItalic','ariali.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts')/filename)))
pdfmetrics.registerFontFamily('Guide', normal='Guide', bold='GuideBold', italic='GuideItalic', boldItalic='GuideBold')
INK = colors.HexColor('#17233b')
BLUE = colors.HexColor('#3f46a9')
GRAY = colors.HexColor('#69758a')
WIDTH = A4[0] - 104
styles = {
 'body': ParagraphStyle('body', fontName='Guide', fontSize=10, leading=14, textColor=INK, spaceAfter=9),
 'h1': ParagraphStyle('h1',fontName='GuideBold',fontSize=19,leading=24,textColor=colors.black,spaceBefore=19,spaceAfter=12,keepWithNext=True),
 'h2': ParagraphStyle('h2',fontName='GuideBold',fontSize=12,leading=17,textColor=colors.black,spaceBefore=13,spaceAfter=7,keepWithNext=True),
 'cell': ParagraphStyle('cell',fontName='Guide',fontSize=8.6,leading=12.3,textColor=INK,spaceAfter=0),
 'headcell': ParagraphStyle('headcell',fontName='GuideBold',fontSize=8.6,leading=12.3,textColor=colors.white,spaceAfter=0),
 'title': ParagraphStyle('title',fontName='GuideBold',fontSize=30,leading=37,textColor=colors.black,spaceAfter=20),
 'subtitle': ParagraphStyle('subtitle',fontName='Guide',fontSize=15,leading=22,textColor=colors.black,spaceAfter=18),
 'meta': ParagraphStyle('meta',fontName='Guide',fontSize=10,leading=16,textColor=GRAY,spaceAfter=12),
}

def markup(text):
    text=escape(text)
    text=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',text)
    text=re.sub(r'`([^`]+)`',r'<font name="Guide">\1</font>',text)
    return text

class GuideDoc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable,Paragraph) and flowable.style.name=='h1':
            text=flowable.getPlainText()
            if text=='Contents': return
            key='section-'+re.sub(r'[^a-z0-9]+','-',text.lower())
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text,key,0,False)
            self.notify('TOCEntry',(0,text,self.page,key))

def decorate(canvas,doc):
    canvas.saveState()
    if doc.page>1:
        canvas.setFont('Guide',8)
        canvas.setFillColor(GRAY)
        canvas.drawString(52,A4[1]-32,'SME Compliance Copilot | User manual and implementation reference')
        canvas.drawString(52,29,'Version 1.0 | 24 October 2026')
        canvas.drawRightString(A4[0]-52,29,str(doc.page))
    canvas.restoreState()

doc=GuideDoc(str(OUTPUT),pagesize=A4,leftMargin=52,rightMargin=52,topMargin=58,bottomMargin=50,title='SME Compliance Copilot Complete Guide',author='SME Compliance Copilot',pageCompression=1)
doc.addPageTemplates([PageTemplate(id='normal',frames=[Frame(52,50,WIDTH,A4[1]-108,id='body',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=decorate)])
lines=SOURCE.read_text(encoding='utf-8').splitlines()
story=[Spacer(1,50),Paragraph('SME Compliance Copilot<br/>Complete Guide',styles['title']),Paragraph('User manual and implementation reference',styles['subtitle']),Paragraph('Version 1.0 | 24 October 2026',styles['meta']),Spacer(1,25)]
first_section=next(i for i,line in enumerate(lines) if line.startswith('## '))
opening='\n'.join(lines[6:first_section]).strip().split('\n\n')
for p in opening:
    if p:story.append(Paragraph(markup(p.replace('\n',' ')),styles['body']))
story.extend([Spacer(1,22),Paragraph('Inside this guide',styles['h2']),Paragraph('Screen tours and every button explained<br/>Demo and connected-mode behavior<br/>A practical walkthrough and sample data<br/>Rules, APIs, database models, and deployment setup<br/>Known limits and development priorities',styles['body']),PageBreak(),Paragraph('Contents',styles['h1'])])
toc=TableOfContents()
toc.levelStyles=[ParagraphStyle('toc',fontName='Guide',fontSize=10.5,leading=18,textColor=INK,spaceBefore=8,leftIndent=0,firstLineIndent=0)]
story.extend([toc,Spacer(1,24),Paragraph('How to use this guide',styles['h2']),Paragraph('Start with Sections 1 to 4 for the daily workflow. Sections 5 to 9 explain individual features and controls. Section 10 provides a ready-to-use demonstration sequence. Sections 11 and 12 cover implementation, setup, limitations, and troubleshooting.',styles['body']),PageBreak()])

i=first_section
while i<len(lines):
    line=lines[i].strip()
    if not line:i+=1;continue
    if line.startswith('## '):
        story.append(Paragraph(markup(line[3:]),styles['h1']));i+=1;continue
    if line.startswith('### '):
        if i+2<len(lines) and lines[i+2].startswith('|'): story.append(CondPageBreak(105))
        story.append(Paragraph(markup(line[4:]),styles['h2']));i+=1;continue
    if line.startswith('|'):
        rows=[]
        while i<len(lines) and lines[i].strip().startswith('|'):
            cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r'[-: ]+',c) for c in cells):rows.append(cells)
            i+=1
        n=len(rows[0])
        widths={2:[WIDTH*.29,WIDTH*.71],3:[WIDTH*.22,WIDTH*.34,WIDTH*.44],5:[WIDTH*.35,WIDTH*.14,WIDTH*.12,WIDTH*.17,WIDTH*.22]}[n]
        data=[[Paragraph(markup(c),styles['headcell' if r==0 else 'cell']) for c in row] for r,row in enumerate(rows)]
        table=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
        table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),BLUE),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f6f7fb')]),('GRID',(0,0),(-1,-1),.45,colors.HexColor('#d9d9d9')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9)]))
        story.extend([Spacer(1,1),table,Spacer(1,13)]);continue
    paras=[line];i+=1
    while i<len(lines) and lines[i].strip() and not lines[i].startswith(('#','|')) and not re.match(r'^\d+\. ',lines[i]):
        paras.append(lines[i].strip());i+=1
    story.append(Paragraph(markup(' '.join(paras)),styles['body']))

doc.multiBuild(story)
print(OUTPUT)


