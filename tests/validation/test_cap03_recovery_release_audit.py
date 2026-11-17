"""Offline regression tests for docs/integration/cap03-s2/verify_recovery_release.py.

Standard library only. Two loopback HTTP servers stand in for the GitHub REST API and for the
storage host that an asset download is redirected to. No request leaves the machine, and the
real release, its assets and any real token are never used.
"""
import ast
import contextlib
import hashlib
import importlib.util
import io
import json
import os
import re
import threading
import unittest
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / 'docs/integration/cap03-s2/verify_recovery_release.py'
WORKFLOW = ROOT / '.github/workflows/cap03-revision7-irr-static.yml'
THIS_TEST = 'tests/validation/test_cap03_recovery_release_audit.py'

spec = importlib.util.spec_from_file_location('verify_recovery_release', SCRIPT)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)

# Made-up values. None is a credential.
TOKEN = 'test-token-0d1f-not-a-real-credential'
SIGNATURE = 'test-signature-5b7c'
JWT = 'test-jwt-9e2a'
NAMES = (
    'CAP03-S2-Original-1140-Artifacts.zip',
    'original-s2-sha256-inventory.txt',
    'recovery-evidence.json',
    'recovery-run-20261031-212225-35931ce8.txt',
)
JSON_TYPE = {'Content-Type': 'application/json; charset=utf-8'}


class _Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):  # Keep the test output quiet.
        pass

    def do_GET(self):
        self.server.owner.answer(self)


class _HttpServer(ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address):  # A client that stops reading early is not an error here.
        pass


