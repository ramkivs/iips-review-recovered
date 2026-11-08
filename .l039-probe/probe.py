import sys, os, re, json, hashlib, gzip, urllib.request, urllib.parse, xml.etree.ElementTree as ET, io, datetime
from pathlib import Path
out=Path('l039-output'); out.mkdir(exist_ok=True)
log=open(out/'fact-context-report.txt','w',encoding='utf8')
def say(*args): print(*args,file=log,flush=True)
def get(url,name,expected=None):
    say('\nFETCH',name,url)
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36','Referer':'https://www.nseindia.com/','Accept':'*/*'})
        with urllib.request.urlopen(req,timeout=45) as r:
            b=r.read(12000000); say('status',r.status,'bytes',len(b),'sha256',hashlib.sha256(b).hexdigest(),'content-type',r.headers.get('Content-Type'))
        if expected and hashlib.sha256(b).hexdigest()!=expected: raise ValueError('SOURCE HASH MISMATCH')
        with open(out/(name+'.gz'),'wb') as f:
            with gzip.GzipFile(fileobj=f,mode='wb',mtime=0) as gz: gz.write(b)
        return b
    except Exception as e:
        say('ERROR',repr(e)); return None
X='http://www.xbrl.org/2003/instance'; XL='http://www.w3.org/1999/xlink'; LINK='http://www.xbrl.org/2003/linkbase'; XS='http://www.w3.org/2001/XMLSchema'; XD='http://xbrl.org/2006/xbrldi'; XSI='http://www.w3.org/2001/XMLSchema-instance'
def local(tag): return tag.split('}')[-1] if isinstance(tag,str) else ''
def analyze(name,b):
    say('\n=== INSTANCE',name,'===')
    if not b: return []
    try:
        namespaces={}
        for event,elem in ET.iterparse(io.BytesIO(b),events=('start-ns',)):
            namespaces.setdefault(elem[0],elem[1])
        say('NAMESPACES',json.dumps(namespaces,sort_keys=True))
        root=ET.fromstring(b)
        refs=[]
        for el in root.iter():
            if local(el.tag) in ('schemaRef','linkbaseRef','roleRef','arcroleRef'):
                href=el.get('{%s}href'%XL)
                if href: refs.append(href); say('REFERENCE',el.tag,dict(el.attrib))
        concepts=[e for e in root.iter() if local(e.tag)=='CurrentInvestments']
        say('CurrentInvestments matching local name count',len(concepts))
        contexts={e.get('id'):e for e in root.findall('{%s}context'%X)}
        units={e.get('id'):e for e in root.findall('{%s}unit'%X)}
        for i,e in enumerate(concepts,1):
            say('FACT',i,'expandedQName',e.tag,'rawValue',repr(e.text),'attributes',json.dumps(e.attrib,sort_keys=True))
            c=contexts.get(e.get('contextRef')); u=units.get(e.get('unitRef'))
            say('CONTEXT', ET.tostring(c,encoding='unicode') if c is not None else 'NOT FOUND')
            say('UNIT', ET.tostring(u,encoding='unicode') if u is not None else 'NOT FOUND')
            if c is not None:
                for n in c.iter():
                    if local(n.tag) in ('identifier','instant','startDate','endDate','forever','explicitMember','typedMember'):
                        say('CONTEXT NODE',n.tag,repr(n.text),dict(n.attrib),ET.tostring(n,encoding='unicode'))
            say('NIL',e.get('{%s}nil'%XSI,'absent'),'decimals',e.get('decimals','absent'),'precision',e.get('precision','absent'))
        text=b.decode('utf8',errors='replace')
        for pat in (r'<(?:[\w.-]+:)?CurrentInvestments\b[^>]*>.*?</(?:[\w.-]+:)?CurrentInvestments\s*>',r'<(?:[\w.-]+:)?CurrentInvestments\b[^>]*/>'):
            for m in re.finditer(pat,text,re.I|re.S): say('RAW FACT XML',m.group(0))
        return refs
    except Exception as e: say('PARSE ERROR',repr(e)); return []
base='https://nsearchives.nseindia.com/corporate/'
say('Runner UTC',datetime.datetime.now(datetime.timezone.utc).isoformat(),'NOTE runner clock may conflict with session date.')
items=[('march-consolidated-xbrl',base+'xbrl/INTEGRATED_FILING_INDAS_1668450_16052026105416_WEB.xml','133f0cf14a5bbdecf055affc046e5aa73097f8d9793bf423942933b037f19d21'),('march-rendered',base+'ixbrl/INTEGRATED_FILING_INDAS_158430_16052026225416_iXBRL_WEB.html','a9fa546bff8bcfc3dd531da0536370424c25b70a7cacd12373e06a7d7544a71b'),('september-consolidated-xbrl',base+'xbrl/INTEGRATED_FILING_INDAS_1751525_02112026092732_WEB.xml','59dd7e3bef485535eaec3db6ded52421088662469ba6bcecd315857073eda10c'),('march-standalone-xbrl',base+'xbrl/INTEGRATED_FILING_INDAS_1668449_16052026105222_WEB.xml','419e14bccf9707bf2f2be2ee7278105913be8a3ebb5819a37e83f8fe3698fb3a')]
blobs={}
for name,url,sha in items: blobs[name]=get(url,name,sha)
refs=analyze(items[0][0],blobs[items[0][0]])
analyze(items[2][0],blobs[items[2][0]])
analyze(items[3][0],blobs[items[3][0]])
say('\n=== RENDERED HTML ROW / TAG SOURCE ===')
if blobs['march-rendered']:
    text=blobs['march-rendered'].decode('utf8',errors='replace')
    for m in re.finditer('Current investments',text,re.I):
        say('RAW HTML WINDOW',re.sub(r'\s+',' ',text[max(0,m.start()-600):m.end()+900]))
    for m in re.finditer('CurrentInvestments',text,re.I):
        say('RAW CONCEPT WINDOW',re.sub(r'\s+',' ',text[max(0,m.start()-500):m.end()+700]))
say('\n=== TAXONOMY REFERENCES ===')
seen=set()
for ref in refs:
    url=urllib.parse.urljoin(items[0][1],ref)
    if url in seen: continue
    seen.add(url)
    if len(seen)>6: say('Reference fetch limit reached'); break
    b=get(url,'taxonomy-ref-'+str(len(seen)))
    if not b: continue
    try:
        root=ET.fromstring(b)
        for e in root.iter():
            if any('CurrentInvestments' in str(x) for x in [e.tag,*e.attrib.values(),e.text or '']): say('TAXONOMY MATCH',ET.tostring(e,encoding='unicode')[:7000])
        for e in root.iter():
            if local(e.tag) in ('linkbaseRef','import','include'):
                say('TAXONOMY CHILD REFERENCE',e.tag,dict(e.attrib))
    except Exception as e: say('TAXONOMY PARSE ERROR',repr(e))
log.close()
if blobs[items[0][0]] is None: sys.exit('ERROR: source instance not verified; report preserved')
