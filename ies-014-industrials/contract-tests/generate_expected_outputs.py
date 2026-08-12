"""Generate IES-014 expected outputs from the D15 v1.2 contract + golden dataset."""
import json, math, sys, os

BANDS = {
    'IM-001': [ (8,40), (15,60), (25,75), (float('inf'),90) ],
    'IM-002': [ (2,40), (5,60), (10,75), (float('inf'),90) ],
    'IM-003': [ (1.5,90), (2.5,75), (3.5,55), (float('inf'),30) ],
    'IM-004': [ (8,90), (12,75), (16,60), (float('inf'),40) ],
    'IM-005': [ (8,40), (15,60), (25,75), (float('inf'),90) ],
    'IM-006': [ (1,40), (2,60), (3,75), (float('inf'),90) ],
    'IM-007': [ (0.9,40), (1.0,60), (1.1,75), (float('inf'),90) ],
    'IM-008': [ (15,40), (30,60), (50,75), (float('inf'),90) ],
    'IM-009': [ (3,40), (6,60), (10,75), (float('inf'),90) ],
    'IM-010': [ (0,40), (5,60), (10,75), (float('inf'),90) ],
    'IM-011': [ (10,40), (18,60), (28,75), (float('inf'),90) ],
    'IM-012': [ (15,90), (30,75), (50,60), (float('inf'),40) ],
}
SEGMENTS = {
    'capital-goods':{'w':[0.25,0.25,0.20,0.15,0.10,0.05],'alert':3.5},
    'aero-defense':{'w':[0.30,0.20,0.15,0.20,0.10,0.05],'alert':3.0},
    'transportation':{'w':[0.25,0.15,0.25,0.20,0.10,0.05],'alert':3.5},
    'eandc':{'w':[0.20,0.20,0.30,0.15,0.10,0.05],'alert':3.0},
    'electrical-equipment':{'w':[0.30,0.20,0.15,0.20,0.10,0.05],'alert':3.0},
    'diversified':{'w':[0.30,0.15,0.15,0.20,0.10,0.10],'alert':3.5},
}
ARCH = {'oem':1.2,'aftermarket':0.8,'epc':1.3,'distributor':1.0,'diversified':1.0}
VERDICT = [ (80,'Strong Buy'), (70,'Buy'), (60,'Accumulate'), (50,'Hold'), (40,'Watch'), (0,'Avoid') ]
CAP = {'governance':'Avoid','defense-program':'Watch','epc-overrun':'Watch','order-cancellation':'Watch','margin-compression':'Watch','leverage-breach':'Watch'}
RANK = {'Strong Buy':6,'Buy':5,'Accumulate':4,'Hold':3,'Watch':2,'Avoid':1}

def r1h2e(x):
    s=x*10; f=math.floor(s); fr=s-f
    return (f if f%2==0 else f+1)/10 if fr==0.5 else round(s)/10
def mscore(mid, x):
    for upper,s in BANDS[mid]:
        if x < upper: return s
    return BANDS[mid][-1][1]
def _renorm(items):
    avail=[(s,w) for (_,s,w) in items if s is not None]
    if not avail: return 0.0
    return sum(s*w for s,w in avail)/sum(w for _,w in avail)
def pillar_full(m):
    def met(mid):
        v=m.get(mid); return mscore(mid,v) if v is not None else None
    im008=met('IM-008'); im001=met('IM-001'); im011=met('IM-011')
    cost_pos=im011
    exe_parts=[s for s in (im001,im011) if s is not None]
    execution=sum(exe_parts)/len(exe_parts) if exe_parts else None
    q_items=[]
    if im008 is not None: q_items.append(('a',im008,0.40))
    if cost_pos is not None: q_items.append(('c',cost_pos,0.35))
    if execution is not None: q_items.append(('e',execution,0.25))
    quality=_renorm(q_items)
    growth=_renorm([(k,met(k),w) for k,w in (('IM-006',0.40),('IM-010',0.35),('IM-002',0.25))])
    risk=_renorm([(k,met(k),w) for k,w in (('IM-003',0.70),('IM-012',0.30))])
    profit=_renorm([(k,met(k),w) for k,w in (('IM-001',0.40),('IM-011',0.40),('IM-005',0.20))])
    capeff=_renorm([(k,met(k),w) for k,w in (('IM-009',0.50),('IM-005',0.50))])
    val=_renorm([(k,met(k),w) for k,w in (('IM-004',1.00),)])
    return (quality,growth,risk,profit,capeff,val)