class LoopbackServer:
    """A loopback HTTP server that records the path and headers of every request."""

    def __init__(self, respond):
        self.respond = respond
        self.requests = []
        self.httpd = _HttpServer(('127.0.0.1', 0), _Handler)
        self.httpd.owner = self
        self.thread = threading.Thread(target=self.httpd.serve_forever, kwargs={'poll_interval': 0.02}, daemon=True)
        self.thread.start()

    @property
    def root(self):
        return 'http://127.0.0.1:%d' % self.httpd.server_address[1]

    def answer(self, handler):
        headers = {name.lower(): value for name, value in handler.headers.items()}
        self.requests.append((handler.path, headers))
        status, extra, body = self.respond(handler.path, headers)
        handler.send_response(status)
        for name, value in extra.items():
            handler.send_header(name, value)
        handler.send_header('Content-Length', str(len(body)))
        handler.end_headers()
        handler.wfile.write(body)

    def close(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.thread.join(timeout=5)


class FakeGitHub:
    """The REST API and the storage host, with the behaviour of GitHub that the audit relies on."""

    def __init__(self):
        self.contents = {name: ('synthetic content of %s\n' % name).encode() * (index + 3)
                         for index, name in enumerate(NAMES)}
        self.assets = {name: {'id': 9000 + index, 'size': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
                       for index, (name, data) in enumerate(self.contents.items())}
        self.listed = list(NAMES)        # names the release lists
        self.metadata_changes = {}       # name -> fields the release reports differently
        self.api_status = {}             # asset id -> status the API answers with
        self.forbidden = False           # the token lacks the permission
        self.stream_directly = False     # the API streams the asset instead of redirecting
        self.storage_bodies = {}         # asset id -> bytes the storage host serves instead
        self.storage_status = {}         # asset id -> status the storage host answers with
        self.api = LoopbackServer(self.api_respond)
        self.storage = LoopbackServer(self.storage_respond)

    def close(self):
        self.api.close()
        self.storage.close()

    def by_id(self, asset_id):
        return next((name for name, asset in self.assets.items() if asset['id'] == asset_id), None)

    def release(self):
        assets = []
        for name in self.listed:
            asset = self.assets[name]
            entry = {'name': name, 'id': asset['id'], 'size': asset['size'], 'digest': 'sha256:' + asset['sha256'],
                     'url': '%s/repos/%s/releases/assets/%d' % (self.api.root, audit.REPO, asset['id']),
                     'browser_download_url': 'https://github.invalid/browser/%s' % name}
            entry.update(self.metadata_changes.get(name, {}))
            assets.append(entry)
        return {'tag_name': audit.TAG, 'draft': False, 'assets': assets}

    def api_respond(self, path, headers):
        authorization = headers.get('authorization')
        if authorization is None:  # GitHub does not reveal a private repository to an anonymous caller.
            return 404, JSON_TYPE, b'{"message":"Not Found"}'
        if authorization != 'Bearer ' + TOKEN:
            return 401, JSON_TYPE, b'{"message":"Bad credentials"}'
        if self.forbidden:
            extra = dict(JSON_TYPE, **{'X-Accepted-GitHub-Permissions': 'contents=read'})
            return 403, extra, b'{"message":"Resource not accessible by integration"}'
        if path == '/repos/%s/releases/tags/%s' % (audit.REPO, audit.TAG):
            return 200, JSON_TYPE, json.dumps(self.release()).encode()
        match = re.fullmatch('/repos/%s/releases/assets/([0-9]+)' % re.escape(audit.REPO), path)
        name = self.by_id(int(match.group(1))) if match else None
        if name is None:
            return 404, JSON_TYPE, b'{"message":"Not Found"}'
        asset_id = self.assets[name]['id']
        if asset_id in self.api_status:
            return self.api_status[asset_id], JSON_TYPE, b'{"message":"Not Found"}'
        if headers.get('accept') != 'application/octet-stream':  # GitHub then answers with the asset's description.
            return 200, JSON_TYPE, json.dumps({'name': name, 'id': asset_id}).encode()
        if self.stream_directly:
            return 200, {'Content-Type': 'application/octet-stream'}, self.contents[name]
        location = '%s/github-production-release-asset/1/%d?sp=r&sig=%s&jwt=%s' % (
            self.storage.root, asset_id, SIGNATURE, JWT)
        return 302, {'Location': location}, b''

    def storage_respond(self, path, headers):
        if 'authorization' in headers:  # A signed address refuses a second credential.
            return 400, {}, b'<Error>Only one auth mechanism allowed</Error>'
        match = re.fullmatch('/github-production-release-asset/1/([0-9]+)[?]sp=r&sig=%s&jwt=%s' % (SIGNATURE, JWT), path)
        name = self.by_id(int(match.group(1))) if match else None
        if name is None:
            return 403, {}, ('<Error>signature %s is not valid</Error>' % SIGNATURE).encode()
        asset_id = self.assets[name]['id']
        if asset_id in self.storage_status:
            return self.storage_status[asset_id], {}, ('<Error>%s %s</Error>' % (SIGNATURE, JWT)).encode()
        body = self.storage_bodies.get(asset_id, self.contents[name])
        return 200, {'Content-Type': 'application/octet-stream'}, body


class DownloadPathTest(unittest.TestCase):
    """Base class: the audit talks to the two loopback servers and to nothing else."""

    def setUp(self):
        self.github = FakeGitHub()
        self.addCleanup(self.github.close)
        for patcher in (mock.patch.object(audit, 'API_ROOT', self.github.api.root),
                        mock.patch.object(audit, 'ASSETS', self.github.assets),
                        mock.patch.dict(os.environ, {'no_proxy': '127.0.0.1', 'NO_PROXY': '127.0.0.1'})):
            patcher.start()
            self.addCleanup(patcher.stop)

    def download(self, token=TOKEN):
        output = io.StringIO()
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            assets = audit.download_release_assets(token)
        return assets, output.getvalue()

    def refused(self, token=TOKEN):
        """Run the download, require that it fails closed, and return everything it said."""
        output = io.StringIO()
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            with self.assertRaises(RuntimeError) as caught:
                audit.download_release_assets(token)
        said = str(caught.exception) + '\n' + output.getvalue()
        self.assert_no_secret(said, token)
        return said

    def assert_no_secret(self, text, *more):
        for secret in (TOKEN, SIGNATURE, JWT) + more:
            if secret:
                self.assertNotIn(secret, text)

    def asset_id(self, name):
        return self.github.assets[name]['id']

    def asset_paths(self):
        return [path for path, _ in self.github.api.requests if '/releases/assets/' in path]


class AuthenticatedDownload(DownloadPathTest):
    def test_the_four_assets_are_downloaded_with_the_token_and_the_token_stops_at_the_api(self):
        assets, said = self.download()
        self.assertEqual(assets, self.github.contents)
        self.assertEqual(list(assets), list(NAMES))

        api = self.github.api.requests
        self.assertEqual(api[0][0], '/repos/ramkivs/iips-review-recovered/releases/tags/cap03-s2-recovery-20261031-212225')
        self.assertEqual(api[0][1].get('accept'), 'application/vnd.github+json')
        self.assertEqual(self.asset_paths(), ['/repos/ramkivs/iips-review-recovered/releases/assets/%d' % self.asset_id(name)
                                              for name in NAMES])
        self.assertEqual(len(api), 5)
        for path, headers in api:
            self.assertEqual(headers.get('authorization'), 'Bearer ' + TOKEN, path)
            self.assertEqual(headers.get('x-github-api-version'), '2022-11-28', path)
        for path, headers in api[1:]:
            self.assertEqual(headers.get('accept'), 'application/octet-stream', path)

        storage = self.github.storage.requests
        self.assertEqual(len(storage), 4)
        for path, headers in storage:
            self.assertNotIn('authorization', headers)
            self.assertNotIn('x-github-api-version', headers)
            self.assertNotIn(TOKEN, json.dumps(headers) + path)
            self.assertEqual(headers.get('user-agent'), 'CAP03-S2-release-audit/1.0')

        self.assertEqual(said.count('PASS asset downloaded and SHA-256 matched: '), 4)
        for name, data in self.github.contents.items():
            self.assertIn('%s bytes=%d sha256=%s' % (name, len(data), hashlib.sha256(data).hexdigest()), said)
        self.assert_no_secret(said)

    def test_an_asset_that_the_api_streams_itself_is_accepted(self):
        self.github.stream_directly = True
        assets, said = self.download()
        self.assertEqual(assets, self.github.contents)
        self.assertEqual(self.github.storage.requests, [])
        self.assert_no_secret(said)


class MissingAssets(DownloadPathTest):
    def test_a_release_that_lacks_an_asset_is_refused_before_any_download(self):
        self.github.listed.remove('recovery-evidence.json')
        said = self.refused()
        self.assertIn('release asset set mismatch', said)
        self.assertEqual(self.asset_paths(), [])
        self.assertEqual(self.github.storage.requests, [])

    def test_a_release_with_an_extra_or_renamed_asset_is_refused(self):
        self.github.metadata_changes['recovery-evidence.json'] = {'name': 'recovery-evidence-v2.json'}
        self.assertIn('release asset set mismatch', self.refused())
        self.assertEqual(self.asset_paths(), [])

    def test_an_asset_that_the_api_does_not_return_is_refused(self):
        missing = self.asset_id('original-s2-sha256-inventory.txt')
        self.github.api_status[missing] = 404
        said = self.refused()
        self.assertIn('download failed for %s/repos/ramkivs/iips-review-recovered/releases/assets/%d' % (self.github.api.root, missing), said)
        self.assertIn('HTTP Error 404: Not Found', said)
        self.assertIn("GitHub says 'Not Found'", said)
        self.assertIn('a token was supplied', said)
        # It stops at the first asset it cannot get: the two assets after it are not requested.
        self.assertEqual(len(self.asset_paths()), 2)


class AuthenticationFailure(DownloadPathTest):
    def test_a_rejected_token_fails_closed_and_is_not_disclosed(self):
        wrong = 'wrong-token-33aa-not-a-real-credential'
        said = self.refused(token=wrong)
        self.assertIn('download failed for %s/repos/ramkivs/iips-review-recovered/releases/tags/' % self.github.api.root, said)
        self.assertIn('HTTP Error 401: Unauthorized', said)
        self.assertIn("GitHub says 'Bad credentials'", said)
        self.assertIn('a token was supplied', said)
        self.assertEqual(len(self.github.api.requests), 1)
        self.assertEqual(self.github.storage.requests, [])

    def test_without_a_token_no_credential_is_sent_and_the_private_release_is_refused(self):
        said = self.refused(token='')
        self.assertNotIn('authorization', self.github.api.requests[0][1])
        self.assertIn('HTTP Error 404: Not Found', said)
        self.assertIn('no token was supplied (GITHUB_TOKEN is not set)', said)
        self.assertEqual(len(self.github.api.requests), 1)

    def test_a_token_without_the_permission_reports_the_permission_github_names(self):
        self.github.forbidden = True
        said = self.refused()
        self.assertIn('HTTP Error 403: Forbidden', said)
        self.assertIn("GitHub says 'Resource not accessible by integration'", said)
        self.assertIn('permission the API accepts for this request: contents=read', said)

    def test_a_refusal_by_the_storage_host_names_the_host_and_not_the_signed_address(self):
        self.github.storage_status[self.asset_id(NAMES[0])] = 403
        said = self.refused()
        self.assertIn('HTTP Error 403: Forbidden from 127.0.0.1:%d after the redirect' % self.github.storage.httpd.server_address[1], said)
        self.assertNotIn('github-production-release-asset', said)
        self.assertNotIn('sig=', said)

    def test_a_malformed_token_never_reaches_an_error_message(self):
        broken = 'broken-token-77c1\nX-Injected: yes'
        said = self.refused(token=broken)
        self.assertIn('download failed for %s/repos/ramkivs/iips-review-recovered/releases/tags/' % self.github.api.root, said)
        self.assertIn('ValueError', said)
        self.assertNotIn('broken-token-77c1', said)
        self.assertEqual(self.github.api.requests, [])

    def test_the_token_is_refused_for_an_address_outside_the_api(self):
        elsewhere = self.github.storage.root + '/anything'
        with self.assertRaises(RuntimeError) as caught:
            audit.request_bytes(elsewhere, token=TOKEN, limit=10)
        self.assertIn('refusing to send the GitHub token', str(caught.exception))
        self.assert_no_secret(str(caught.exception))
        self.assertEqual(self.github.storage.requests, [])


class HashMismatch(DownloadPathTest):
    def test_downloaded_bytes_with_another_digest_are_refused(self):
        name = 'recovery-evidence.json'
        genuine = self.github.contents[name]
        self.github.storage_bodies[self.asset_id(name)] = genuine[:-1] + (b'X' if genuine[-1:] != b'X' else b'Y')
        said = self.refused()
        self.assertIn('downloaded asset digest/size mismatch for recovery-evidence.json: %d bytes, ' % len(genuine), said)
        self.assertNotIn('PASS asset downloaded and SHA-256 matched: recovery-evidence.json', said)
        self.assertEqual(said.count('PASS asset downloaded and SHA-256 matched: '), 2)

    def test_a_shorter_body_and_a_longer_body_are_refused(self):
        name = NAMES[0]
        genuine = self.github.contents[name]
        self.github.storage_bodies[self.asset_id(name)] = genuine[:-5]
        self.assertIn('downloaded asset digest/size mismatch for %s: %d bytes, ' % (name, len(genuine) - 5), self.refused())
        self.github.storage_bodies[self.asset_id(name)] = genuine + b'extra bytes'
        self.assertIn('download exceeded size limit', self.refused())

    def test_a_digest_identity_or_size_that_github_reports_differently_is_refused_before_that_asset_is_requested(self):
        name = 'recovery-evidence.json'
        for change, expected in (({'digest': 'sha256:' + '0' * 64}, 'release API digest mismatch for ' + name),
                                 ({'digest': None}, 'release API digest mismatch for ' + name),
                                 ({'id': 1}, 'release metadata identity/size mismatch for ' + name),
                                 ({'size': 1}, 'release metadata identity/size mismatch for ' + name)):
            with self.subTest(change=change):
                self.github.api.requests.clear()
                self.github.metadata_changes = {name: change}
                self.assertIn(expected, self.refused())
                self.assertNotIn('/releases/assets/%d' % self.asset_id(name), ' '.join(self.asset_paths()))


class ArchiveContentTriage(unittest.TestCase):
    def make_archive(self, entries):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', compression=zipfile.ZIP_STORED) as archive:
            for name, body in entries.items():
                archive.writestr(name, body)
        return buffer.getvalue()

    def test_archive_summary_flags_document_like_members_and_exact_agi_markers(self):
        entries = {
            'dist/app.js': b'ordinary application bundle',
            'dist/INE415A01038-Q2-Results.pdf': b'%PDF-1.7 AGI Greenpac Limited INE415A01038',
        }
        source_map = {name.removeprefix('dist/'): hashlib.sha256(body).hexdigest()
                      for name, body in entries.items()}
        with mock.patch.object(audit, 'EXPECTED_COUNT', len(entries)):
            summary = audit.verify_archive(self.make_archive(entries), source_map)
        self.assertEqual(summary['file_count'], 2)
        self.assertEqual(summary['document_like_paths'], ['INE415A01038-Q2-Results.pdf'])
        self.assertEqual(summary['issuer_marker_hits']['INE415A01038'], ['INE415A01038-Q2-Results.pdf'])
        self.assertEqual(summary['issuer_marker_hits']['AGI Greenpac'], ['INE415A01038-Q2-Results.pdf'])

    def test_archive_summary_does_not_flag_unrelated_bundle_as_issuer_material(self):
        entries = {'dist/app.js': b'ordinary application bundle'}
        source_map = {'app.js': hashlib.sha256(entries['dist/app.js']).hexdigest()}
        with mock.patch.object(audit, 'EXPECTED_COUNT', 1):
            summary = audit.verify_archive(self.make_archive(entries), source_map)
        self.assertEqual(summary['document_like_paths'], [])
        self.assertEqual(summary['issuer_marker_hits'], {'INE415A01038': [], 'AGI Greenpac': []})


class MainUsesTheEnvironmentToken(unittest.TestCase):
    def run_main(self, environment):
        output = io.StringIO()
        nothing = {name: b'' for name in NAMES}
        with mock.patch.dict(os.environ, environment), \
                mock.patch.object(audit, 'download_release_assets', return_value=nothing) as download, \
                mock.patch.object(audit, 'verify_original_inventory_seal'), \
                mock.patch.object(audit, 'parse_inventory', return_value={}), \
                mock.patch.object(audit, 'verify_evidence_json'), \
                mock.patch.object(audit, 'verify_transcript'), \
                mock.patch.object(audit, 'verify_archive'), \
                mock.patch.object(audit, 'open', mock.mock_open(read_data=b''), create=True), \
                contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            self.assertEqual(audit.main(), 0)
        return download, output.getvalue()

    def test_the_token_comes_from_GITHUB_TOKEN_and_is_not_printed(self):
        download, said = self.run_main({'GITHUB_TOKEN': TOKEN})
        download.assert_called_once_with(TOKEN)
        self.assertIn('::notice title=CAP-03 release audit::PASS: 4 release assets downloaded through the GitHub REST API '
                      'with the supplied token;', said)
        self.assertNotIn(TOKEN, said)

    def test_without_GITHUB_TOKEN_the_summary_says_so(self):
        with mock.patch.dict(os.environ):
            os.environ.pop('GITHUB_TOKEN', None)
            download, said = self.run_main({})
        download.assert_called_once_with('')
        self.assertIn('through the GitHub REST API without a token;', said)


class PinnedReleaseAndTokenHandling(unittest.TestCase):
    """What the correction must leave as it was, and what it must never do with the token."""

    def test_the_release_and_its_four_assets_are_pinned_as_before(self):
        self.assertEqual(audit.API_ROOT, 'https://api.github.com')
        self.assertEqual(audit.REPO, 'ramkivs/iips-review-recovered')
        self.assertEqual(audit.TAG, 'cap03-s2-recovery-20261031-212225')
        self.assertEqual(audit.ASSETS, {
            'CAP03-S2-Original-1140-Artifacts.zip': {
                'id': 695808804, 'size': 10328940,
                'sha256': '57656309d721a0c6f6a072f14f6a9067a2cc788737efa92f34aa0997fb5d2d48'},
            'original-s2-sha256-inventory.txt': {
                'id': 695808801, 'size': 176456,
                'sha256': 'e077a349d3777403d426a0b0f338c53ac6f0e3942f75a9174a6a9b6e42854cbb'},
            'recovery-evidence.json': {
                'id': 695808803, 'size': 800,
                'sha256': '412ed94f4c1d501f9fe7106631b8d2b51665f5732edffb29757693b9473c1522'},
            'recovery-run-20261031-212225-35931ce8.txt': {
                'id': 695808800, 'size': 1630,
                'sha256': '1073c035045932a2706dfc51f10833e63b5cf62af943b80cb1fffaa20a648da6'},
        })
        self.assertEqual(tuple(audit.ASSETS), NAMES)

    def test_the_source_never_prints_writes_or_forwards_the_token(self):
        tree = ast.parse(SCRIPT.read_text(encoding='utf-8'))
        calls = [node for node in ast.walk(tree) if isinstance(node, ast.Call)]

        def called(call):
            return call.func.id if isinstance(call.func, ast.Name) else getattr(call.func, 'attr', '')

        def uses_token(node):
            return any(isinstance(child, ast.Name) and child.id == 'token' for child in ast.walk(node))

        # No output call, file write or failure message receives the token.
        for call in calls:
            if called(call) in ('print', 'fail', 'write', 'writelines'):
                self.assertFalse(uses_token(call), 'line %d' % call.lineno)
        # The token is formatted into exactly one string, "Bearer <token>" ...
        formatted = [node for node in ast.walk(tree) if isinstance(node, ast.JoinedStr) and uses_token(node)]
        self.assertEqual(len(formatted), 1)
        bearer = formatted[0]
        self.assertEqual([type(part).__name__ for part in bearer.values], ['Constant', 'FormattedValue'])
        self.assertEqual(bearer.values[0].value, 'Bearer ')
        # ... and that string is the value of the one Authorization header, which is an unredirected header.
        carriers = [call for call in calls if any(argument is bearer for argument in call.args)]
        self.assertEqual(len(carriers), 1)
        self.assertEqual(called(carriers[0]), 'add_unredirected_header')
        self.assertEqual(carriers[0].args[0].value, 'Authorization')
        # The header name appears nowhere else, so no request that follows a redirect can carry it.
        constants = [node.value for node in ast.walk(tree) if isinstance(node, ast.Constant) and isinstance(node.value, str)]
        self.assertEqual(constants.count('Authorization'), 1)
        self.assertNotIn('browser_download_url', constants)


class WorkflowWiring(unittest.TestCase):
    """The static check gives the audit the workflow's own token, with read access to contents and no more."""

    def setUp(self):
        self.text = WORKFLOW.read_text(encoding='utf-8')

    def test_the_only_permission_is_read_access_to_contents(self):
        self.assertEqual(re.findall(r'(?m)^ *permissions:.*$', self.text), ['permissions:'])
        self.assertIn('\npermissions:\n  contents: read\n\njobs:\n', self.text)
        self.assertNotIn(': write', self.text)

    def test_the_audit_step_receives_the_workflow_token_and_no_stored_secret(self):
        step = ('      - name: Download and independently verify the CAP-03 recovery release assets\n'
                '        env:\n'
                '          GITHUB_TOKEN: ${{ github.token }}\n'
                '        run: python docs/integration/cap03-s2/verify_recovery_release.py\n')
        self.assertEqual(self.text.count(step), 1)
        self.assertEqual(self.text.count('GITHUB_TOKEN'), 1)
        self.assertNotIn('secrets.', self.text)

    def test_these_tests_run_before_the_audit_and_both_files_trigger_the_workflow(self):
        offline = 'run: python -m unittest discover -s tests/validation -p test_cap03_recovery_release_audit.py -v\n'
        self.assertEqual(self.text.count(offline), 1)
        self.assertLess(self.text.index(offline), self.text.index('run: python docs/integration/cap03-s2/verify_recovery_release.py'))
        for path in (THIS_TEST, 'docs/integration/cap03-s2/verify_recovery_release.py'):
            self.assertEqual(self.text.count("      - '%s'\n" % path), 2, path)


if __name__ == '__main__':
    unittest.main()
