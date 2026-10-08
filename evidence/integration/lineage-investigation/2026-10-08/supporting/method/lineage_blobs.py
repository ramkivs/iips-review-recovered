import subprocess, re, collections, sys
def git(repo,*a):
    return subprocess.run(['git','-C',repo]+list(a),capture_output=True,text=True).stdout
def load(name):
    repo=f'/tmp/inv/{name}.git'
    rows=[l.split('\t') for l in open(f'/tmp/inv/out/{name}_refs.tsv').read().splitlines()[1:]]
    trees=collections.OrderedDict()
    for r in rows:
        ref=r[0].replace('refs/heads/','h:').replace('refs/pull/','pr:').replace('refs/tags/','t:')
        trees.setdefault(r[2],[]).append((ref, r[6]))
    main_tree=[r[2] for r in rows if r[0]=='refs/heads/main'][0]
    main_blobs={}
    for l in git(repo,'ls-tree','-r',main_tree).splitlines():
        meta,path=l.split('\t',1); parts=meta.split()
        main_blobs[parts[2]]=path
    # per tree: path->blob
    lineage=collections.defaultdict(lambda: {'refs':set(),'trees':set(),'merged':set(),'paths':set()})
    for t,refs in trees.items():
        for l in git(repo,'ls-tree','-r',t).splitlines():
            meta,path=l.split('\t',1); parts=meta.split()
            if parts[1]!='blob': continue
            blob=parts[2]
            if blob in main_blobs: continue   # content present on main (possibly under other path)
            key=blob
            lineage[key]['paths'].add(path); lineage[key]['trees'].add(t)
            for r,mg in refs: lineage[key]['refs'].add(r); lineage[key]['merged'].add(mg)
    return lineage
if __name__=='__main__':
    name=sys.argv[1]
    L=load(name)
    out=f'/tmp/inv/out/{name}_lineage_only_blobs.tsv'
    with open(out,'w') as f:
        f.write('blob\tpaths\trefs\tmerged_flags\n')
        for b,v in L.items():
            f.write(f"{b}\t{' | '.join(sorted(v['paths']))[:500]}\t{' '.join(sorted(v['refs']))[:500]}\t{','.join(sorted(v['merged']))}\n")
    print(name,'lineage-only blobs (content not on main):',len(L))
