import subprocess, re, collections, sys, json
sys.path.insert(0,'/tmp/inv')
from content_sweep import TERMS, trees_for
def git(repo,*a): return subprocess.run(['git','-C',repo]+list(a),capture_output=True,text=True).stdout
def main(name):
    repo=f'/tmp/inv/{name}.git'
    trees=trees_for(name)
    main_tree=[t for t,refs in trees.items() if any(r=='h:main' for r,_ in refs)][0]
    main_blobs=set(); main_paths={}
    for l in git(repo,'ls-tree','-r',main_tree).splitlines():
        meta,path=l.split('\t',1); p=meta.split(); main_blobs.add(p[2]); main_paths[path]=p[2]
    tree_map={}
    for t in trees:
        m={}
        for l in git(repo,'ls-tree','-r',t).splitlines():
            meta,path=l.split('\t',1); p=meta.split()
            if p[1]=='blob': m[path]=p[2]
        tree_map[t]=m
    results={}
    for term,pat in TERMS.items():
        hits=collections.defaultdict(lambda: {'trees':set(),'refs':set(),'merged':set(),'blob':None})
        for t in trees:
            out=subprocess.run(['git','-C',repo,'grep','-I','-l','-i','-E',pat,t],capture_output=True,text=True).stdout.splitlines()
            for f in out:
                path=f.split(':',1)[1] if ':' in f else f
                blob=tree_map[t].get(path)
                key=path
                hits[key]['trees'].add(t); hits[key]['blob']=blob
                for r,mg in trees[t]: hits[key]['refs'].add(r); hits[key]['merged'].add(mg)
        results[term]={p:{'trees':len(v['trees']),'refs':sorted(v['refs']),'merged':sorted(v['merged']),'blob':v['blob'],
                          'on_main_content':(v['blob'] in main_blobs),'on_main_path':(p in main_paths),
                          'main_path_blob_same':(main_paths.get(p)==v['blob'])} for p,v in hits.items()}
        print(f"{name} {term}: {len(hits)} distinct paths")
    json.dump(results,open(f'/tmp/inv/out/{name}_term_hits.json','w'),indent=0)
if __name__=='__main__':
    main(sys.argv[1])
