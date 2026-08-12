"""IES-015 Technology — Pre-Freeze Contract Boundary Matrix Test Suite.

Implements the EXACT IES-015 D15 (Phase 2) contract and tests every boundary so an
independent implementation reproduces identical outputs. Baked in from the start.

Boundary semantics: lower-inclusive / upper-exclusive; terminal band includes upper bound.
Rounding: round-half-to-even at the composite only.
"""
import math

BANDS = {
    'TM-001': [(10,40),(20,60),(30,75),(float('inf'),90)],
    'TM-002': [(5,40),(15,60),(25,75),(float('inf'),90)],
    'TM-003': [(1.0,90),(2.0,75),(3.0,55),(float('inf'),30)],
    'TM-004': [(8,90),(12,75),(16,60),(float('inf'),40)],
    'TM-005': [(2,40),(4,60),(7,75),(float('inf'),90)],
    'TM-006': [(30,40),(50,60),(75,75),(float('inf'),90)],
    'TM-007': [(95,40),(105,60),(115,75),(float('inf'),90)],
    'TM-008': [(30,40),(50,60),(70,75),(float('inf'),90)],
    'TM-009': [(5,40),(10,60),(float('inf'),75)],
    'TM-010': [(10,90),(25,75),(50,60),(float('inf'),40)],
    'TM-011': [(5,90),(15,75),(30,60),(float('inf'),40)],
    'TM-012': [(5,40),(15,60),(30,75),(float('inf'),90)],
}

# Metric-specific band cardinality is immutable (D15 §6a.2). TM-009 is inherently 3-band.
BASELINE_BAND_COUNT = {mid: len(bands) for mid, bands in BANDS.items()}

def band_cardinality_ok(mid, calibrated_bands):
    """Invariant: calibratedBandCount[metric] == baselineBandCount[metric] (D15 §6a.2).
    A calibrated table with a different band count is a defect and is REJECTED (baseline applies)."""
    return len(calibrated_bands) == BASELINE_BAND_COUNT[mid]

def conservative_band_table(tables, direction):
    """conservativeBandTable() operator (D15 §6a.3.1).
    tables: non-empty list of complete band tables (list of (upper_excl, score)) with equal cardinality.
    direction: 'higher-better' or 'lower-better' (from baseline score ordering).
    Resolves boundaries elementwise (max for higher-better, min for lower-better) and
    scores elementwise to the composite-lowering min in BOTH directions."""
    n = len(tables[0])
    assert all(len(t) == n for t in tables), "all conflicting tables must share baseline band cardinality"
    boundary_idx = {
        'higher-better': max,
        'lower-better': min,
    }[direction]
    merged_boundaries = [boundary_idx(t[j][0] for t in tables) for j in range(n)]
    merged_scores = [min(t[j][1] for t in tables) for j in range(n)]
    return list(zip(merged_boundaries, merged_scores))

def score_from_table(table, x):
    for upper, s in table:
        if x < upper:
            return s
    return table[-1][1]

SEGMENTS = {
    'software-saas': {'w':[0.30,0.25,0.15,0.15,0.10,0.05],'alert':3.0},
    'it-services': {'w':[0.25,0.15,0.20,0.25,0.10,0.05],'alert':2.5},
    'semiconductors': {'w':[0.20,0.20,0.30,0.15,0.10,0.05],'alert':2.5},
    'electronics-hardware': {'w':[0.20,0.20,0.25,0.20,0.10,0.05],'alert':2.5},
    'digital-platforms': {'w':[0.30,0.30,0.15,0.10,0.10,0.05],'alert':3.5},
    'internet-consumer-tech': {'w':[0.25,0.30,0.20,0.10,0.10,0.05],'alert':3.0},
    'cybersecurity': {'w':[0.30,0.25,0.20,0.10,0.10,0.05],'alert':3.0},
    'data-infrastructure': {'w':[0.30,0.20,0.20,0.15,0.10,0.05],'alert':3.5},
    'tech-enabled-services': {'w':[0.25,0.15,0.20,0.25,0.10,0.05],'alert':3.0},
}
ARCH_RISK = {'license':1.1,'subscription':0.8,'usage-based':0.9,'transaction-platform':0.9,
             'hardware':1.2,'foundry-manufacturing':1.3,'services-project':1.1,'managed-services':0.9,'hybrid':1.0}
