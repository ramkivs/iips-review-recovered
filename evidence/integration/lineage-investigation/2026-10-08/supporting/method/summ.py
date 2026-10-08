import json,re,collections,sys
CODE=re.compile(r'\.(ts|tsx|js|jsx|mjs|json|py|ps1|sql)$')
def short(r): return r.replace('h:arena/','').replace('-iips-review-recovered','').replace('-iips-production-market-data','')
def summarize(name, terms, maxn=14):
    R=json.load(open(f'/tmp/inv/out/{name}_term_hits.json'))
    for term in terms:
        hits=R.get(term,{})
        on_main=[p for p,v in hits.items() if v['on_main_content']]
        lin=[p for p,v in hits.items() if not v['on_main_content']]
        lin_code=[p for p in lin if CODE.search(p)]
        print(f"\n### {name.upper()} {term}: total={len(hits)} on-main-content={len(on_main)} lineage-only={len(lin)} lineage-code={len(lin_code)}")
        if on_main: print("  on-main sample: "+'; '.join(sorted(on_main)[:6]))
        for p in sorted(lin_code, key=lambda x:(-hits[x]['trees'],x))[:maxn]:
            v=hits[p]
            refs=','.join(short(r) for r in v['refs'][:4])
            mg='M' if 'YES' in v['merged'] else 'U'
            more='...' if len(v['refs'])>4 else ''
            print(f"  [{mg}] {p[:100]}  trees={v['trees']} refs={refs}{more}")
if __name__=='__main__':
    name=sys.argv[1]; terms=sys.argv[2].split(','); maxn=int(sys.argv[3]) if len(sys.argv)>3 else 14
    summarize(name,terms,maxn)
