"""Resolve a cherry-pick conflict in the two shared registers for a stacked work item.

The conflict is always the same one: every work item appends its own section to the end of both documents, so its patch
carries the *previous* item's tail as context. Resolution keeps the base (main) version of the document, re-applies the
item's non-append hunks, then appends the item's own section at the new end of file.
"""
import subprocess, sys, re, pathlib

def sh(*a, **kw):
    return subprocess.run(a, capture_output=True, text=True, **kw)

def hunks_of(commit, path):
    diff = sh('git','diff','--no-color','-U3', f'{commit}^', commit, '--', path).stdout
    if not diff.strip():
        return [], None, 0
    lines = diff.split('\n')
    start = next(i for i,l in enumerate(lines) if l.startswith('@@'))
    header, body = lines[:start], lines[start:]
    hunks, cur = [], None
    for l in body:
        if l.startswith('@@'):
            if cur: hunks.append(cur)
            cur = [l]
        elif cur is not None:
            cur.append(l)
    if cur: hunks.append(cur)
    return header, hunks, len(open_data(commit)[0])

def open_data(commit):
    return [], None

def split_append(hunks, parent_lines):
    append = None; rest = []
    for h in hunks:
        m = re.match(r'@@ -(\d+)(?:,(\d+))? \+', h[0])
        old_start, old_count = int(m.group(1)), int(m.group(2) or 1)
        reaches_eof = (old_start + old_count - 1) >= parent_lines
        if old_count == 0 or reaches_eof:
            append = h
        else:
            rest.append(h)
    return rest, append

def apply(commit, path):
    header, hunks, _ = hunks_of(commit, path)
    parent_lines = len(sh('git','show', f'{commit}^:{path}').stdout.split('\n')) - 1
    rest, append = split_append(hunks, parent_lines)
    if rest:
        patch = '\n'.join(header + [l for h in rest for l in h])
        p = pathlib.Path('/tmp/splitkit/partial.patch'); p.write_text(patch + '\n')
        r = sh('git','apply','--whitespace=nowarn','-C1',str(p))
        if r.returncode != 0:
            print('  partial apply failed:', r.stderr.strip()[:200]); sys.exit(1)
    if append:
        added = ''.join(l[1:]+'\n' for l in append if l.startswith('+') and not l.startswith('+++'))
        with open(path, 'a', encoding='utf-8') as f:
            f.write(added)
        print(f'  appended {added.count(chr(10))} lines to {path}')

for path in sys.argv[1:2] and sys.argv[2:]:
    pass

docs = sys.argv[2:]
commit = sys.argv[1]
# The conflicted files carry markers; the resolution starts from the base version (HEAD = the branch being built on).
for path in docs:
    if sh('git','diff','--name-only', f'{commit}^', commit, '--', path).stdout.strip():
        base = sh('git','show', f'HEAD:{path}').stdout
        pathlib.Path(path).write_text(base, encoding='utf-8')
for path in docs:
    if sh('git','diff','--name-only', f'{commit}^', commit, '--', path).stdout.strip():
        apply(commit, path)