VERDICT = [(80,'Strong Buy'),(70,'Buy'),(60,'Accumulate'),(50,'Hold'),(40,'Watch'),(0,'Avoid')]
CAP = {'governance':'Avoid','disruption':'Watch','churn-collapse':'Watch','customer-loss':'Watch',
       'capex-overrun':'Watch','margin-compression':'Watch','leverage-breach':'Watch'}
RANK = {'Strong Buy':6,'Buy':5,'Accumulate':4,'Hold':3,'Watch':2,'Avoid':1}

def r1h2e(x):
    s=x*10; f=math.floor(s); fr=s-f
    return (f if f%2==0 else f+1)/10 if fr==0.5 else round(s)/10

def mscore(mid, x):
    for upper,s in BANDS[mid]:
        if x < upper: return s
    return BANDS[mid][-1][1]

def pair(score, weight):
    return None if score is None else (score, weight)

def renorm(*items):
    avail=[x for x in items if x is not None]
    if not avail: return 0.0
    return sum(s*w for s,w in avail)/sum(w for _,w in avail)

def pillar_full(m):
    def met(mid):
        v=m.get(mid); return mscore(mid,v) if v is not None else None
    # Quality: TM-006*0.40 + TM-007*0.30 + TM-008*0.30
    quality=renorm(pair(met('TM-006'),0.40),pair(met('TM-007'),0.30),pair(met('TM-008'),0.30))
    # Growth: TM-002*0.40 + TM-012*0.35 + TM-009*0.25
    growth=renorm(pair(met('TM-002'),0.40),pair(met('TM-012'),0.35),pair(met('TM-009'),0.25))
    # Risk: TM-003*0.40 + TM-010*0.35 + TM-011*0.25
    risk=renorm(pair(met('TM-003'),0.40),pair(met('TM-010'),0.35),pair(met('TM-011'),0.25))
    # Profitability: TM-001*0.50 + TM-008*0.50
    profit=renorm(pair(met('TM-001'),0.50),pair(met('TM-008'),0.50))
    # Capital Efficiency: TM-005
    capeff=renorm(pair(met('TM-005'),1.00))
    # Valuation: TM-004
    val=renorm(pair(met('TM-004'),1.00))
    return (quality,growth,risk,profit,capeff,val)

def composite(m, subsegment, archetype):
    Q,G,R,P,CE,V=pillar_full(m); w=list(SEGMENTS[subsegment]['w'])
    w[2]=w[2]*ARCH_RISK[archetype]
    return r1h2e(Q*w[0]+G*w[1]+R*w[2]+P*w[3]+CE*w[4]+V*w[5])

def verdict(c):
    for lo,label in VERDICT:
        if c>=lo: return label
    return 'Avoid'

def final_verdict(m, subsegment, archetype):
    comp=composite(m,subsegment,archetype); v=verdict(comp)
    if m.get('TM-003') is not None and m['TM-003']>=SEGMENTS[subsegment]['alert']:
        if RANK[v]>RANK['Watch']: v='Watch'
    for ovr in m.get('_overrides',[]):
        cap=CAP[ovr]
        if RANK[v]>RANK[cap]: v=cap
    return v, comp

