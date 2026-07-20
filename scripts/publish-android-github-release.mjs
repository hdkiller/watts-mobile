#!/usr/bin/env node
/**
 * Build an Android preview APK on EAS and attach it to a GitHub Release
 * for sideload testing (not Play Store).
 *
 * Usage:
 *   pnpm release:patch                          # bump + CHANGELOG + GitHub notes
 *   pnpm release:android:github                 # EAS APK → attach to v<version>
 *   pnpm release:android:github -- --skip-build
 *   pnpm release:android:github -- --build-id <eas-build-id>
 *   pnpm release:android:github -- --tag android-preview-smoke --draft
 *   pnpm release:android:github -- --dry-run
 *
 * Default tag is v<package.version> so the APK lands on the release-it GitHub
 * Release when that already exists (upload); otherwise a new release is created.
 *
 * Requires: logged-in `eas` (npx eas-cli) and `gh` with repo write access.
 */

import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT_DIR = join(ROOT, 'dist', 'android-github-release');
const BLOCKED_PROFILES = new Set(['e2e', 'production']);

function usage(exitCode = 0) {
  console.log(`Usage: node scripts/publish-android-github-release.mjs [options]

Options:
  --profile <name>     EAS build profile (default: preview)
  --build-id <id>      Reuse an existing finished EAS build (skips build)
  --skip-build         Reuse the latest finished Android build for the profile
  --tag <tag>          GitHub release tag (default: v<version> from package.json)
  --title <title>      GitHub release title (create only)
  --notes <text>       Release notes body (create only; default: install notes)
  --notes-file <path>  Read release notes from a file (create only)
  --draft              Create a draft release (create only)
  --prerelease         Mark new releases as prerelease (default: on for create)
  --no-prerelease      Do not mark new releases as prerelease
  --dry-run            Print actions without building or publishing
  -h, --help           Show this help
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const opts = {
    profile: 'preview',
    buildId: null,
    skipBuild: false,
    tag: null,
    title: null,
    notes: null,
    notesFile: null,
    draft: false,
    prerelease: true,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${arg}`);
      }
      return value;
    };

    switch (arg) {
      case '-h':
      case '--help':
        usage(0);
        break;
      case '--profile':
        opts.profile = next();
        break;
      case '--build-id':
        opts.buildId = next();
        break;
      case '--skip-build':
        opts.skipBuild = true;
        break;
      case '--tag':
        opts.tag = next();
        break;
      case '--title':
        opts.title = next();
        break;
      case '--notes':
        opts.notes = next();
        break;
      case '--notes-file':
        opts.notesFile = next();
        break;
      case '--draft':
        opts.draft = true;
        break;
      case '--prerelease':
        opts.prerelease = true;
        break;
      case '--no-prerelease':
        opts.prerelease = false;
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (opts.buildId) opts.skipBuild = true;
  return opts;
}

function run(command, args, { capture = false, allowFail = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    shell: false,
  });

  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFail) {
    const detail = capture
      ? [result.stderr, result.stdout].filter(Boolean).join('\n').trim()
      : '';
    throw new Error(
      `${command} ${args.join(' ')} failed (exit ${result.status})${
        detail ? `\n${detail}` : ''
      }`,
    );
  }

  return result;
}

function runJson(command, args) {
  const result = run(command, args, { capture: true });
  const stdout = (result.stdout || '').trim();
  if (!stdout) throw new Error(`${command} returned empty JSON`);
  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON from ${command} ${args.join(' ')}:\n${stdout}\n${error}`,
    );
  }
}

function requireBin(bin, installHint) {
  const check = spawnSync(bin, ['--version'], { encoding: 'utf8' });
  if (check.error?.code === 'ENOENT' || check.status !== 0) {
    throw new Error(`Missing \`${bin}\`. ${installHint}`);
  }
}

function easJson(...args) {
  return runJson('npx', ['eas-cli', ...args, '--json', '--non-interactive']);
}

function gitShortSha() {
  const result = run('git', ['rev-parse', '--short', 'HEAD'], { capture: true });
  return (result.stdout || 'unknown').trim();
}

function appVersion() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  return String(pkg.version || '0.0.0').trim();
}

function githubReleaseExists(tag) {
  const result = run('gh', ['release', 'view', tag, '--json', 'url'], {
    capture: true,
    allowFail: true,
  });
  if (result.status !== 0) return null;
  try {
    const parsed = JSON.parse((result.stdout || '').trim());
    return parsed?.url ? { url: String(parsed.url) } : null;
  } catch {
    return null;
  }
}

function unwrapBuild(payload) {
  if (Array.isArray(payload)) {
    if (payload.length === 0) throw new Error('EAS returned no builds');
    return payload[0];
  }
  return payload;
}

function artifactUrl(build) {
  return (
    build?.artifacts?.applicationArchiveUrl ||
    build?.artifacts?.buildUrl ||
    null
  );
}

function assertFinishedApk(build) {
  if (!build?.id) throw new Error('EAS build payload missing id');
  if (String(build.status).toLowerCase() !== 'finished') {
    throw new Error(`EAS build ${build.id} is not finished (status: ${build.status})`);
  }
  const url = artifactUrl(build);
  if (!url) {
    throw new Error(
      `EAS build ${build.id} has no downloadable artifact URL. Confirm the profile builds an APK (preview uses android.buildType=apk).`,
    );
  }
  const blob = `${url} ${build.artifacts?.buildUrl || ''}`;
  if (/\.aab(\?|$)/i.test(blob)) {
    console.warn(
      'Warning: artifact looks like an AAB. Testers need an APK for GitHub sideload — preview profile sets android.buildType=apk.',
    );
  }
  return url;
}

async function downloadApk(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download APK (${response.status} ${response.statusText})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(destPath, buffer);
}

