"""Generate IES-015 Technology expected outputs from the D15 v1.3 contract + golden dataset.

Implements the EXACT IES-015 D15 v1.3 (Phase 2, approved) normative calculation contract:
  * lower-inclusive / upper-exclusive boundaries (terminal band includes upper bound)
  * metric-specific immutable band cardinality (TM-009 is 3-band) with band-count rejection
  * effective band-table resolution: effectiveBandTable[metric] = calibrated ?? baseline (boundaries+scores together)
  * conservativeBandTable() operator for conflicting complete tables (D15 §6a.3.1)
  * hybrid / multi-subsegment resolution (hybridDominant, subsegmentDominant, most-conservative-risk)
  * round-half-to-even at the composite only (no intermediate pillar rounding)
  * missing primitive -> 0 + renormalized weights; derived/parent pillar renormalizes
  * min_rank(baseVerdict, all applicable override caps)
This generator is the reference oracle; implementations must reproduce its outputs exactly.
"""
import json, math, os

# ----------------------------------------------------------------------------
# Calibration (loaded from the frozen reference asset)
# ----------------------------------------------------------------------------
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAL = json.load(open(os.path.join(BASE, 'calibration', 'technology-calibration-1.0.0.json')))
BAND_SRC = CAL['bandScores']
SEGMENTS = CAL['segments']
ARCH_RISK = CAL['archetypeRisk']
CALIBRATED = CAL.get('calibratedBandTables', {})

VERDICT = [(80, 'Strong Buy'), (70, 'Buy'), (60, 'Accumulate'), (50, 'Hold'),
           (40, 'Watch'), (0, 'Avoid')]
CAP = {'governance': 'Avoid', 'disruption': 'Watch', 'churn-collapse': 'Watch',
       'customer-loss': 'Watch', 'capex-overrun': 'Watch',
       'margin-compression': 'Watch', 'leverage-breach': 'Watch'}
RANK = {'Strong Buy': 6, 'Buy': 5, 'Accumulate': 4, 'Hold': 3, 'Watch': 2, 'Avoid': 1}


# ----------------------------------------------------------------------------
# Band table helpers (lower-inclusive / upper-exclusive)
# ----------------------------------------------------------------------------
def src_to_table(metric, src):
    """Convert calibration operator list to sorted [(upper_excl, score)]."""
    out = []
    for op in src:
        if op[0] == 'lt':
            out.append((op[1], op[2]))            # x < u -> score
        elif op[0] == 'range':
            out.append((op[2], op[3]))            # lo <= x < u -> score
        elif op[0] == 'gte':
            out.append((float('inf'), op[2]))     # x >= lo -> score
    return out


def baseline_table(metric):
    return src_to_table(metric, BAND_SRC[metric])


def baseline_band_count(metric):
    return len(baseline_table(metric))


def card_ok(metric, table):
    """Invariant: calibratedBandCount == baselineBandCount (D15 §6a.2)."""
    return len(table) == baseline_band_count(metric)


def score_from(table, x):
    for upper, s in table:
        if x < upper:
            return s
    return table[-1][1]


def direction(metric):
    """higher-better if baseline scores increase with value, else lower-better."""
    t = baseline_table(metric)
    return 'higher-better' if t[-1][1] > t[0][1] else 'lower-better'


def conservative_band_table(tables, metric):
    """conservativeBandTable() (D15 §6a.3.1): boundaries elementwise (max hi / min lo),
    scores elementwise min in BOTH directions (composite-lowering)."""
    n = len(tables[0])
    for t in tables:
        assert len(t) == n, 'conflicting tables must share baseline band cardinality'
    d = direction(metric)
    bfn = max if d == 'higher-better' else min
    merged = [bfn(t[j][0] for t in tables) for j in range(n)]
    scores = [min(t[j][1] for t in tables) for j in range(n)]
    return list(zip(merged, scores))


# ----------------------------------------------------------------------------
# Resolution
# ----------------------------------------------------------------------------
def resolve_subsegment(p):
    subs = p.get('subsegments') or [p['subsegment']]
    if len(subs) == 1:
        return subs[0], subs
    if p.get('subsegmentDominant') in subs:
        return p['subsegmentDominant'], subs
    # most conservative risk profile = highest leverageAlert, tie-break lexicographic
    chosen = min(subs, key=lambda s: (-SEGMENTS[s]['leverageAlert'], s))
    return chosen, subs


def resolve_archetype(p):
    arch = p['archetype']
    if arch == 'hybrid':
        return p.get('hybridDominant', 'hybrid')
    return arch


def effective_table(metric, subsegment):
    """effectiveBandTable = calibrated ?? baseline (complete table, boundaries+scores together)."""
    cal = CALIBRATED.get(subsegment, {}).get(metric)
    if cal is not None:
        tbl = src_to_table(metric, cal)
        if card_ok(metric, tbl):          # band-count mismatch is a defect -> rejected -> baseline
            return tbl
    return baseline_table(metric)


# ----------------------------------------------------------------------------
# Scoring pipeline
# ----------------------------------------------------------------------------
def r1h2e(x):
    s = x * 10
    f = math.floor(s)
    fr = s - f
    if fr == 0.5:
        return (f if f % 2 == 0 else f + 1) / 10.0
    return round(s) / 10.0


def metric_score(m, metric, subsegment):
    v = m.get(metric)
    if v is None:
        return None
    return score_from(effective_table(metric, subsegment), v)


