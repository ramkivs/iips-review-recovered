#!/usr/bin/env python3
"""Verify the immutable W-27 artifact, without reading any portfolio data."""
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

MANIFEST_COMMIT = '371bf3bd4bb3eba49bbf6ae614d3edaaa04793ed'
PIPELINE_COMMIT = '325266d684f857a377d55b147e7306e02c7a495a'
MANIFEST_SHA256 = '69a918f78791114e8fb036ddfd2a2005facdddf785a7496bc28f541fd4964769'


def verify(data: bytes, digest: str = MANIFEST_SHA256, count: int = 4680) -> dict:
    if hashlib.sha256(data).hexdigest() != digest:
        raise ValueError('manifest digest mismatch')
    doc = json.loads(data)
    if doc['pipelineCommit'] != PIPELINE_COMMIT:
        raise ValueError('pipeline commit mismatch')
    totals, dispositions = doc['totals'], doc['countsByDisposition']
    rows = [r for r in doc['records'] if r['disposition'] == 'QUALIFIED']
    if (len(rows) != count or len(doc['registryEntries']) != count or
        totals['registrySize'] != count or totals['qualified'] != count or
        dispositions['QUALIFIED'] != count or sum(dispositions.values()) != totals['detailedRows']):
        raise ValueError('manifest counts do not reconcile')
    keys = set()
    coverage = Counter()
    for r in rows:
        m, identity = r['mapping'], r['securityIdentity']
        if (r['isin'] != identity['isin'] or r['isin'] != m['isin'] or
            r['companyId'] != m['companyId'] or r['exchange'] != m['exchange'] or
            identity['securityId'] != m['securityId'] or
            identity['securityId'] != f"ISIN:{r['isin']}:{r['series']}" or
            m['active'] is not True):
            raise ValueError('inconsistent qualified identity')
        key = '|'.join((r['companyId'], m['exchangeSegment'], identity['securityId']))
        if key in keys:
            raise ValueError('duplicate qualified identity')
        keys.add(key)
        coverage[f"{r['exchange']}:{r['series']}"] += 1
    if keys != set(doc['registryEntries']) or dict(coverage) != doc['coverageByExchangeSeries']:
        raise ValueError('registry or exchange-series coverage mismatch')
    return {'sha256': digest, 'manifestCommit': MANIFEST_COMMIT, 'pipelineCommit': PIPELINE_COMMIT,
            'qualified': count, 'dispositions': dispositions, 'coverageByExchangeSeries': dict(coverage),
            'recordsRetained': len(doc['records'])}


def main() -> int:
    if len(sys.argv) != 2:
        print('usage: python3 scripts/w28_verify_manifest.py <manifest-file>', file=sys.stderr)
        return 2
    try:
        summary = verify(Path(sys.argv[1]).read_bytes())
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError):
        print('manifest verification failed', file=sys.stderr)
        return 1
    print(json.dumps(summary, sort_keys=True, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
