import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('FirstRunActivationCompanion source structure', () => {
  const filePath = join(process.cwd(), 'src/components/onboarding/FirstRunActivationCompanion.tsx');
  const indexFile = join(process.cwd(), 'src/components/onboarding/index.ts');

  it('file exists and exports FirstRunActivationCompanion component', () => {
    const content = readFileSync(filePath, 'utf8');
    expect(content).toContain('export function FirstRunActivationCompanion');
    expect(content).toContain('hideIfHasData');
    expect(content).toContain('testID');
  });

  it('renders activation companion buttons and icons', () => {
    const content = readFileSync(filePath, 'utf8');
    expect(content).toContain('Connect Health Sync');
    expect(content).toContain('Log Activity');
    expect(content).toContain('Ask Coach');
    expect(content).toContain('APP_HREFS.settingsHealth');
    expect(content).toContain('APP_HREFS.log');
    expect(content).toContain('APP_HREFS.coach');
  });

  it('exports from index.ts', () => {
    const content = readFileSync(indexFile, 'utf8');
    expect(content).toContain("export * from './FirstRunActivationCompanion'");
  });
});
