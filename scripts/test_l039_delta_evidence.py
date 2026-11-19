"""Offline evidence checks, not source or issuer-value admission."""
import gzip, hashlib, io, json, pathlib, unittest, zipfile
from decimal import Decimal, ROUND_HALF_EVEN
import xml.etree.ElementTree as E
ROOT=pathlib.Path(__file__).resolve().parents[1]
B=ROOT/'evidence/real-issuer/L039-DELTA-2026-11-17'
class L039DeltaEvidence(unittest.TestCase):
 def test_raw_and_compressed_capture_hashes(self):
  for f in [B/'source/retrieval-ledger.json',*sorted((B/'source').glob('*/followup-ledger.json'))]:
   for r in json.loads(f.read_text())['sources']:
    if 'path' not in r:continue
    b=(f.parent/r['path']).read_bytes()
    self.assertEqual(hashlib.sha256(b).hexdigest(),r['compressedSha256'])
    self.assertEqual(hashlib.sha256(gzip.decompress(b)).hexdigest(),r['rawSha256'])
    self.assertEqual(len(gzip.decompress(b)),r['bytes'])
 def test_machine_fact_exact_bytes_context_and_noncurrent_warning(self):
  b=gzip.decompress((B/'source/march-xml.gz').read_bytes())
  self.assertEqual(hashlib.sha256(b).hexdigest(),'133f0cf14a5bbdecf055affc046e5aa73097f8d9793bf423942933b037f19d21')
  self.assertEqual(len(b),77918);r=E.fromstring(b);cap='{http://www.sebi.gov.in/xbrl/2026-01-31/in-capmkt}'
  for tag in ['CurrentInvestments','NoncurrentInvestments']:
   e=r.find(cap+tag);self.assertEqual(e.text,'0');self.assertEqual(e.attrib,{'contextRef':'OneI','decimals':'-7','unitRef':'INR'})
  x='{http://www.xbrl.org/2003/instance}';self.assertEqual(r.find(x+'context[@id="OneI"]/'+x+'period/'+x+'instant').text,'2026-03-31')
 def test_retried_archive_nested_bytes_and_actual_metadata(self):
  f=B/'source/access-retry/followup-ledger.json';a=json.loads(f.read_text())['archive']
  self.assertEqual(a['curlExit'],0);self.assertEqual(a['bytes'],8922025)
  self.assertEqual(a['rawSha256'],'b5fcb7e20e3bee034c58c45af8f19a3425d7a524938b5c09190a6651043ff182')
  self.assertEqual(len(a['nestedPackages']),2)
  for r in a['nestedPackages']:
   b=(f.parent/r['path']).read_bytes();self.assertEqual(hashlib.sha256(b).hexdigest(),r['compressedSha256'])
   raw=gzip.decompress(b);self.assertEqual(hashlib.sha256(raw).hexdigest(),r['sha256'])
   z=zipfile.ZipFile(io.BytesIO(raw));self.assertEqual(z.namelist(),r['members'])
  self.assertTrue(any('ent-2025-01-31.xsd' in n for n in a['nestedPackages'][1]['members']))
  self.assertFalse(any('2026-01-31' in n for r in a['nestedPackages'] for n in r['members']))
 def test_zero_does_not_override_explicit_decimals(self):
  quantum=Decimal(10)**7;self.assertEqual(quantum,Decimal('10000000'))
  self.assertEqual(quantum/2,Decimal('5000000'))
  # Illustrative normative nearest rounding, NOT a KEC source amount or an admitted current investment.
  self.assertEqual(Decimal(49000).quantize(Decimal('1E7'),rounding=ROUND_HALF_EVEN),Decimal(0))
  text=(B/'precision-standard-extract.txt').read_text()
  for s in ['4.6.5','4.6.6','precision','INF','roundTiesToEven']:self.assertIn(s,text)
 def test_official_packages_not_date_substituted(self):
  r=json.loads((B/'taxonomy-readback.json').read_text())
  for k,date,basis in [('nse-package','2025-01-31','IntegratedFinance_IndAS'),('bse-package','2026-01-31','IntegratedFinance_OtherThanBank')]:
   z=zipfile.ZipFile(io.BytesIO(gzip.decompress((B/'source'/(k+'.gz')).read_bytes())))
   self.assertIn(basis+'/in-capmkt-ent-'+date+'.xsd',z.namelist())
   self.assertIn(date,z.read('META-INF/taxonomyPackage.xml').decode())
   a=r[k]['concept']['attributes'];self.assertEqual(a['nillable'],'true');self.assertNotIn('default',a);self.assertNotIn('fixed',a)
   self.assertEqual(len(r[k]['dimensionDefaultArcs']),7)
 def test_no_new_source_admitted_and_status_stays_open(self):
  d=json.loads((B/'determination.json').read_text());self.assertEqual(d['status'],'OPEN')
  self.assertEqual(d['currentInvestments'],{'presence':'MISSING','reason':'NOT_REPORTED','value':None})
  self.assertTrue(all(v=='NOT_SATISFIED' for v in d['closurePaths'].values()))
  self.assertFalse(d['ownerDecisionMade']);self.assertFalse(d['newFinancialEvidenceAdmitted']);self.assertFalse(d['successorDatasetWritten'])
 def test_digest_manifest(self):
  m=json.loads((B/'digests.json').read_text())
  for n,s in m.items():self.assertEqual(hashlib.sha256((B/n).read_bytes()).hexdigest(),s,n)
if __name__=='__main__':unittest.main()
