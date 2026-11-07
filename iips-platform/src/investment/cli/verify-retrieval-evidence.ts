/**
 * IID — `verify-retrieval-evidence`: check a deep-page retrieval bundle without network, PDF tooling or trust.
 *
 *   tsx src/investment/cli/verify-retrieval-evidence.ts <bundle-dir> [--json]
 *
 * The bundle is a directory with `source/source-bytes.json`, `source/page-map.json`, `source/quotes-verified.json` and
 * one committed text file per extracted page, each carrying its own provenance header. The command cross-checks the
 * four records against each other and against the extracts, and exits:
 *
 *   0  every check passed — the bundle's quotations really were read from the pages it says, of the documents it says,
 *      from the byte streams whose digests it records;
 *   1  at least one check failed, and each failure is printed with the rule it broke;
 *   2  the bundle could not be read at all (missing file, unparseable JSON).
 *
 * It writes nothing and performs no network access. A failed retrieval — refused by the host, no route, truncated,
 * malformed — is a *recorded* outcome here, not an error: what the command refuses is a bundle that turns one of those
 * into read evidence (`L-037`: absence of wording beyond the retrieval cap is not evidence of absence).
 */
import { existsSync } from 'node:fs';

import { readRetrievalBundle } from '../sources/retrievalBundle';
import { verifyRetrievalEvidence } from '../sources/retrievalEvidence';

export function run(argv: readonly string[]): number {
  const args = argv.filter((argument) => !argument.startsWith('--'));
  const asJson = argv.includes('--json');
  const dir = args[0];
  if (dir === undefined) {
    process.stderr.write('usage: verify-retrieval-evidence.ts <bundle-dir> [--json]\n');
    return 2;
  }
  if (!existsSync(dir)) {
    process.stderr.write(`bundle directory not found: ${dir}\n`);
    return 2;
  }

  let loaded;
  try {
    loaded = readRetrievalBundle(dir);
  } catch (cause) {
    process.stderr.write(`cannot read the retrieval records in ${dir}: ${String((cause as Error).message)}\n`);
    return 2;
  }

  const report = verifyRetrievalEvidence(loaded.bundle, { readExtract: loaded.readExtract });

  if (asJson) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return report.ok ? 0 : 1;
  }

  process.stdout.write(`retrieval evidence: ${dir}\n\n`);
  for (const entry of report.summary.coverage) {
    const status = loaded.bundle.documents.find((document) => document.id === entry.documentId)?.status ?? 'UNKNOWN';
    process.stdout.write(
      `  ${entry.documentId.padEnd(12)} ${status.padEnd(18)} pages extracted ${String(entry.extracted).padStart(3)} of ${entry.total}\n`,
    );
  }
  process.stdout.write(
    `\n  documents ${report.summary.documents} (retrieved ${report.summary.retrieved}), ` +
      `page extracts ${report.summary.pages}, quotations ${report.summary.quotations} (read ${report.summary.quotationsRead})\n`,
  );
  if (report.ok) {
    process.stdout.write('\nOK — every quotation was read from an extracted page of a retrieved document, and every\n');
    process.stdout.write('     extract agrees with the record that cites it (document, page index, printed pages, digest).\n');
    return 0;
  }
  process.stdout.write(`\nREFUSED — ${report.violations.length} check(s) failed:\n\n`);
  for (const violation of report.violations) {
    process.stdout.write(`  ${violation.code.padEnd(34)} ${violation.path}\n      ${violation.detail}\n`);
  }
  return 1;
}

if (process.argv[1] !== undefined && process.argv[1].includes('verify-retrieval-evidence')) {
  process.exitCode = run(process.argv.slice(2));
}
