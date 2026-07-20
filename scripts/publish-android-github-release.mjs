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
 *   pnpm release:android:github -- --local
 *   pnpm release:android:github -- --apk path/to/app.apk
 *   pnpm release:android:github -- --tag android-preview-smoke --draft
 *   pnpm release:android:github -- --dry-run
 *
 * Default tag is v<package.version> so the APK lands on the release-it GitHub
 * Release when that already exists (upload); otherwise a new release is created.
 *
 * Requires: `gh` with repo write access. Cloud/local EAS also need `eas` login;
 * `--local` needs Android SDK (`ANDROID_HOME`) like `pnpm android`.
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
  --local              Build the APK on this machine (eas build --local)
  --apk <path>         Publish an existing APK (skips EAS build/download)
  --build-id <id>      Wait for / reuse an EAS build id (skips starting a new one)
  --skip-build         Reuse the latest finished cloud Android build for the profile
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
    local: false,
    apk: null,
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
      case '--local':
        opts.local = true;
        break;
      case '--apk':
        opts.apk = next();
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
  if (opts.apk) opts.skipBuild = true;
  if (opts.local && (opts.buildId || opts.apk || opts.skipBuild)) {
    throw new Error('Use only one of --local, --apk, --build-id, or --skip-build');
  }
  return opts;
}

function run(command, args, { capture = false, allowFail = false, inheritStderr = false } = {}) {
  // capture+inheritStderr: keep JSON on stdout, stream progress/logs on stderr (eas --json).
  const stdio = capture
    ? ['ignore', 'pipe', inheritStderr ? 'inherit' : 'pipe']
    : 'inherit';
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio,
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

function extractJson(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) throw new Error('empty JSON');
  try {
    return JSON.parse(trimmed);
  } catch {
    // eas sometimes prints spinners/logs before the JSON payload
    const start = Math.min(
      ...['[', '{']
        .map((ch) => trimmed.indexOf(ch))
        .filter((i) => i >= 0),
    );
    if (!Number.isFinite(start) || start < 0) throw new Error('no JSON payload');
    return JSON.parse(trimmed.slice(start));
  }
}

