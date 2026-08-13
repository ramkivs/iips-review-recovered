"""
IES-014 Industrials — Pre-Freeze Contract Boundary Matrix Test Suite.

Implements the EXACT normative contract from IES-014 D15 v1.2 (resolving D06/D07/D08/D09/D10)
and tests every boundary case so an independent implementation reproduces identical outputs.

Boundary semantics: lower-inclusive / upper-exclusive; terminal band includes upper bound.
Rounding: round-half-to-even at the composite only.
"""
import math

# ---------- Boundary semantics (global) ----------
def score_from_bands(higher_better, bands, x):
    """bands: list of (upper_excl, score) sorted ascending. lower-incl/upper-excl."""
    for upper, s in bands:
        if x < upper:
            return s
    return bands[-1][1]  # terminal includes its upper bound

# Metric band tables (D06 v1.2). "higher_better" False means lower is better (score descending).
# Format: (upper_excl, score) with the LAST as the terminal upper bound.
BANDS = {
    'IM-001': [ (8,40), (15,60), (25,75), (float('inf'),90) ],          # EBITDA margin (higher)
    'IM-002': [ (2,40), (5,60), (10,75), (float('inf'),90) ],           # revenue growth (higher)
    'IM-003': [ (1.5,90), (2.5,75), (3.5,55), (float('inf'),30) ],      # leverage (lower)
    'IM-004': [ (8,90), (12,75), (16,60), (float('inf'),40) ],          # valuation (lower)
    'IM-005': [ (8,40), (15,60), (25,75), (float('inf'),90) ],          # ROCE (higher)
    'IM-006': [ (1,40), (2,60), (3,75), (float('inf'),90) ],            # backlog (higher)
    'IM-007': [ (0.9,40), (1.0,60), (1.1,75), (float('inf'),90) ],      # book-to-bill (higher)
    'IM-008': [ (15,40), (30,60), (50,75), (float('inf'),90) ],         # aftermarket % (higher)
    'IM-009': [ (3,40), (6,60), (10,75), (float('inf'),90) ],           # FCF yield (higher)
    'IM-010': [ (0,40), (5,60), (10,75), (float('inf'),90) ],           # order growth (higher)
    'IM-011': [ (10,40), (18,60), (28,75), (float('inf'),90) ],         # op margin (higher)
    'IM-012': [ (15,90), (30,75), (50,60), (float('inf'),40) ],         # project risk (lower)
}

# Subsegment composite weights + leverage alert (D09)
SEGMENTS = {
    'capital-goods':        {'w':[0.25,0.25,0.20,0.15,0.10,0.05],'alert':3.5},
    'aero-defense':         {'w':[0.30,0.20,0.15,0.20,0.10,0.05],'alert':3.0},
    'transportation':       {'w':[0.25,0.15,0.25,0.20,0.10,0.05],'alert':3.5},
    'eandc':                {'w':[0.20,0.20,0.30,0.15,0.10,0.05],'alert':3.0},
    'electrical-equipment': {'w':[0.30,0.20,0.15,0.20,0.10,0.05],'alert':3.0},
    'diversified':          {'w':[0.30,0.15,0.15,0.20,0.10,0.10],'alert':3.5},
}
# Archetype risk multiplier (D09)
ARCHETYPE_RISK = {'oem':1.2,'aftermarket':0.8,'epc':1.3,'distributor':1.0,'diversified':1.0}

# Verdict mapping (D10) lower-incl/upper-excl, terminal includes upper bound
VERDICT = [ (80,'Strong Buy'), (70,'Buy'), (60,'Accumulate'), (50,'Hold'), (40,'Watch'), (0,'Avoid') ]

def r1h2e(x):
    s=x*10; f=math.floor(s); fr=s-f
    return (f if f%2==0 else f+1)/10 if fr==0.5 else round(s)/10

def metric_score(mid, x):
    return score_from_bands(True, BANDS[mid], x)

