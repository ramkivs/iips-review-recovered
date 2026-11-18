"""Offline structural readback, not a DTS validator or issuer-value admission."""
import gzip, hashlib, io, json, pathlib, xml.etree.ElementTree as E, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
B=ROOT/'evidence/real-issuer/L039-DELTA-2026-11-17'
XL='{http://www.w3.org/1999/xlink}'
XS='{http://www.w3.org/2001/XMLSchema}'
def readback(path):
 raw=gzip.decompress(path.read_bytes());z=zipfile.ZipFile(io.BytesIO(raw));out={'source':str(path.relative_to(ROOT)),'rawSha256':hashlib.sha256(raw).hexdigest(),'files':{},'relatedNetworks':[],'dimensionDefaultArcs':[]}
 for name in z.namelist():
  if not name.endswith(('.xml','.xsd')):continue
  b=z.read(name)
  try:r=E.fromstring(b)
  except E.ParseError:continue
  out['files'][name]={'sha256':hashlib.sha256(b).hexdigest(),'targetNamespace':r.get('targetNamespace'),'imports':[e.attrib for e in r.findall(XS+'import')],'references':[e.attrib for e in r.iter() if e.tag.split('}')[-1] in ['linkbaseRef','entryPointDocument','rewriteURI']]}
  for e in r.iter():
   if e.get('name')=='CurrentInvestments':out['concept']={'file':name,'attributes':e.attrib,'children':[E.tostring(c,encoding='unicode') for c in e]}
   if e.tag.split('}')[-1].endswith('Arc') and 'dimension-default' in e.get(XL+'arcrole',''):out['dimensionDefaultArcs'].append({'file':name,'attributes':e.attrib})
  for link in r:
   loc={e.get(XL+'label'):e.get(XL+'href') for e in link if e.tag.split('}')[-1]=='loc'}
   for arc in link:
    if 'dimension-default' in arc.get(XL+'arcrole',''):
     for default in out['dimensionDefaultArcs']:
      if default['file']==name and default['attributes']==arc.attrib:
       default.update(role=link.get(XL+'role'),fromLocator=loc.get(arc.get(XL+'from')),toLocator=loc.get(arc.get(XL+'to')))
   target=[k for k,v in loc.items() if v and v.endswith('#in-capmkt_CurrentInvestments')]
   if not target:continue
   arcs=[e for e in link if e.tag.split('}')[-1].endswith('Arc')]
   related=[e for e in arcs if e.get(XL+'from') in target or e.get(XL+'to') in target]
   # Include siblings of calculation/presentation parent to show asset-block placement, without inferring nil.
   parents={e.get(XL+'from') for e in related if e.get(XL+'to') in target}
   edges=[e for e in arcs if e in related or e.get(XL+'from') in parents]
   labels={e.get(XL+'label'):E.tostring(e,encoding='unicode') for e in link if e.tag.split('}')[-1] not in ['loc'] and not e.tag.split('}')[-1].endswith('Arc')}
   out['relatedNetworks'].append({'file':name,'role':link.get(XL+'role'),'locators':loc,'arcs':[e.attrib for e in edges],'resources':{k:v for k,v in labels.items() if any(e.get(XL+'to')==k for e in related)}})
 out['boundary']='Official package contents read structurally; external imports and filing DTS NOT validated. Package path/basis must match before applying to KEC. No numeric default or economic nil inferred.'
 return out
if __name__=='__main__':
 result={k:readback(B/'source'/(k+'.gz')) for k in ['nse-package','bse-package']}
 (B/'taxonomy-readback.json').write_text(json.dumps(result,indent=2)+'\n')