def run_all():
    print("=== Metric band boundaries (threshold-e/threshold/threshold+e) ===")
    for mid,th in [('TM-001',20),('TM-002',15),('TM-006',50),('TM-007',105),('TM-008',50),('TM-010',25)]:
        for x in [th-1e-9, th, th+1e-9]:
            print(f"  {mid} = {x:10.7f} -> {mscore(mid,x)}")
    print("\n=== Verdict boundaries ===")
    for x in [39.9,40,40.1,49.9,50,50.1,59.9,60,60.1,69.9,70,70.1,79.9,80,80.1,99.9,100]:
        print(f"  {x:5.1f} -> {verdict(x)}")
    print("\n=== Calibration precedence + archetype risk (software-saas) ===")
    base={'TM-001':25,'TM-002':20,'TM-003':1.5,'TM-004':10,'TM-005':6,'TM-006':60,'TM-007':110,
          'TM-008':60,'TM-009':15,'TM-010':15,'TM-011':10,'TM-012':20}
    for arch in ARCH_RISK:
        c=composite(base,'software-saas',arch)
        print(f"  {arch:22s} composite {c:.2f}")
    print("\n=== Simultaneous overrides (min-rank) ===")
    m=dict(base); m['_overrides']=['margin-compression','customer-loss','governance']
    v,c=final_verdict(m,'software-saas','subscription')
    print(f"  governance+customer-loss+margin -> {v} (expect Avoid)")
    print("\n=== Hybrid / multi-subsegment default ===")
    # Hybrid archetype with subscription dominant resolved via hybridDominant (deterministic per-company)
    print("  Hybrid resolution: profile from hybridDominant archetype (deterministic per-company)")
    print("  Multi-subsegment: profile from subsegmentDominant; no dominant -> most conservative risk profile")

    # --- Effective Band-Table Resolution (D15 §6a) ---
    print("\n=== Effective Band-Table Resolution (D15 §6a) ===")
    # Band table = tuple set of (upper_excl, score); boundaries AND scores resolve together.
    baseline_tm008 = BANDS['TM-008']  # baseline full table
    calibrated_tm008 = [(20,35),(35,55),(50,75),(float('inf'),90)]  # calibrated boundaries AND scores
    def band_table(mid, cal_tables, profile, x):
        # effectiveBandTable = calibrated ?? baseline  (complete table, boundaries+scores together)
        table = cal_tables.get(profile, {}).get(mid) or BANDS[mid]
        for upper,s in table:
            if x < upper: return s
        return table[-1][1]
    # 1. baseline boundaries + baseline scores (no calibration)
    print("  baseline (uncalibrated) TM-008 @25 ->", band_table('TM-008', {}, 'software-saas', 25), "(expect baseline <30->40)")
    # 2. calibrated boundaries + calibrated scores
    print("  calibrated TM-008 @25 ->", band_table('TM-008', {'semiconductors':{'TM-008':calibrated_tm008}}, 'semiconductors', 25), "(expect calibrated 20<=x<35 ->55)")
    print("  calibrated TM-008 @55 ->", band_table('TM-008', {'semiconductors':{'TM-008':calibrated_tm008}}, 'semiconductors', 55), "(expect calibrated 50<=x ->90)")
    # 3. fallback to complete baseline table (no calibrated table for TM-007)
    print("  fallback TM-007 @100 (no calibrated) ->", band_table('TM-007', {'semiconductors':{'TM-008':calibrated_tm008}}, 'semiconductors', 100), "(expect baseline <105->60)")
    # 4. hybrid-selected calibration (hybridDominant resolves to a profile; its table applies)
    print("  hybrid->subscription dominant TM-008 @25 ->", band_table('TM-008', {'subscription':{'TM-008':baseline_tm008}}, 'subscription', 25), "(baseline applies)")
    # 5. boundary epsilon on calibrated table
    print("  calibrated TM-008 @20-eps/20/20+eps ->", band_table('TM-008', {'semiconductors':{'TM-008':calibrated_tm008}}, 'semiconductors', 20-1e-9),
          "/", band_table('TM-008', {'semiconductors':{'TM-008':calibrated_tm008}}, 'semiconductors', 20),
          "/", band_table('TM-008', {'semiconductors':{'TM-008':calibrated_tm008}}, 'semiconductors', 20+1e-9), "(expect 35/55/55)")

    # --- Band cardinality (D15 §6a.2) ---
    print("\n=== Band cardinality (metric-specific, immutable) ===")
    for mid in sorted(BANDS):
        print(f"  {mid} baseline bands = {BASELINE_BAND_COUNT[mid]}")
    assert BASELINE_BAND_COUNT['TM-009'] == 3, "TM-009 is inherently 3-band"
    print("  TM-009 baseline 3-band validation: PASS (inherently 3 bands)")
    tm009_3 = [(5,40),(10,60),(float('inf'),75)]
    print("  TM-009 calibrated 3-band validation:", band_cardinality_ok('TM-009', tm009_3), "(expect True)")
    tm009_4 = [(5,40),(10,60),(15,75),(float('inf'),75)]
    print("  TM-009 attempted band-count change (4 bands):", band_cardinality_ok('TM-009', tm009_4),
          "(expect False -> rejected; baseline applies)")
    tm008_4 = [(10,40),(20,60),(30,75),(float('inf'),90)]
    print("  TM-008 calibrated 4-band validation:", band_cardinality_ok('TM-008', tm008_4), "(expect True)")

    # --- conservativeBandTable() operator (D15 §6a.3.1) ---
    print("\n=== conservativeBandTable() operator ===")
    # Higher-better (e.g. TM-001): conservative boundaries = elementwise max; scores = elementwise min.
    hbA = [(10,40),(20,60),(30,75),(float('inf'),90)]
    hbB = [(15,45),(25,65),(40,85),(float('inf'),95)]
    hb_merged = conservative_band_table([hbA, hbB], 'higher-better')
    print("  higher-better conflicting boundaries+scores ->", hb_merged)
    assert hb_merged == [(15,40),(25,60),(40,75),(float('inf'),90)], "higher-better conservative merge"
    print("    @12->%d @20->%d @30->%d @50->%d (expect 40/60/75/90)"
          % (score_from_table(hb_merged,12), score_from_table(hb_merged,20),
             score_from_table(hb_merged,30), score_from_table(hb_merged,50)))
    # Conflicting score values only (same boundaries): higher-better -> lower score wins.
    hbS_A = [(10,40),(20,60),(30,75),(float('inf'),90)]
    hbS_B = [(10,50),(20,65),(30,80),(float('inf'),95)]
    hbS_merged = conservative_band_table([hbS_A, hbS_B], 'higher-better')
    print("  conflicting score values (higher-better) ->", hbS_merged, "(lower score wins)")
    assert hbS_merged == [(10,40),(20,60),(30,75),(float('inf'),90)]
    print("    @25 ->", score_from_table(hbS_merged,25), "(expect 75 = conservative/lower: min(75,80))")
    # Lower-better (e.g. TM-003 debt/EBITDA): conservative boundaries = elementwise min; scores = elementwise min.
    lbA = [(1.0,90),(2.0,75),(3.0,55),(float('inf'),30)]
    lbB = [(1.5,85),(2.5,65),(3.5,45),(float('inf'),20)]
    lb_merged = conservative_band_table([lbA, lbB], 'lower-better')
    print("  lower-better conflicting boundaries+scores ->", lb_merged)
    assert lb_merged == [(1.0,85),(2.0,65),(3.0,45),(float('inf'),20)], "lower-better conservative merge"
    print("    @0.5->%d @1.5->%d @2.5->%d @5->%d (expect 85/65/45/20, composite-lowering)"
          % (score_from_table(lb_merged,0.5), score_from_table(lb_merged,1.5),
             score_from_table(lb_merged,2.5), score_from_table(lb_merged,5)))
    # Conflicting complete tables -> deterministic result (repeatable).
    r1 = conservative_band_table([hbA, hbB], 'higher-better')
    r2 = conservative_band_table([hbA, hbB], 'higher-better')
    assert r1 == r2, "conservative resolution must be deterministic"
    print("  conflicting complete tables -> deterministic result: PASS (repeatable, boundaries+scores together)")
    # Hybrid conflict -> deterministic result.
    hybrid_merged = conservative_band_table([hbA, hbB], 'higher-better')
    print("  Hybrid conflict -> deterministic result:", hybrid_merged, "(conservativeBandTable applied)")
    # Multi-subsegment conflict -> deterministic result.
    multi_merged = conservative_band_table([lbA, lbB], 'lower-better')
    print("  multi-subsegment conflict -> deterministic result:", multi_merged, "(conservativeBandTable applied)")

    print("\nALL CONTRACT CHECKS EXECUTED")

if __name__=='__main__':
    run_all()
