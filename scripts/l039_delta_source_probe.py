"""L-039 only: bounded official-source discovery, no financial admission or product writes.
Run on an internet-capable evidence runner; pypdf 6.1.3 is isolated runner tooling.
Retains taxonomy ZIPs and small source bodies losslessly; PDFs retain hashes and bounded extracts.
"""
import base64, concurrent.futures, gzip, hashlib, html, io, json, pathlib, re, subprocess, zipfile
from datetime import datetime, timezone
from pypdf import PdfReader

OUT = pathlib.Path('l039-delta-capture'); OUT.mkdir(exist_ok=True)
N = 'https://nsearchives.nseindia.com'
URLS = {
 'nse-index': 'https://www.nseindia.com/static/companies-listing/xbrl-information',
 'bse-index': 'https://www.bseindia.com/static/about/xbrl_info',
 'nse-package': N+'/web/sites/default/files/inline-files/Taxonomy%20Integrated%20filing%20finance%20%28IndAS%29.zip',
 'bse-package': 'https://www.bseindia.com/downloads1/Integrated_Filing_Financial_Ind_AS.zip',
 'nse-archives': N+'//web/mediaattachment/2026-07/Taxonomy_Archives_20260731164437.zip',
 'nse-entry-2026': N+'/corporate/xbrl/in-capmkt-ent-2026-01-31.xsd',
 'sebi-entry-2026': 'https://www.sebi.gov.in/xbrl/2026-01-31/IntegratedFinance_IndAS/in-capmkt-ent-2026-01-31.xsd',
 'sebi-core-2026': 'https://www.sebi.gov.in/xbrl/2026-01-31/core/in-capmkt.xsd',
 'sebi-publications': 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=7&smid=0',
 'issuer-investors': 'https://www.kecrpg.com/investors',
 'issuer-annuals': 'https://www.kecrpg.com/investor-relations/annual-reports',
 'issuer-results': 'https://www.kecrpg.com/financial-results',
 'issuer-fy26': 'https://www.kecrpg.com/public/media/annualReportMedia/KEC_Annual_Report_2025-26.pdf',
 'march-xml': N+'/corporate/xbrl/INTEGRATED_FILING_INDAS_1668450_16052026105416_WEB.xml',
 'march-rendered': N+'/corporate/ixbrl/INTEGRATED_FILING_INDAS_158430_16052026225416_iXBRL_WEB.html',
 'september-results': N+'/corporate/KEC_02112026210430_SE_intimation_BM_outcome_Results.pdf',
 'nse-integrated': 'https://www.nseindia.com/api/integrated-filing-results?index=equities&symbol=KEC',
 'nse-announcements': 'https://www.nseindia.com/api/corporate-announcements?index=equities&symbol=KEC',
 'bse-announcements': 'https://api.bseindia.com/BseIndiaAPI/api/AnnGetData/w?strCat=Result&strPrevDate=20261108&strNextDate=20261117&strScrip=532714&strSearch=P&strType=C&strSort=1&strSortBy=0',
 'xbrl-spec': 'https://www.xbrl.org/Specification/XBRL-2.1/REC-2003-12-31/XBRL-2.1-REC-2003-12-31+corrected-errata-2013-02-20.html',
 'xbrl-precision-guidance': 'https://www.xbrl.org/guidance/precision-decimals/',
}
def sha(b): return hashlib.sha256(b).hexdigest()
def save(name,b):
 p=OUT/(name+'.gz'); p.write_bytes(gzip.compress(b,mtime=0));return {'path':p.name,'compressedSha256':sha(p.read_bytes())}
def fetch(pair):
 name,url=pair; row={'name':name,'url':url,'retrievedAtUTC':datetime.now(timezone.utc).isoformat(),'owner': 'XBRL International' if 'xbrl-' in name else ('KEC International' if name.startswith('issuer') else ('BSE' if name.startswith('bse') else ('SEBI' if name.startswith('sebi') else 'NSE'))),'admission':'DISCOVERY_ONLY_NOT_ADMITTED','rights':'public retrieval is not owner admission, redistribution or execution authorization'}
 try:
  r=subprocess.run(['curl','-L','--max-time','65','--retry','1','-sS','-A','Mozilla/5.0','-w','\n%{http_code}\n%{url_effective}',url],capture_output=True)
  parts=r.stdout.rsplit(b'\n',2)
  if r.returncode or len(parts)!=3:row.update(error=r.stderr.decode(errors='replace'),interpretation='access failure, not nonexistence');return row
  b,status,final=parts;row.update(http=int(status),finalUrl=final.decode(),bytes=len(b),rawSha256=sha(b))
  if len(b)<4_000_000:row.update(save(name,b))
  if int(status)!=200:row['interpretation']='HTTP failure, not nonexistence';return row
  if b.startswith(b'PK'):
   z=zipfile.ZipFile(io.BytesIO(b));row['zipMembers']=[{'name':i.filename,'bytes':i.file_size} for i in z.infolist()]
   row['taxonomyExcerpts']={}
   for member in z.namelist():
    if member.endswith(('.xsd','.xml')) and z.getinfo(member).file_size<3_000_000:
     text=z.read(member).decode(errors='replace')
     if any(k in member for k in ['taxonomyPackage','catalog','in-capmkt']):
      if any(k in member for k in ['taxonomyPackage','catalog','ent-']):row['taxonomyExcerpts'][member]=text[:22000]
      else:row['taxonomyExcerpts'][member]=[text[max(0,m.start()-500):m.end()+1400] for m in list(re.finditer('CurrentInvestments|dimension-default',text))[:25]]
   return row
  if b.startswith(b'%PDF'):
   reader=PdfReader(io.BytesIO(b));row['pdfPages']=len(reader.pages);row['pdfMetadata']={str(k):str(v) for k,v in (reader.metadata or {}).items()}
   pages=[7,16] if name=='september-results' else [117,129,131,132,145]
   row['extractPages']=pages
   for n in pages:
    text=reader.pages[n-1].extract_text(extraction_mode='layout') or ''
    (OUT/(name+'-page-'+str(n)+'.txt')).write_text(text)
   row['inspection']='Selected consolidated notes and standalone comparison only; no new all-page absence assertion'
   return row
  text=b.decode(errors='replace')
  if name.startswith('nse-') and name in ['nse-integrated','nse-announcements']:
   try:
    data=json.loads(text);rows=data if isinstance(data,list) else data.get('data',[])
    row['recordCount']=len(rows);row['discoveryRecords']=rows if name=='nse-integrated' else [x for x in rows if re.search(r'financial|result|corrigen|clarif|annual report',json.dumps(x),re.I)][:65]
   except Exception as e:row['parseError']=str(e)
  else:
   links=sorted(set(html.unescape(x) for x in re.findall(r'(?:href|src)=[\"\x27]([^\"\x27]+)',text,re.I)))
   row['discoveryLinks']=[x for x in links if re.search(r'IndAS|ind_as|capmkt|taxonomy|annual|financial|result|clarif|investor',x,re.I)][:130]
  return row
 except Exception as e:row['error']=repr(e);row['interpretation']='retrieval/parse limitation, not nonexistence';return row
if __name__ == '__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: rows=list(pool.map(fetch,URLS.items()))
 (OUT/'retrieval-ledger.json').write_text(json.dumps({'sessionDate':'2026-11-17','runnerClockNote':'Runner timestamps retained as observed; not an unqualified session-date completeness cutoff.','sources':rows},indent=2)+'\n')
 print('Captured',len(rows),'candidates; no source admission')
