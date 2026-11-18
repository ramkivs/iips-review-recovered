"""L-038 targeted public-source delta probe; no data admission, no financial ingestion.
Run in an internet-capable evidence runner with Python 3 and pypdf 6.1.3 in an isolated tool directory.
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
from pypdf import PdfReader
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
        result = subprocess.run(['curl', '-L', '--max-time', '55', '--retry', '1', '-sS',
                                 '-A', 'Mozilla/5.0', '-w', '\n%{http_code}\n%{url_effective}', url], capture_output=True)
        parts = result.stdout.rsplit(b'\n', 2)
        if result.returncode or len(parts) != 3:
            row.update(error=result.stderr.decode(errors='replace'), interpretation='retrieval failed, not non-existence')
            return row
        data, status, final = parts
        row.update(status=int(status), finalUrl=final.decode(), bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
        if int(status) != 200:
            row['interpretation'] = 'HTTP non-success, not source content or non-existence proof'
            return row
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
            reader = PdfReader(str(p))
            row['pdfMetadata'] = {str(k): str(v) for k, v in (reader.metadata or {}).items()}
            row['pdfPages'] = len(reader.pages)
            if 'MGT' in url:
                selected = [(i + 1, reader.pages[i].extract_text(extraction_mode='layout') or '')
                            for i in range(min(20, len(reader.pages)))]
                selected = [(i, t) for i, t in selected if re.search(
                    r'Corporate Identification|draft MGT|Preference share capital|To be digitally signed|signature|Annual general meeting', t, re.I)]
                fields = reader.get_fields() or {}
                row['signatureFields'] = {str(k): str(v) for k, v in fields.items() if str(v.get('/FT')) == '/Sig'}
                row['signatureInspection'] = 'PDF signature fields inspected, NOT cryptographic/MCA receipt authentication'
            elif 'Annual_Report' in url:
                row['inspection'] = 'metadata and byte digest only; existing FY26 report is a prior-evidence control'
                selected = []
            else:
                hits = []
                for i, page in enumerate(reader.pages):
                    text = page.extract_text(extraction_mode='layout') or ''
                    if re.search(r'preference|share capital|issued.{0,30}paid|redeem|convertible|cancel', text, re.I):
                        hits.append((i + 1, text))
                row['capitalHitPages'] = [i for i, _ in hits]
                row['pageCountExtracted'] = len(reader.pages)
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
    retry_urls = [r['url'].replace('https://marico.com/', 'https://www.marico.com/') for r in records if r.get('status') != 200]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        records += list(pool.map(fetch, retry_urls))
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