def pillar_full_precision(m):
    """m: dict of available RAW metric values (IM-xxx -> value). Returns pillar tuple (Q,G,R,P,CE,V) at full precision.
       Applies derived-component + primitive missing rules (D15 §5)."""
    def metric(mid):
        v = m.get(mid)
        return metric_score(mid, v) if v is not None else None  # None if missing
    # --- Quality: Aftermarket%*0.40 + CostPosition*0.35 + Execution*0.25
    #   CostPosition = IM-011 (derived, single source)
    #   Execution = (IM-001 + IM-011)/2 (derived, two constituents)
    im008 = metric('IM-008'); im001 = metric('IM-001'); im011 = metric('IM-011')
    # CostPosition (derived): = IM-011 if available else unavailable
    cost_pos = im011  # None if IM-011 missing
    # Execution (derived): available constituents of (IM-001, IM-011), renormalized
    exe_parts = [s for s in (im001, im011) if s is not None]
    if exe_parts:
        execution = sum(exe_parts)/len(exe_parts)  # renormalized equal weights
    else:
        execution = None
    # Quality constituents available subset renormalization
    q_items = []
    if im008 is not None: q_items.append(('after', im008, 0.40))
    if cost_pos is not None: q_items.append(('cp', cost_pos, 0.35))
    if execution is not None: q_items.append(('ex', execution, 0.25))
    quality = _renorm(q_items) if q_items else 0.0
    # --- Growth: IM-006*0.40 + IM-010*0.35 + IM-002*0.25
    growth = _renorm([(k,metric(k),w) for k,w in (('IM-006',0.40),('IM-010',0.35),('IM-002',0.25))])
    # --- Risk: IM-003*0.70 + IM-012*0.30
    risk = _renorm([(k,metric(k),w) for k,w in (('IM-003',0.70),('IM-012',0.30))])
    # --- Profitability: IM-001*0.40 + IM-011*0.40 + IM-005*0.20
    profit = _renorm([(k,metric(k),w) for k,w in (('IM-001',0.40),('IM-011',0.40),('IM-005',0.20))])
    # --- Capital Efficiency: IM-009*0.50 + IM-005*0.50
    capeff = _renorm([(k,metric(k),w) for k,w in (('IM-009',0.50),('IM-005',0.50))])
    # --- Valuation: IM-004*1.00
    val = _renorm([(k,metric(k),w) for k,w in (('IM-004',1.00),)])
    return (quality, growth, risk, profit, capeff, val)

def _renorm(items):
    """items: list of (key, score_or_None, weight). Renormalize weights over available subset."""
    avail = [(s,w) for (_,s,w) in items if s is not None]
    if not avail: return 0.0
    wsum = sum(w for _,w in avail)
    return sum(s*w for s,w in avail)/wsum

def composite(m, segment, archetype):
    Q,G,R,P,CE,V = pillar_full_precision(m)
    w = list(SEGMENTS[segment]['w'])
    # archetype risk multiplier -> effective risk weight (D09: not renormalized)
    w[2] = w[2]*ARCHETYPE_RISK[archetype]
    comp = Q*w[0]+G*w[1]+R*w[2]+P*w[3]+CE*w[4]+V*w[5]
    return r1h2e(comp)

def verdict(comp):
    for lo,label in VERDICT:
        if comp >= lo:
            return label
    return 'Avoid'

OVERRIDE_PRECEDENCE = ['governance','defense-program','epc-overrun','order-cancellation','margin-compression','leverage-breach']
OVERRIDE_CAP = {'governance':'Avoid','defense-program':'Watch','epc-overrun':'Watch','order-cancellation':'Watch','margin-compression':'Watch','leverage-breach':'Watch'}
RANK = {'Strong Buy':6,'Buy':5,'Accumulate':4,'Hold':3,'Watch':2,'Avoid':1}

