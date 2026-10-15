/**
 * MoSPI Windows verification preparation — PowerShell syntax validator.
 *
 * Parses a `.ps1` file with the real PowerShell grammar
 * (`tree-sitter-powershell`) and reports every ERROR / MISSING node, so the
 * prepared script is syntax-checked rather than eyeballed. It is not a
 * PowerShell interpreter: it proves parseability, not runtime behaviour.
 *
 * Setup (outside the repository, e.g. in a scratch directory):
 *     npm init -y
 *     npm i tree-sitter-powershell@0.26.4 web-tree-sitter
 *     # the package ships a prebuilt wasm grammar: tree-sitter-powershell.wasm
 *
 * Run:
 *     node validate-powershell-syntax.mjs <path-to.ps1>
 *     exit code 0 = no syntax errors found
 */
import fs from 'node:fs';
import { Parser, Language } from 'web-tree-sitter';

const wasmPath = process.env.PS_GRAMMAR_WASM ?? 'node_modules/tree-sitter-powershell/tree-sitter-powershell.wasm';
const file = process.argv[2];

if (!file) {
  console.error('usage: node validate-powershell-syntax.mjs <path-to.ps1>');
  process.exit(2);
}

await Parser.init();
const language = await Language.load(wasmPath);
const parser = new Parser();
parser.setLanguage(language);

const source = fs.readFileSync(file, 'utf8');
const tree = parser.parse(source);

const problems = [];
(function walk(node) {
  if (node.type === 'ERROR' || node.isMissing) {
    problems.push({
      kind: node.isMissing ? 'MISSING' : 'ERROR',
      start: node.startPosition,
      end: node.endPosition,
      text: source.slice(node.startIndex, Math.min(node.endIndex, node.startIndex + 120)),
    });
  }
  for (const child of node.children) walk(child);
})(tree.rootNode);

console.log(`file        : ${file}`);
console.log(`lines       : ${source.split('\n').length}`);
console.log(`root node   : ${tree.rootNode.type}`);
console.log(`syntax errors (ERROR/MISSING nodes): ${problems.length}`);
for (const p of problems.slice(0, 25)) {
  console.log(`  ${p.kind} [${p.start.row + 1}:${p.start.column + 1}-${p.end.row + 1}:${p.end.column + 1}] ${JSON.stringify(p.text.slice(0, 100))}`);
}
process.exit(problems.length === 0 ? 0 : 1);
