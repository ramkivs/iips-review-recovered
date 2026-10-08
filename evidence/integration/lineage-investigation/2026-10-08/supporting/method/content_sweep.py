import subprocess, re, collections, sys, json
TERMS = collections.OrderedDict([
 ('COMMAND_CENTER', r'command[ _-]?cent(er|re)|commandcent(er|re)|command palette|commandpalette'),
 ('RESEARCH_HUB', r'research[ _-]?hub|researchhub'),
 ('SECTOR_RESEARCH', r'sector[ _-]?research|sectorresearch|sector[ _-]?intelligence|sectorintelligence|sector page'),
 ('OPPORTUNITIES', r'opportunit(y|ies)|opportunityengine|intelligenceopportunities'),
 ('RISKS', r'risk[ _-]?engine|riskengine|intelligencerisks|risk register|risks page|risk panel'),
 ('RANKINGS', r'ranking[ _-]?engine|rankingengine|intelligencerankings|rankings page|ranking view'),
 ('REPORTS_UI', r'features/reports|reportsupdate|reports page|reports ui|reports\.tsx|reports tab|reportspage|reports-service|reports-transport|governed reports|governed-reports'),
 ('WIDGET', r'widget'),
 ('EOD', r'\beod\b|end[ _-]of[ _-]day|eod[-_]pipeline|eod-pipeline|eod_'),
 ('D107', r'\bd107\b|\bd-107\b'),
 ('COMPANY_WORKSPACE', r'company[ _-]?workspace|companyworkspace'),
 ('DECISION_CENTER', r'decision[ _-]?center|decisioncenter'),
 ('REPLAY_STUDIO', r'replay[ _-]?studio|replaystudio'),
 ('EVIDENCE_SNAPSHOT', r'evidence[ _-]?snapshot|evidencesnapshot|snapshotstore|snapshot store'),
 ('EVIDENCE_REPLAY', r'evidence[ _-]?replay|evidencereplay'),
 ('CROSS_DOMAIN_E2E', r'cross[ _-]?domain|crossdomain'),
 ('PORTFOLIO_INTEL', r'portfolio[ _-]?intelligence|portfoliointelligence'),
 ('BI-07', r'\bbi-07\b|\bbi07\b|\bbi_07\b'),
 ('AG-5', r'\bag-5\b|\bag5\b'),
 ('IDENTITY_MAP', r'identity[ _-]?mapping|identity-mapping|company[ _-]?mapping|mapping registry|g24|companyid|company_id|securityid|security_id|\bisin\b'),
 ('TENANT_PRINCIPAL', r'tenant[ _-]?(membership|directory|registry|id|isolation|mapping)|principal[ _-]?tenant|principal-tenant|principal'),
 ('CONSUMER_SEGMENTS', r'consumerengine|consumer[ _-]?segment|staples|discretionary'),
 ('DATA_PIT', r'\bpit\b|point[ _-]in[ _-]time'),
])
rx = {k: re.compile(v, re.I) for k,v in TERMS.items()}
def trees_for(name):
    rows=[l.split('\t') for l in open(f'/tmp/inv/out/{name}_refs.tsv').read().splitlines()[1:]]
    trees=collections.OrderedDict()
    for r in rows:
        ref=r[0].replace('refs/heads/','h:').replace('refs/pull/','pr:').replace('refs/tags/','t:')
        trees.setdefault(r[2],[]).append((ref,r[6]))
    return trees
def run(name):
    repo=f'/tmp/inv/{name}.git'
    trees=trees_for(name)
    combined='|'.join(f'({v})' for v in TERMS.values())
    result=collections.defaultdict(lambda: collections.defaultdict(set))  # term -> (path) -> set(trees)
    for t in trees:
        p=subprocess.run(['git','-C',repo,'grep','-I','-i','-o','-h','-E',combined,t],capture_output=True,text=True)
        # -h with tree: output "tree:path:match"? we use -n-less; parse by grep with --null not available; use -o with path via separate pass
        lines=p.stdout.splitlines()
        # fallback to per-term path listing
        for k,v in rx.items():
            pass
    return trees
if __name__=='__main__':
    name=sys.argv[1]; mode=sys.argv[2] if len(sys.argv)>2 else 'files'
    repo=f'/tmp/inv/{name}.git'
    trees=trees_for(name)
    out={}
    # Per tree, per term: list of matching paths (files only, text-scan).
    for t in trees:
        files=subprocess.run(['git','-C',repo,'grep','-I','-l','-i','-E','|'.join(f'({v})' for v in TERMS.values()),t],capture_output=True,text=True).stdout.splitlines()
        # tree-prefixed output: "<tree>:<path>"
        paths=[f.split(':',1)[1] if ':' in f else f for f in files]
        out[t]=paths
    json.dump({'trees':{t:[r for r in refs] for t,refs in trees.items()},'files':out}, open(f'/tmp/inv/out/{name}_content_hits.json','w'))
    print(name,'trees scanned',len(trees),'total files with any term hit (sum over trees):',sum(len(v) for v in out.values()))
