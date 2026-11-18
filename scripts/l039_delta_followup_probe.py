"""Bounded L039 follow-up on links discovered in first capture; no admission."""
import concurrent.futures, gzip, hashlib, io, json, pathlib, re, subprocess, zipfile
import l039_delta_source_probe as p
p.OUT=pathlib.Path('l039-followup-capture');p.OUT.mkdir(exist_ok=True)
urls={
 'issuer-actual-results':'https://www.kecrpg.com/financial-annual-results',
 'issuer-actual-quarterly':'https://www.kecrpg.com/quarterly-results',
 'issuer-earnings':'https://www.kecrpg.com/press-release/earnings/financial-performance-for-quarter-&-half-year-ended-30-september-2026-02-11',
 'bse-otherthanbank':'https://www.bseindia.com/downloads1/Intg_filing_Financial_Other_than_Banks.zip',
 'sebi-entry-otherthanbank':'https://www.sebi.gov.in/xbrl/2026-01-31/IntegratedFinance_OtherThanBank/in-capmkt-ent-2026-01-31.xsd',
}
import os
if os.environ.get('L039_ACCESS_RETRY_ONLY') == '1': urls={}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:rows=list(pool.map(p.fetch,urls.items()))
# Inspect the archived IndAS packages, without retaining the unrelated 8.9MB archive.
u=p.URLS['nse-archives'];r=subprocess.run(['curl','-L','--http1.1','-A','Mozilla/5.0','--max-time','60','--retry','2','--retry-all-errors','-sS',u],capture_output=True)
b=r.stdout;archive={'url':u,'retrievedAtUTC':p.datetime.now(p.timezone.utc).isoformat(),'curlExit':r.returncode,'stderr':r.stderr.decode(errors='replace'),'bytes':len(b),'rawSha256':hashlib.sha256(b).hexdigest(),'admission':'DISCOVERY_ONLY_NOT_ADMITTED','nestedPackages':[]}
try:
 z=zipfile.ZipFile(io.BytesIO(b))
 for n in z.namelist():
  if not re.search(r'Ind.?AS',n,re.I):continue
  data=z.read(n);record={'member':n,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),**p.save('archive-'+str(len(archive['nestedPackages'])),data)}
  zz=zipfile.ZipFile(io.BytesIO(data));record['members']=zz.namelist();record['metadata']={}
  for m in zz.namelist():
   if m.endswith(('.xml','.xsd')) and any(k in m for k in ['taxonomyPackage','catalog','ent-']):record['metadata'][m]=zz.read(m).decode(errors='replace')
  archive['nestedPackages'].append(record)
except Exception as e:archive['error']=repr(e)
# New transcript and post-cutoff meeting intimation are context, not audited March balance evidence.
for name,url in [('transcript','https://nsearchives.nseindia.com/corporate/KEC_06112026155134_SE_Intimation_Transcript.pdf'),('meeting','https://nsearchives.nseindia.com/corporate/KEC_12112026182139_AnalystMeetIntimation.pdf')]:
 r=subprocess.run(['curl','-L','--http1.1','-A','Mozilla/5.0','--max-time','60','--retry','2','--retry-all-errors','-sS','-w','\n%{http_code}',url],capture_output=True);parts=r.stdout.rsplit(b'\n',1)
 row={'name':name,'url':url,'retrievedAtUTC':p.datetime.now(p.timezone.utc).isoformat(),'curlExit':r.returncode,'stderr':r.stderr.decode(errors='replace'),'admission':'DISCOVERY_ONLY_NOT_ADMITTED'}
 try:
  b,status=parts;row.update(http=int(status),bytes=len(b),rawSha256=hashlib.sha256(b).hexdigest())
  if int(status)==200 and b.startswith(b'%PDF'):
   reader=p.PdfReader(io.BytesIO(b));row['pages']=len(reader.pages)
   texts=[page.extract_text(extraction_mode='layout') or '' for page in reader.pages]
   row['hitPages']=[i+1 for i,t in enumerate(texts) if re.search(r'current investment|rounding|taxonomy|march 31|31.march|net debt|net.debt',t,re.I)]
   for i in ([1] if name=='meeting' else row['hitPages'][:12]):(p.OUT/(name+'-page-'+str(i)+'.txt')).write_text(texts[i-1])
   row['inspection']='All pages keyword scanned; bounded hits retained, management KPI not canonical balance'
 except Exception as e:row['error']=repr(e)
 rows.append(row)
(p.OUT/'followup-ledger.json').write_text(json.dumps({'sources':rows,'archive':archive},indent=2)+'\n')
