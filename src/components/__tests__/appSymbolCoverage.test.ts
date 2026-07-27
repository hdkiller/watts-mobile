import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Android has no SF Symbols: an `AppSymbol` whose `sf` is missing from SF_TO_MD
 * silently renders its text `fallback` instead of an icon, which only shows up
 * when someone looks at an Android build. Guard the map instead.
 */

const ROOTS = ['app', 'src'];
const SYMBOL_SOURCE = 'src/components/AppSymbol.tsx';

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '__tests__') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full));
    } else if (full.endsWith('.tsx')) {
      out.push(full);
    }
  }
  return out;
}

function mappedSymbols(): Set<string> {
  const src = readFileSync(SYMBOL_SOURCE, 'utf8');
  const block = src.split('const SF_TO_MD = {')[1]?.split('} as const satisfies')[0] ?? '';
  const names = new Set<string>();
  for (const raw of block.split('\n')) {
    const line = raw.trim();
    const quoted = /^'([^']+)':/.exec(line);
    const bare = /^([A-Za-z_][A-Za-z0-9_]*):/.exec(line);
    if (quoted) names.add(quoted[1]!);
    else if (bare) names.add(bare[1]!);
  }
  return names;
}

/** `<AppSymbol …/>` elements only — NativeTabs icons carry their own `md` prop. */
function appSymbolUsages(): { file: string; sf: string }[] {
  const found: { file: string; sf: string }[] = [];
  for (const root of ROOTS) {
    for (const file of sourceFiles(root)) {
      const src = readFileSync(file, 'utf8');
      for (const element of src.matchAll(/<AppSymbol\b[\s\S]*?\/>/g)) {
        const tag = element[0];
        // An explicit `md=` override means the map is not consulted.
        if (/\bmd=/.test(tag)) continue;
        const sf = /\bsf=(?:"([^"]+)"|\{'([^']+)'\})/.exec(tag);
        if (sf) found.push({ file, sf: (sf[1] ?? sf[2])! });
      }
    }
  }
  return found;
}

describe('AppSymbol Android coverage', () => {
  it('maps every SF Symbol rendered through AppSymbol to a Material Symbol', () => {
    const mapped = mappedSymbols();
    const usages = appSymbolUsages();

    expect(usages.length).toBeGreaterThan(20);

    const unmapped = usages
      .filter((u) => !mapped.has(u.sf))
      .map((u) => `${u.sf} (${u.file})`)
      .sort();

    expect(unmapped).toEqual([]);
  });
});
