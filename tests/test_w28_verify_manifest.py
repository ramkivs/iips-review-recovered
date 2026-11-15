"""Synthetic-only tests; no owner holdings or vendor calls."""
import copy
import hashlib
import json
import unittest
from scripts.w28_verify_manifest import PIPELINE_COMMIT, verify


def fixture():
    sid = 'ISIN:INE000A00000:EQ'
    mapping = dict(isin='INE000A00000', companyId='C1', exchange='NSE',
                   exchangeSegment='NSE_EQ', securityId=sid, active=True)
    row = dict(disposition='QUALIFIED', isin=mapping['isin'], companyId='C1',
               exchange='NSE', series='EQ', securityIdentity=dict(isin=mapping['isin'], securityId=sid), mapping=mapping)
    return dict(pipelineCommit=PIPELINE_COMMIT, totals=dict(registrySize=1, qualified=1, detailedRows=1),
                countsByDisposition=dict(QUALIFIED=1), records=[row],
                registryEntries=[f'C1|NSE_EQ|{sid}'], coverageByExchangeSeries={'NSE:EQ': 1})


def check(doc):
    data = json.dumps(doc).encode()
    return verify(data, hashlib.sha256(data).hexdigest(), 1)


class ManifestTests(unittest.TestCase):
    def test_valid(self):
        self.assertEqual(check(fixture())['qualified'], 1)

    def test_digest_refused(self):
        with self.assertRaises(ValueError): verify(b'{}')

    def test_wrong_company_or_series_refused(self):
        for field, value in [('companyId', 'C2'), ('series', 'B')]:
            doc = fixture(); doc['records'][0][field] = value
            with self.assertRaises(ValueError): check(doc)

    def test_registry_or_counts_refused(self):
        for mutate in (lambda d: d['registryEntries'].clear(),
                       lambda d: d['countsByDisposition'].update(QUALIFIED=2),
                       lambda d: d['coverageByExchangeSeries'].clear()):
            doc = fixture(); mutate(doc)
            with self.assertRaises(ValueError): check(doc)

    def test_wrong_pipeline_refused(self):
        doc = fixture(); doc['pipelineCommit'] = 'different'
        with self.assertRaises(ValueError): check(doc)


if __name__ == '__main__': unittest.main()
