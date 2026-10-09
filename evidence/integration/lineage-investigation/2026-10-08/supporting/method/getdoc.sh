#!/bin/bash
# usage: getdoc.sh <repo: irr|ipd> <ref> <path>  -> prints file content from that ref (read-only)
R=/tmp/inv/$1.git; git -C $R show "$2:$3" 2>/dev/null || echo "MISSING $2:$3"