function runJson(command, args, { inheritStderr = false } = {}) {
  const result = run(command, args, { capture: true, inheritStderr });
  const stdout = (result.stdout || '').trim();
  if (!stdout) throw new Error(`${command} returned empty JSON`);
  try {
    return extractJson(stdout);
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

function easJson(args, { inheritStderr = false, nonInteractive = true } = {}) {
  const flags = ['--json'];
  // build:view rejects --non-interactive; build/list accept it.
  if (nonInteractive) flags.push('--non-interactive');
  return runJson('npx', ['eas-cli', ...args, ...flags], { inheritStderr });
}

function easBuildUrl(buildId) {
  return `https://expo.dev/accounts/hdkillers-team/projects/coach-watts-app/builds/${buildId}`;
}

function waitForFinishedBuild(buildId, { pollSeconds = 30 } = {}) {
  console.log(`Waiting for EAS build ${buildId} to finish…`);
  console.log(`Logs: ${easBuildUrl(buildId)}`);
  console.log('(Ctrl+C stops this waiter only — the cloud build keeps running.)\n');

  for (;;) {
    const build = unwrapBuild(
      easJson(['build:view', buildId], { nonInteractive: false }),
    );
    const status = String(build.status || '').toLowerCase();
    if (status === 'finished') return build;
    if (status === 'errored' || status === 'canceled') {
      throw new Error(
        `EAS build ${buildId} ended with status ${build.status}. See ${easBuildUrl(buildId)}`,
      );
    }
    console.log(`  status=${build.status || 'unknown'} — next check in ${pollSeconds}s`);
    spawnSync(process.platform === 'win32' ? 'timeout' : 'sleep', [
      process.platform === 'win32' ? '/T' : '',
      String(pollSeconds),
    ].filter(Boolean), { stdio: 'ignore' });
  }
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

async function materializeCloudApk(build, apkPath, dryRun) {
  const url = assertFinishedApk(build);
  if (dryRun) {
    console.log(`[dry-run] would download:\n  ${url}\n→ ${apkPath}`);
    return;
  }
  console.log(`\nDownloading APK → ${apkPath}`);
  await downloadApk(url, apkPath);
  const mb = (statSync(apkPath).size / (1024 * 1024)).toFixed(1);
  console.log(`Downloaded ${mb} MB`);
}

function ensureAndroidSdk() {
  const home = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (home && existsSync(home)) return;
  const fallback = join(process.env.HOME || '', 'Library', 'Android', 'sdk');
  if (existsSync(fallback)) {
    process.env.ANDROID_HOME = fallback;
    console.log(`Using ANDROID_HOME=${fallback}`);
    return;
  }
  throw new Error(
    'Android SDK not found. Set ANDROID_HOME (e.g. ~/Library/Android/sdk) or install Android Studio.',
  );
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
  if (opts.local) console.log('Build:   local (this machine)');
  if (opts.dryRun) console.log('Mode:    dry-run');

  mkdirSync(OUT_DIR, { recursive: true });
  const apkName = `CoachWatts-${opts.profile}-${version}-${sha}.apk`;
  const apkPath = join(OUT_DIR, apkName);

  let build = {
    id: opts.local ? 'local' : opts.apk ? 'local-apk' : 'unknown',
    status: 'finished',
  };

  if (opts.apk) {
    const sourceApk = resolve(opts.apk);
    if (!opts.dryRun && !existsSync(sourceApk)) {
      throw new Error(`APK not found: ${sourceApk}`);
    }
    if (opts.dryRun) {
      console.log(`\n[dry-run] would copy ${sourceApk} → ${apkPath}`);
    } else {
      console.log(`\nUsing existing APK ${sourceApk}`);
      copyFileSync(sourceApk, apkPath);
    }
  } else if (opts.buildId) {
    console.log(`\nUsing EAS build ${opts.buildId}…`);
    build = waitForFinishedBuild(opts.buildId);
    await materializeCloudApk(build, apkPath, opts.dryRun);
  } else if (opts.skipBuild) {
    console.log(`\nFetching latest finished Android ${opts.profile} build…`);
    build = unwrapBuild(
      easJson([
        'build:list',
        '-p',
        'android',
        '-e',
        opts.profile,
        '--status',
        'finished',
        '--limit',
        '1',
      ]),
    );
    await materializeCloudApk(build, apkPath, opts.dryRun);
  } else if (opts.dryRun) {
    const where = opts.local ? 'locally (--local)' : 'on EAS cloud';
    console.log(`\n[dry-run] would build Android ${opts.profile} ${where}`);
    console.log(`[dry-run] would produce ${apkPath}`);
  } else if (opts.local) {
    console.log(`\nBuilding Android APK locally (profile=${opts.profile})…`);
    console.log('Needs ANDROID_HOME / SDK like `pnpm android`. Gradle progress below.\n');
    ensureAndroidSdk();
    // Same as `pnpm android`: skip Sentry sourcemap upload so missing cli/auth
    // cannot fail the Gradle release bundle step under pnpm.
    process.env.SENTRY_DISABLE_AUTO_UPLOAD = 'true';
    run('npx', [
      'eas-cli',
      'build',
      '-p',
      'android',
      '--profile',
      opts.profile,
      '--local',
      '--non-interactive',
      '--output',
      apkPath,
      '-m',
      `GitHub Release ${tag}`,
    ]);
    if (!existsSync(apkPath)) {
      throw new Error(`Local EAS build finished but APK missing at ${apkPath}`);
    }
    const mb = (statSync(apkPath).size / (1024 * 1024)).toFixed(1);
    console.log(`\nLocal APK ready (${mb} MB): ${apkPath}`);
  } else {
    console.log(`\nStarting EAS Android cloud build (profile=${opts.profile})…`);
    console.log(
      'Cloud builds often take 10–20+ minutes (queue + Gradle). Progress streams below.',
    );
    console.log(
      'Prefer a machine build? Re-run with --local. Ctrl+C cancels waiting only — resume with --build-id.\n',
    );

    run('npx', [
      'eas-cli',
      'build',
      '-p',
      'android',
      '--profile',
      opts.profile,
      '--wait',
      '--non-interactive',
      '-m',
      `GitHub Release ${tag}`,
    ]);

    build = unwrapBuild(
      easJson([
        'build:list',
        '-p',
        'android',
        '-e',
        opts.profile,
        '--status',
        'finished',
        '--limit',
        '1',
      ]),
    );
    console.log(`Using finished build ${build.id}`);
    await materializeCloudApk(build, apkPath, false);
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
