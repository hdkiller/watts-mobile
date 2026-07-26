#!/usr/bin/env node
/**
 * Guardrail: no raw zinc-* classes or known neutral hex literals outside src/theme/.
 * See openspec/changes/dual-theme-tokens and docs/DESIGN.md.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const roots = ['app', 'src'];
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
const pattern =
  /zinc-\d|text-white\b|bg-surface-dark|text-ink-muted|#09090b|#27272a|#18181b|#3f3f46/;

const violations = [];

for (const root of roots) {
  for (const file of walk(root)) {
    const displayPath = relative('.', file).split(sep).join('/');
    if (displayPath.startsWith('src/theme/')) continue;

    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      if (pattern.test(line)) {
        violations.push(`${displayPath}:${index + 1}:${line}`);
      }
    }
  }
}

if (violations.length === 0) {
  console.log('theme-tokens: ok (no raw neutrals outside src/theme/)');
  process.exit(0);
}

console.error('theme-tokens: raw neutral palette values found — use semantic tokens:\n');
for (const line of violations) console.error(`  ${line}`);
process.exit(1);

function* walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (entry.isFile() && extensions.has(extname(entry.name))) {
      yield path;
    }
  }
}
