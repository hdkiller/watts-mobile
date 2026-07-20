#!/usr/bin/env node
/**
 * Guardrail: no raw zinc-* classes or known neutral hex literals outside src/theme/.
 * See openspec/changes/dual-theme-tokens and docs/DESIGN.md.
 */
import { execSync } from 'node:child_process';

const roots = ['app', 'src'];
const pattern =
  String.raw`zinc-\d|text-white\b|bg-surface-dark|text-ink-muted|#09090b|#27272a|#18181b|#3f3f46`;

let output = '';
try {
  output = execSync(
    `rg -n --glob '*.{tsx,ts,jsx,js}' -e '${pattern}' ${roots.join(' ')}`,
    { encoding: 'utf8' }
  );
} catch (err) {
  // rg exit 1 = no matches
  if (err.status === 1) {
    console.log('theme-tokens: ok (no raw neutrals outside src/theme/)');
    process.exit(0);
  }
  throw err;
}

const violations = output
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter((line) => !line.startsWith('src/theme/'));

if (violations.length === 0) {
  console.log('theme-tokens: ok (no raw neutrals outside src/theme/)');
  process.exit(0);
}

console.error('theme-tokens: raw neutral palette values found — use semantic tokens:\n');
for (const line of violations) console.error(`  ${line}`);
process.exit(1);