def composite(m, seg, arch):
    Q,G,R,P,CE,V=pillar_full(m); w=list(SEGMENTS[seg]['w']); w[2]=w[2]*ARCH[arch]
    return r1h2e(Q*w[0]+G*w[1]+R*w[2]+P*w[3]+CE*w[4]+V*w[5])
def verdict(c):
    for lo,label in VERDICT:
        if c>=lo: return label
    return 'Avoid'
def final_verdict(m, seg, arch):
    comp=composite(m,seg,arch); v=verdict(comp)
    if m.get('IM-003') is not None and m['IM-003']>=SEGMENTS[seg]['alert']:
        if RANK[v]>RANK['Watch']: v='Watch'
    for ovr in m.get('_overrides',[]):
        cap=CAP[ovr]
        if RANK[v]>RANK[cap]: v=cap
    return v, comp

BASE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
gd=json.load(open(os.path.join(BASE,'datasets','industrials-golden-reference-1.0.0.json')))
expected=[]
for p in gd['providers']:
    m={k:p.get(k) for k in ['IM-001','IM-002','IM-003','IM-004','IM-005','IM-006','IM-007','IM-008','IM-009','IM-010','IM-011','IM-012']}
    # map golden field names to IM codes
    fieldmap={'IM-001':'ebitdaMargin','IM-002':'revenueGrowth','IM-003':'debtEbitda','IM-004':'evEbitda','IM-005':'roce',
              'IM-006':'backlog','IM-007':'bookToBill','IM-008':'aftermarketShare','IM-009':'fcfYield','IM-010':'orderGrowth',
              'IM-011':'operatingMargin','IM-012':'projectRiskExposure'}
    m={code:p.get(field) for code,field in fieldmap.items()}
    ovr=[]
    if p.get('governance'): ovr.append('governance')
    if p.get('defenseProgramFail'): ovr.append('defense-program')
    if p.get('epcCostOverrun'): ovr.append('epc-overrun')
    if p.get('orderCancellation'): ovr.append('order-cancellation')
    if p.get('marginCompression'): ovr.append('margin-compression')
    m['_overrides']=ovr
    v,comp=final_verdict(m, p['subsegment'], p['archetype'])
    pillars=pillar_full(m)
    expected.append({
        'providerId':p['id'],'subsegment':p['subsegment'],'archetype':p['archetype'],
        'composite':comp,'verdict':v,
        'pillars':{'quality':round(pillars[0],2),'growth':round(pillars[1],2),'risk':round(pillars[2],2),
                   'profitability':round(pillars[3],2),'capitalEfficiency':round(pillars[4],2),'valuation':round(pillars[5],2)},
        'overrides':ovr
    })
    print(f"{p['id']} {p['name'][:28]:28s} comp={comp:5.1f} verdict={v:12s} ovr={ovr}")
out={'basis':'Frozen industrials expected outputs derived from IES-014 Normative Calculation Appendix D15 v1.2 + industrials-calibration-1.0.0.',
     'standard':'IES-014','version':'1.0.0','program':'v1.1 Track 6','contractVersion':'IES-014 v1.2','expected':expected}
os.makedirs(os.path.join(BASE,'expected-outputs'),exist_ok=True)
json.dump(out,open(os.path.join(BASE,'expected-outputs','industrials-expected-outputs-1.0.0.json'),'w'),indent=2)
print('\nWROTE expected-outputs/industrials-expected-outputs-1.0.0.json')