function defaultNotes({ version, sha, profile, buildId, apkName }) {
  return `Android **preview** build for sideload testing (not Play Store).

| | |
|---|---|
| App version | \`${version}\` |
| Git | \`${sha}\` |
| EAS profile | \`${profile}\` |
| EAS build | \`${buildId}\` |

## Install

1. On Android, download **${apkName}** from this release.
2. Open the file and allow install from the browser / Files app if prompted.
3. Sign in against \`https://coachwatts.com\` (or your instance).

Unknown-sources / "Install unknown apps" must be allowed for the app that opens the APK.
`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (BLOCKED_PROFILES.has(opts.profile)) {
    throw new Error(
      `Refusing profile "${opts.profile}". Use "preview" for GitHub sideload test builds (not e2e/production).`,
    );
  }

  requireBin('gh', 'Install GitHub CLI: https://cli.github.com/');
  requireBin('git', 'Install git.');

  const version = appVersion();
  const sha = gitShortSha();
  const tag = opts.tag || `v${version}`;
  const title = opts.title || `Coach Watts ${tag}`;
  const existingRelease = githubReleaseExists(tag);

  console.log(`Profile: ${opts.profile}`);
  console.log(`Tag:     ${tag}${existingRelease ? ' (existing GitHub release)' : ''}`);
  console.log(`Title:   ${title}`);
  if (opts.dryRun) console.log('Mode:    dry-run');

  let build;
  if (opts.buildId) {
    console.log(`\nFetching EAS build ${opts.buildId}…`);
    build = unwrapBuild(easJson('build:view', opts.buildId));
  } else if (opts.skipBuild) {
    console.log(`\nFetching latest finished Android ${opts.profile} build…`);
    build = unwrapBuild(
      easJson(
        'build:list',
        '-p',
        'android',
        '-e',
        opts.profile,
        '--status',
        'finished',
        '--limit',
        '1',
      ),
    );
  } else if (opts.dryRun) {
    console.log('\n[dry-run] would run: eas build -p android --profile', opts.profile);
    build = {
      id: 'dry-run-build-id',
      status: 'finished',
      artifacts: {
        applicationArchiveUrl: 'https://example.invalid/CoachWatts-dry-run.apk',
      },
    };
  } else {
    console.log(`\nStarting EAS Android build (profile=${opts.profile})…`);
    build = unwrapBuild(
      easJson(
        'build',
        '-p',
        'android',
        '--profile',
        opts.profile,
        '--wait',
        '-m',
        `GitHub Release ${tag}`,
      ),
    );
  }

  const url = assertFinishedApk(build);
  mkdirSync(OUT_DIR, { recursive: true });

  const apkName = `CoachWatts-${opts.profile}-${version}-${sha}.apk`;
  const apkPath = join(OUT_DIR, apkName);

  if (opts.dryRun) {
    console.log(`[dry-run] would download:\n  ${url}\n→ ${apkPath}`);
  } else {
    console.log(`\nDownloading APK → ${apkPath}`);
    await downloadApk(url, apkPath);
    const mb = (statSync(apkPath).size / (1024 * 1024)).toFixed(1);
    console.log(`Downloaded ${mb} MB`);
  }

  let releaseUrl = existingRelease?.url || '';

  if (existingRelease) {
    const uploadArgs = ['release', 'upload', tag, apkPath, '--clobber'];
    if (opts.dryRun) {
      console.log(`\n[dry-run] would run:\n  gh ${uploadArgs.join(' ')}`);
      console.log('\nDry run complete.');
      return;
    }
    console.log(`\nUploading APK to existing GitHub release ${tag}…`);
    run('gh', uploadArgs);
    releaseUrl = existingRelease.url;
    console.log(releaseUrl || `Uploaded to ${tag}.`);
  } else {
    let notes = opts.notes;
    if (opts.notesFile) {
      const notesPath = resolve(opts.notesFile);
      if (!existsSync(notesPath)) throw new Error(`Notes file not found: ${notesPath}`);
      notes = readFileSync(notesPath, 'utf8');
    }
    notes =
      notes ||
      defaultNotes({
        version,
        sha,
        profile: opts.profile,
        buildId: build.id,
        apkName,
      });

    const ghArgs = [
      'release',
      'create',
      tag,
      ...(opts.dryRun ? [] : [apkPath]),
      '--title',
      title,
      '--notes',
      notes,
    ];
    if (opts.draft) ghArgs.push('--draft');
    if (opts.prerelease) ghArgs.push('--prerelease');

    if (opts.dryRun) {
      console.log(
        `\n[dry-run] would run:\n  gh ${ghArgs.map((a) => (a.includes('\n') ? '…notes…' : a)).join(' ')}`,
      );
      console.log('\nDry run complete.');
      return;
    }

    console.log(`\nCreating GitHub release ${tag}…`);
    const release = run('gh', ghArgs, { capture: true });
    releaseUrl = (release.stdout || '').trim();
    console.log(releaseUrl || 'Release created.');
  }

  // Keep a small local pointer for the last published asset.
  const latestPointer = join(OUT_DIR, 'latest.json');
  writeFileSync(
    latestPointer,
    JSON.stringify(
      {
        tag,
        title,
        buildId: build.id,
        profile: opts.profile,
        version,
        sha,
        apk: basename(apkPath),
        releaseUrl,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ) + '\n',
  );

  // Convenience copy with a stable name for adb install loops.
  copyFileSync(apkPath, join(OUT_DIR, 'CoachWatts-preview-latest.apk'));
  console.log(`\nDone. Install with:\n  adb install -r ${join(OUT_DIR, 'CoachWatts-preview-latest.apk')}`);
}

main().catch((error) => {
  console.error(`\n${error.message || error}`);
  process.exit(1);
});
