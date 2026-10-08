import subprocess,sys,re,collections
sys.path.insert(0,'/tmp/inv')
from content_sweep import trees_for
def git(repo,*a): return subprocess.run(['git','-C',repo]+list(a),capture_output=True,text=True).stdout
name=sys.argv[1]; rx=re.compile(sys.argv[2],re.I)
repo=f'/tmp/inv/{name}.git'
trees=trees_for(name)
seen=collections.OrderedDict()
for t,refs in trees.items():
    paths=[p for p in git(repo,'ls-tree','-r','--name-only',t).splitlines() if rx.search(p)]
    if paths:
        seen[t]=(paths,refs)
for t,(paths,refs) in seen.items():
    rs=', '.join(f"{r}{'(M)' if m=='YES' else '(U)'}" for r,m in refs[:5])+(' ...' if len(refs)>5 else '')
    print(f"TREE {t[:10]} refs[{len(refs)}]: {rs}")
    for p in paths[:12]: print(f"    {p}")
    if len(paths)>12: print(f"    ... +{len(paths)-12} more")