def renorm(items):
    """items: list of (label, score, weight); missing (None) scores dropped, weights renormalized."""
    avail = [(s, w) for (_, s, w) in items if s is not None]
    if not avail:
        return 0.0
    return sum(s * w for s, w in avail) / sum(w for _, w in avail)


def pillars(m, subsegment):
    """Quality, Growth, Risk, Profitability, Capital Efficiency, Valuation (full precision)."""
    def met(mid):
        return metric_score(m, mid, subsegment)
    quality = renorm([('TM-006', met('TM-006'), 0.40),
                      ('TM-007', met('TM-007'), 0.30),
                      ('TM-008', met('TM-008'), 0.30)])
    growth = renorm([('TM-002', met('TM-002'), 0.40),
                     ('TM-012', met('TM-012'), 0.35),
                     ('TM-009', met('TM-009'), 0.25)])
    risk = renorm([('TM-003', met('TM-003'), 0.40),
                   ('TM-010', met('TM-010'), 0.35),
                   ('TM-011', met('TM-011'), 0.25)])
    profit = renorm([('TM-001', met('TM-001'), 0.50),
                     ('TM-008', met('TM-008'), 0.50)])
    capeff = renorm([('TM-005', met('TM-005'), 1.00)])
    val = renorm([('TM-004', met('TM-004'), 1.00)])
    return quality, growth, risk, profit, capeff, val


def composite(m, subsegment, archetype):
    Q, G, R, P, CE, V = pillars(m, subsegment)
    w = list(SEGMENTS[subsegment]['w'])
    w[2] = w[2] * ARCH_RISK[archetype]
    return r1h2e(Q * w[0] + G * w[1] + R * w[2] + P * w[3] + CE * w[4] + V * w[5])


def verdict(c):
    for lo, label in VERDICT:
        if c >= lo:
            return label
    return 'Avoid'


def final_verdict(m, subsegment, archetype):
    comp = composite(m, subsegment, archetype)
    v = verdict(comp)
    overrides = []
    if m.get('TM-003') is not None and m['TM-003'] >= SEGMENTS[subsegment]['leverageAlert']:
        overrides.append('leverage-breach')
    for ovr in m.get('_overrides', []):
        overrides.append(ovr)
    for ovr in overrides:
        cap = CAP[ovr]
        if RANK[v] > RANK[cap]:
            v = cap
    return v, comp, overrides


# ----------------------------------------------------------------------------
# Generate expected outputs
# ----------------------------------------------------------------------------
METRIC_FIELDS = {
    'TM-001': 'ebitdaMargin', 'TM-002': 'revenueGrowth', 'TM-003': 'debtEbitda',
    'TM-004': 'evRevenue', 'TM-005': 'fcfYield', 'TM-006': 'recurringRevenuePct',
    'TM-007': 'nrr', 'TM-008': 'grossMargin', 'TM-009': 'rdIntensity',
    'TM-010': 'customerConcentration', 'TM-011': 'capexIntensity', 'TM-012': 'usageGrowth',
}
OVERRIDE_FIELDS = {
    'governance': 'governance', 'disruption': 'disruption', 'churn-collapse': 'churnCollapse',
    'customer-loss': 'customerLoss', 'capex-overrun': 'capexOverrun',
    'margin-compression': 'marginCompression',
}


def provider_metrics(p):
    m = {code: p.get(field) for code, field in METRIC_FIELDS.items()}
    ovr = []
    for key, field in OVERRIDE_FIELDS.items():
        if p.get(field):
            ovr.append(key)
    m['_overrides'] = ovr
    return m


def build():
    gd = json.load(open(os.path.join(BASE, 'datasets', 'technology-golden-reference-1.0.0.json')))
    expected = []
    for p in gd['providers']:
        m = provider_metrics(p)
        sub, subs = resolve_subsegment(p)
        arch = resolve_archetype(p)
        v, comp, ovr = final_verdict(m, sub, arch)
        Q, G, R, P, CE, V = pillars(m, sub)
        expected.append({
            'providerId': p['id'],
            'subsegment': sub,
            'archetype': arch,
            'declaredSubsegments': subs,
            'composite': comp,
            'verdict': v,
            'pillars': {
                'quality': round(Q, 2), 'growth': round(G, 2), 'risk': round(R, 2),
                'profitability': round(P, 2), 'capitalEfficiency': round(CE, 2),
                'valuation': round(V, 2),
            },
            'overrides': ovr,
            'calibrationVersion': CAL['version'],
        })
        print(f"{p['id']:7s} {p['name'][:34]:34s} {sub:22s}/{arch:20s} comp={comp:5.1f} {v:11s} ovr={ovr}")
    out = {
        'basis': 'Frozen Technology expected outputs derived from IES-015 Normative Calculation '
                 'Appendix D15 v1.3 + technology-calibration-1.0.0.',
        'standard': 'IES-015', 'version': '1.0.0', 'program': 'v1.1 Track 6',
        'contractVersion': 'IES-015 v1.3',
        'expected': expected,
    }
    os.makedirs(os.path.join(BASE, 'expected-outputs'), exist_ok=True)
    json.dump(out, open(os.path.join(BASE, 'expected-outputs', 'technology-expected-outputs-1.0.0.json'), 'w'), indent=2)
    print('\nWROTE expected-outputs/technology-expected-outputs-1.0.0.json')


if __name__ == '__main__':
    build()
