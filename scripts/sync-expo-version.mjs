#!/usr/bin/env node
/**
 * Keep app.json `expo.version` aligned with package.json after release-it bumps.
 * package.json remains the source of truth for release-it.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const pkgPath = join(ROOT, 'package.json');
const appPath = join(ROOT, 'app.json');

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const app = JSON.parse(readFileSync(appPath, 'utf8'));

const version = String(pkg.version || '').trim();
if (!version) {
  console.error('package.json is missing a version');
  process.exit(1);
}

if (!app.expo || typeof app.expo !== 'object') {
  console.error('app.json is missing expo config');
  process.exit(1);
}

const previous = app.expo.version;
app.expo.version = version;
writeFileSync(appPath, `${JSON.stringify(app, null, 2)}\n`);

if (previous === version) {
  console.log(`expo.version already ${version}`);
} else {
  console.log(`Synced app.json expo.version: ${previous ?? '(unset)'} → ${version}`);
}