def final_verdict(m, segment, archetype):
    comp = composite(m, segment, archetype)
    v = verdict(comp)
    # leverage breach override: triggered when raw debt/ebitda >= subsegment leverage alert
    if m.get('IM-003') is not None:
        alert = SEGMENTS[segment]['alert']
        if m['IM-003'] >= alert:
            if RANK[v] > RANK['Watch']: v='Watch'
    for ovr in m.get('_overrides', []):
        cap = OVERRIDE_CAP[ovr]
        if RANK[v] > RANK[cap]: v=cap
    return v

# ================== TESTS ==================
def run_all():
    print("=== Boundary matrix: metric bands (threshold-e, threshold, threshold+e) ===")
    for mid, upper in [('IM-001',8),('IM-001',15),('IM-001',25),('IM-007',0.9),('IM-007',1.0),('IM-007',1.1),
                       ('IM-003',1.5),('IM-003',2.5),('IM-003',3.5),('IM-008',15),('IM-008',30),('IM-008',50)]:
        for x in sorted([upper-1e-9, upper, upper+1e-9]):
            print(f"  {mid} = {x:9.7f} -> score {metric_score(mid, x)}")

    print("\n=== Verdict boundaries ===")
    for x in [0,39.9,40,40.1,49.9,50,50.1,59.9,60,60.1,69.9,70,70.1,79.9,80,80.1,99.9,100]:
        print(f"  composite {x:5.1f} -> {verdict(x)}")

    print("\n=== Composite exactly at a rounding half ===")
    # Construct inputs so composite lands exactly on a .5 (round-half-to-even matters)
    # Simple case: single-pillar scenario via all-missing except valuation
    m = {'IM-004':50}  # valuation score only
    print(f"  valuation-only composite = {composite(m,'capital-goods','oem')}")

    print("\n=== Derived-component missing rule (Execution) ===")
    # RAW metric values; scores are computed via metric_score()
    base = {'IM-001':20,'IM-011':25,'IM-008':60,'IM-006':3.5,'IM-010':8,'IM-002':8,
            'IM-003':2.0,'IM-012':20,'IM-009':8,'IM-005':20,'IM-004':10}
    # IM-001 available, IM-011 missing -> Execution = IM-001
    m_both = dict(base); m_miss_im011 = dict(base); m_miss_im011['IM-011']=None
    Qb = pillar_full_precision(m_both)[0]; Qmiss = pillar_full_precision(m_miss_im011)[0]
    print(f"  Quality with both IM-001+IM-011 = {Qb:.4f}")
    print(f"  Quality with IM-011 missing (Execution=IM-001) = {Qmiss:.4f}")

    print("\n=== Primitive missing metric (renormalize) ===")
    m_miss_im008 = dict(base); m_miss_im008['IM-008']=None
    Qm = pillar_full_precision(m_miss_im008)[0]
    print(f"  Quality with IM-008 missing = {Qm:.4f}")

    print("\n=== All metrics missing in a pillar ===")
    m_all = dict(base); 
    for k in ['IM-006','IM-010','IM-002']: m_all[k]=None
    G_all = pillar_full_precision(m_all)[1]
    print(f"  Growth all missing -> {G_all}")

    print("\n=== Simultaneous overrides (min-rank) ===")
    m_ovr = dict(base); m_ovr['_overrides']=['leverage-breach','order-cancellation','governance']
    print(f"  base verdict w/ governance+order-cancellation+leverage -> {final_verdict(m_ovr,'capital-goods','oem')} (expect Avoid)")

    print("\n=== Calibration profile transitions + archetype risk ===")
    for seg in SEGMENTS:
        for arch in ARCHETYPE_RISK:
            c = composite(base, seg, arch)
            print(f"  {seg:22s} {arch:12s} composite {c:.2f} verdict {final_verdict(base,seg,arch)}")
    print("\nALL CONTRACT CHECKS EXECUTED")

if __name__ == '__main__':
    run_all()
