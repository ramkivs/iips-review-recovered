"""L-038 targeted public-source delta probe; no data admission, no financial ingestion.
Run in an internet-capable evidence runner with Python 3 and poppler already present.
Only Marico issuer URLs are fetched. Raw PDFs remain temporary; hashes, link discovery,
metadata and bounded relevant page extracts are retained. No installations or credentials.
"""
import concurrent.futures
import hashlib
import html
import json
import pathlib
import re
import subprocess
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

OUT = pathlib.Path('l038-delta-capture')
OUT.mkdir(exist_ok=True)
BASE = 'https://marico.com'
URLS = [
    BASE + '/india/investors/annual-report',
    BASE + '/investorspdf/Draft_MGT-7_-_FY24.pdf',
    BASE + '/investorspdf/Draft_MGT-7_-_FY25.pdf',
    BASE + '/investorspdf/Draft_MGT-7_-_FY26.pdf',
    BASE + '/investorspdf/MGT-7_-_FY26.pdf',
    BASE + '/investorspdf/MGT-7_-_FY25.pdf',
    BASE + '/investorspdf/Subsidiary_Financials_FY26.pdf',
    BASE + '/investorspdf/Marico_Annual_Report_FY26.pdf',
]


def fetch(url):
    stamp = datetime.now(timezone.utc).isoformat()
    row = {'url': url, 'retrievedAtUTC': stamp, 'purpose': 'DISCOVERY_ONLY_NOT_ADMITTED'}
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 L038 evidence-delta research'})
        with urllib.request.urlopen(req, timeout=75) as resp:
            data = resp.read(45_000_001)
            row.update(status=resp.status, finalUrl=resp.url, contentType=resp.headers.get('Content-Type'),
                       lastModified=resp.headers.get('Last-Modified'), bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
        if len(data) > 45_000_000:
            row['error'] = 'size limit, do not interpret as complete source'
            return row
        if not data.startswith(b'%PDF'):
            text = data.decode('utf-8', errors='replace')
            links = sorted(set(urllib.parse.urljoin(url, html.unescape(x)) for x in
                               re.findall(r'(?:href|src)=[\"\x27]([^\"\x27]+)', text, re.I)))
            row['candidateLinks'] = [x for x in links if re.search(r'MGT|annual|subsidi|financial|clarif', x, re.I)]
            row['isPdf'] = False
            row['interpretation'] = 'HTML/non-PDF is not the requested statutory filing; no absence conclusion'
            return row
        row['isPdf'] = True
        with tempfile.TemporaryDirectory() as temp:
            p = pathlib.Path(temp) / 'document.pdf'
            p.write_bytes(data)
            row['pdfinfo'] = subprocess.check_output(['pdfinfo', str(p)], text=True, stderr=subprocess.STDOUT)
            if 'MGT' in url:
                # Only the form (not the shareholder attachment), targeted identity/draft/capital/signature pages.
                text = subprocess.check_output(['pdftotext', '-layout', '-f', '1', '-l', '20', str(p), '-'], text=True)
                pages = text.split('\f')
                selected = [(i + 1, t) for i, t in enumerate(pages) if re.search(
                    r'Corporate Identification|draft MGT|Preference share capital|To be digitally signed|signature|Annual general meeting', t, re.I)]
                row['signatureInspection'] = 'pdfsig output below is diagnostic only; no MCA SRN/challan independently authenticated'
                try:
                    row['pdfsig'] = subprocess.check_output(['pdfsig', str(p)], text=True, stderr=subprocess.STDOUT)
                except subprocess.CalledProcessError as ex:
                    row['pdfsig'] = ex.output
            elif 'Annual_Report' in url:
                # Byte identity check only. Do not re-run the earlier 793-page investigation.
                row['inspection'] = 'metadata and byte digest only; existing FY26 report is a prior-evidence control'
                selected = []
            else:
                # Index the new candidate, retaining capital/declaration evidence only, not a full republication.
                text = subprocess.check_output(['pdftotext', '-layout', str(p), '-'], text=True)
                pages = text.split('\f')
                hits = [(i + 1, t) for i, t in enumerate(pages) if re.search(
                    r'preference|share capital|issued.{0,30}paid|redeem|convertible|cancel', t, re.I)]
                row['capitalHitPages'] = [i for i, _ in hits]
                row['pageCountExtracted'] = len([t for t in pages if t.strip()])
                # Bound publication; a hit page is not group completeness or an audited nil.
                selected = hits[:40]
                row['extractLimitPages'] = 40
                row['truncatedSelection'] = len(hits) > 40
            name = urllib.parse.unquote(urllib.parse.urlparse(url).path.rsplit('/', 1)[-1])
            extracts = []
            for number, text in selected:
                filename = re.sub(r'[^A-Za-z0-9_.-]', '_', name) + f'.page{number}.txt'
                normalised = '\n'.join(line.rstrip() for line in text.splitlines()) + '\n'
                (OUT / filename).write_text(normalised)
                extracts.append({'pdfPage': number, 'path': filename,
                                 'extractSha256': hashlib.sha256(normalised.encode()).hexdigest()})
            row['extracts'] = extracts
    except urllib.error.HTTPError as ex:
        row.update(status=ex.code, error=str(ex), interpretation='retrieval failure, not proof of non-existence')
    except Exception as ex:
        row.update(error=f'{type(ex).__name__}: {ex}', interpretation='incomplete retrieval; no evidence absence inferred')
    return row


if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(fetch, URLS))
    # Discover exact issuer links before considering any additional candidate, not a blind URL sweep.
    linked = sorted(set(x for row in records for x in row.get('candidateLinks', [])
                        if urllib.parse.urlparse(x).hostname in ('marico.com', 'www.marico.com')
                        and re.search(r'MGT|subsidi.*FY2[56]', x, re.I) and x not in URLS))
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        records += list(pool.map(fetch, linked[:12]))
    result = {'purpose': 'L-038 delta since W07 2026-11-12; never admitted financial input',
              'captureCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
              'documents': records}
    (OUT / 'retrieval.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps([{'url': r['url'], 'status': r.get('status'), 'bytes': r.get('bytes'),
                       'isPdf': r.get('isPdf'), 'error': r.get('error')} for r in records], indent=2))
