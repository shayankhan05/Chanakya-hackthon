from pathlib import Path
import json
import re
import pypdfium2 as pdfium
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parent
pdf=pdfium.PdfDocument(str(ROOT/'ComplianceCopilot-User-Guide.pdf'))
rendered=ROOT/'rendered'
rendered.mkdir(exist_ok=True)
texts=[]
for i in range(len(pdf)):
    page=pdf[i]
    text=page.get_textpage().get_text_range()
    texts.append(text)
    image=page.render(scale=1.4).to_pil().convert('RGB')
    image.save(rendered/f'page-{i+1:02}.png')
for start in range(0,len(pdf),2):
    pages=[Image.open(rendered/f'page-{i+1:02}.png') for i in range(start,min(start+2,len(pdf)))]
    sheet=Image.new('RGB',(sum(p.width for p in pages)+30,max(p.height for p in pages)+34),'#e5e7eb')
    draw=ImageDraw.Draw(sheet)
    x=10
    for i,p in enumerate(pages):
        sheet.paste(p,(x,24))
        draw.text((x,6),f'Page {start+i+1}',fill='black')
        x+=p.width+10
    sheet.save(rendered/f'pair-{start//2+1:02}.png')
all_text='\n'.join(texts)
required=['What the app does','The workflow in simple words','Smart compliance planning','Ask Copilot','Record completion declaration','Confirm CSV update','Reopen and preserve history','Calculate financial impact','Offline judge mode','25 October 2026']
normalized=' '.join(all_text.split())
missing=[s for s in required if s not in normalized]
if missing:raise RuntimeError('Missing guide content: '+str(missing))
assert len(pdf)>=20
assert all(len(t.strip())>100 for t in texts), 'Unexpected blank page'
report={'pages':len(pdf),'words':len(all_text.split()),'all_required_topics_present':not missing,'blank_pages':[], 'page_word_counts':[len(t.split()) for t in texts]}
(ROOT/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf8')
(ROOT/'rendered-text.txt').write_text(all_text,encoding='utf8')
print(json.dumps(report))

