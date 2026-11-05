/**
 * IID-0 — CSV ingestion (the operator-facing input path).
 *
 * Deliberately small and strict: a header row names the columns, unknown columns are rejected, and a
 * malformed row is reported as an issue rather than coerced. No network, no spreadsheet library.
 */
export interface CsvTable {
  readonly header: readonly string[];
  readonly rows: readonly string[][];
}

export function parseCsv(text: string): CsvTable {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const headerLine = lines.find((line) => line.trim().length > 0);
  if (headerLine === undefined) throw new Error('CSV is empty');
  const header = splitCsvLine(headerLine).map((cell) => cell.trim());
  const rows: string[][] = [];
  let started = false;
  for (const line of lines) {
    if (!started) {
      if (line === headerLine) started = true;
      continue;
    }
    if (line.trim().length === 0) continue;
    rows.push(splitCsvLine(line));
  }
  return { header, rows };
}

/** Minimal RFC-4180-ish splitter: handles double quotes and doubled quotes; no embedded newlines. */
export function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === ',') {
      cells.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

export function rowAsRecord(header: readonly string[], row: readonly string[]): Record<string, string> {
  const record: Record<string, string> = {};
  header.forEach((name, index) => {
    record[name] = row[index] === undefined ? '' : row[index]!.trim();
  });
  return record;
}
