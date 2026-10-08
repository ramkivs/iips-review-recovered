#!/bin/bash
R=$1; MAIN=$2; OUT=$3
printf "ref\tcommit\ttree\tdate\tbranch_only_vs_main\tmain_only_vs_main\tmerged_into_main\tsubject\n" > $OUT
git -C $R for-each-ref --format='%(refname)|%(objectname)|%(*objectname)|%(committerdate:short)|%(subject)' refs/heads refs/pull refs/tags | while IFS='|' read -r ref obj peeled date subj; do
  c=${peeled:-$obj}
  t=$(git -C $R rev-parse "$c^{tree}" 2>/dev/null)
  if [[ "$ref" == refs/heads/* || "$ref" == refs/pull/* ]]; then
    lr=$(git -C $R rev-list --left-right --count "$MAIN...$c" 2>/dev/null)
    mo=$(echo $lr | awk '{print $1}'); bo=$(echo $lr | awk '{print $2}')
    if git -C $R merge-base --is-ancestor "$c" "$MAIN" 2>/dev/null; then m=YES; else m=NO; fi
  else bo="-"; mo="-"; m="-"; fi
  printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" "$ref" "$c" "$t" "$date" "$bo" "$mo" "$m" "$subj" >> $OUT
done
echo "rows: $(($(wc -l < $OUT)-1))  unique trees: $(tail -n +2 $OUT | cut -f3 | sort -u | wc -l)"
