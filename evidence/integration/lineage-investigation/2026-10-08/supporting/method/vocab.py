import subprocess,sys,collections,json,re
sys.path.insert(0,'/tmp/inv')
from content_sweep import trees_for
PHRASES=['Command Center','Command Centre','CommandCenter','Command Palette','CommandPalette','Decision Center','DecisionCenter','Company Workspace','CompanyWorkspace','Replay Studio','ReplayStudio','Evidence Snapshot','Evidence Snapshots','Evidence Replay','Research Hub','ResearchHub','Sector Research','Sector Intelligence','SectorIntelligence','Opportunities','Opportunity Engine','OpportunityEngine','Risk Engine','RiskEngine','Rankings','RankingEngine','Reports','ReportsPage','Widget','widget','D107','D-107','EOD','End of Day','End-of-Day','AG-5','AG5','Cross-Domain','Cross Domain','Portfolio Intelligence','PortfolioIntelligence','BI-07','ConsumerEngine','staples','discretionary','G24','mapping registry','MappingRegistry','company mapping','identity mapping','IdentityMapping','tenant mapping','TenantDirectory','ISIN','companyId','securityId','UI01','UI02','UI03','UI04','UI05','UI06','UI07','UI08','UI09','UI10','UI11','UI12','UI13','UI14','NotYetAuthorized','FeaturePlaceholder','routes.ts','Notes','Notification']
def run(name):
    repo=f'/tmp/inv/{name}.git'
    trees=trees_for(name)
    table=collections.OrderedDict()
    for ph in PHRASES:
        total_files=set(); trees_hit=0; sample=set()
        for t in trees:
            out=subprocess.run(['git','-C',repo,'grep','-I','-l','-i','-F',ph,t,'--','.',':!*.png',':!*.jpg',':!*.gz'],capture_output=True,text=True).stdout.splitlines()
            if out:
                trees_hit+=1
                for f in out:
                    p=f.split(':',1)[1] if ':' in f else f
                    total_files.add(p)
        table[ph]={'trees':trees_hit,'files':len(total_files),'sample':sorted(total_files)[:4]}
    json.dump(table,open(f'/tmp/inv/out/{name}_vocab.json','w'),indent=0)
    print(f"== {name} vocabulary (phrase: trees-with-hit / distinct-files; sample) ==")
    for ph,v in table.items():
        if v['trees']==0: print(f"  {ph!r}: 0")
        else: print(f"  {ph!r}: trees={v['trees']} files={v['files']} e.g. {', '.join(s[:60] for s in v['sample'][:3])}")
run(sys.argv[1])
