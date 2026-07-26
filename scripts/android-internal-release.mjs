#!/usr/bin/env node
/**
 * Build a Play-signed Android App Bundle for Internal testing (local Gradle),
 * optionally upload + roll out to the Play Internal testing track.
 *
 * Usage:
 *   pnpm release:android:internal -- --version-code 2
 *   pnpm release:android:internal -- --version-code 2 --upload-internal
 *   pnpm release:android:internal -- --upload-internal --aab dist/android-internal/foo.aab
 *   pnpm release:android:internal -- --version-code 2 --dry-run
 *
 * Requires for build: credentials/android/keystore.properties + keystore, ANDROID_HOME, JDK 17,
 * production .env (no EXPO_PUBLIC_E2E_*).
 * Requires for upload: credentials/android/play-service-account.json (Play Console user with
 * "Release apps to testing tracks").
 */

import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const APP_JSON = join(ROOT, 'app.json');
const ENV_PATH = join(ROOT, '.env');
const ENV_LOCAL_PATH = join(ROOT, '.env.local');
const KEYSTORE_PROPS = join(ROOT, 'credentials/android/keystore.properties');
const DEFAULT_SERVICE_ACCOUNT = join(ROOT, 'credentials/android/play-service-account.json');
const OUT_DIR = join(ROOT, 'dist', 'android-internal');
const DEFAULT_AAB = join(ROOT, 'android/app/build/outputs/bundle/release/app-release.aab');
const PACKAGE_NAME = 'com.coachwatts.app';
const INTERNAL_TRACK = 'internal';

function usage(exitCode = 0) {
  console.log(`Usage: node scripts/android-internal-release.mjs [options]

Build options:
  --version-code <n>     Play versionCode (required to build; must be new each upload)
  --env-file <path>      Use this env file instead of .env for the build (restored after)
  --skip-prebuild        Skip expo prebuild (reuse existing android/)
  --no-clean             prebuild without --clean

Upload options:
  --upload-internal      Upload AAB to Play Internal testing and roll out
  --aab <path>           Upload this AAB (skips build); implies --upload-internal
  --service-account <p>  Play API JSON key (default: credentials/android/play-service-account.json)
  --draft                Upload as draft release (do not roll out to testers)

Other:
  --dry-run              Print planned actions only
  -h, --help             Show this help
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const opts = {
    versionCode: null,
    envFile: null,
    skipPrebuild: false,
    clean: true,
    dryRun: false,
    uploadInternal: false,
    aab: null,
    serviceAccount: DEFAULT_SERVICE_ACCOUNT,
    draft: false,
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
      case '--':
        break;
      case '-h':
      case '--help':
        usage(0);
        break;
      case '--version-code':
        opts.versionCode = Number(next());
        break;
      case '--env-file':
        opts.envFile = resolve(next());
        break;
      case '--skip-prebuild':
        opts.skipPrebuild = true;
        break;
      case '--no-clean':
        opts.clean = false;
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      case '--upload-internal':
        opts.uploadInternal = true;
        break;
      case '--aab':
        opts.aab = resolve(next());
        opts.uploadInternal = true;
        break;
      case '--service-account':
        opts.serviceAccount = resolve(next());
        break;
      case '--draft':
        opts.draft = true;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  const uploadOnly = Boolean(opts.aab);
  if (!uploadOnly) {
    if (opts.versionCode == null || !Number.isInteger(opts.versionCode) || opts.versionCode < 1) {
      throw new Error('--version-code <positive integer> is required to build');
    }
  } else if (
    opts.versionCode != null &&
    (!Number.isInteger(opts.versionCode) || opts.versionCode < 1)
  ) {
    throw new Error('--version-code must be a positive integer when set');
  }

  return opts;
}

function run(cmd, args, { cwd = ROOT, env = process.env } = {}) {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${cmd} exited with code ${result.status}`);
  }
}

function readDotEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function assertNoE2eFlags(envPath) {
  const env = readDotEnv(envPath);
  const enabled = Object.keys(env)
    .filter((k) => k.startsWith('EXPO_PUBLIC_E2E_'))
    .filter((k) => {
      const v = String(env[k] ?? '')
        .trim()
        .toLowerCase();
      return v !== '' && v !== '0' && v !== 'false' && v !== 'off' && v !== 'no';
    });
  if (enabled.length) {
    throw new Error(
      `Refusing store AAB: ${enabled.join(', ')} set in ${envPath}. Use a production env (or --env-file).`,
    );
  }
}

function assertReleaseEnv(envPath) {
  assertNoE2eFlags(envPath);

  const env = readDotEnv(envPath);
  const required = [
    'EXPO_PUBLIC_SENTRY_DSN',
    'GOOGLE_MAPS_API_KEY',
    'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
  ];
  const missing = required.filter((k) => !String(env[k] ?? '').trim());
  if (missing.length) {
    throw new Error(`Missing required env in ${envPath}: ${missing.join(', ')}`);
  }
}

function assertSigning() {
  if (!existsSync(KEYSTORE_PROPS)) {
    throw new Error(
      `Missing ${KEYSTORE_PROPS}. See docs/distribution/tasks/014-eas-android-credentials.md`,
    );
  }
  const props = readDotEnv(KEYSTORE_PROPS);
  const storeFile = props.storeFile?.trim();
  if (!storeFile) {
    throw new Error('keystore.properties is missing storeFile');
  }
  if (!existsSync(storeFile)) {
    throw new Error(`Keystore file not found: ${storeFile}`);
  }
  for (const key of ['storePassword', 'keyPassword', 'keyAlias']) {
    if (!String(props[key] ?? '').trim()) {
      throw new Error(`keystore.properties is missing ${key}`);
    }
  }
}

function assertToolchain() {
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!androidHome || !existsSync(androidHome)) {
    throw new Error('ANDROID_HOME / ANDROID_SDK_ROOT is not set to an existing SDK');
  }
  const java = spawnSync('java', ['-version'], { encoding: 'utf8' });
  if (java.status !== 0) {
    throw new Error('java not found on PATH (need JDK 17)');
  }
}

function setVersionCode(versionCode) {
  const app = JSON.parse(readFileSync(APP_JSON, 'utf8'));
  if (!app.expo?.android || typeof app.expo.android !== 'object') {
    throw new Error('app.json missing expo.android');
  }
  const previous = app.expo.android.versionCode;
  app.expo.android.versionCode = versionCode;
  writeFileSync(APP_JSON, `${JSON.stringify(app, null, 2)}\n`);
  console.log(`expo.android.versionCode: ${previous ?? '(unset)'} → ${versionCode}`);
  return String(app.expo.version ?? '0.0.0');
}

function withReleaseEnvIsolation(envFile, fn) {
  const envBackup = `${ENV_PATH}.android-internal-release.bak`;
  const localBackup = `${ENV_LOCAL_PATH}.android-internal-release.bak`;
  const hadEnv = existsSync(ENV_PATH);
  const hadLocal = existsSync(ENV_LOCAL_PATH);

  if (envFile) {
    if (!existsSync(envFile)) {
      throw new Error(`--env-file not found: ${envFile}`);
    }
    if (hadEnv) renameSync(ENV_PATH, envBackup);
    copyFileSync(envFile, ENV_PATH);
  }

  // Expo loads .env.local over .env — park it for the whole release build.
  if (hadLocal) {
    assertNoE2eFlags(ENV_LOCAL_PATH);
    renameSync(ENV_LOCAL_PATH, localBackup);
  }

  try {
    return fn();
  } finally {
    if (hadLocal && existsSync(localBackup)) {
      renameSync(localBackup, ENV_LOCAL_PATH);
    }
    if (envFile) {
      rmSync(ENV_PATH, { force: true });
      if (hadEnv && existsSync(envBackup)) {
        renameSync(envBackup, ENV_PATH);
      }
    }
  }
}

async function uploadInternalAab({ aabPath, serviceAccountPath, draft, versionCode, versionName }) {
  if (!existsSync(serviceAccountPath)) {
    throw new Error(
      `Missing Play service account JSON: ${serviceAccountPath}\nCreate via gcloud + invite in Play Console Users and permissions.`,
    );
  }
  if (!existsSync(aabPath)) {
    throw new Error(`AAB not found: ${aabPath}`);
  }

  const credentials = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
  const play = google.androidpublisher({ version: 'v3', auth });

  console.log(`\nUploading to Play Internal testing…`);
  console.log(`  package: ${PACKAGE_NAME}`);
  console.log(`  aab: ${aabPath}`);
  console.log(`  sa: ${credentials.client_email}`);
  console.log(`  status: ${draft ? 'draft' : 'completed (roll out)'}`);

  const edit = await play.edits.insert({ packageName: PACKAGE_NAME });
  const editId = edit.data.id;
  if (!editId) throw new Error('Play edits.insert returned no edit id');

  try {
    const upload = await play.edits.bundles.upload({
      packageName: PACKAGE_NAME,
      editId,
      media: {
        mimeType: 'application/octet-stream',
        body: createReadStream(aabPath),
      },
    });

    const uploadedVersionCode = upload.data.versionCode;
    console.log(`  uploaded versionCode: ${uploadedVersionCode}`);

    const releaseName =
      versionName && uploadedVersionCode
        ? `${versionName} (${uploadedVersionCode})`
        : versionName || (uploadedVersionCode != null ? String(uploadedVersionCode) : undefined);

    await play.edits.tracks.update({
      packageName: PACKAGE_NAME,
      editId,
      track: INTERNAL_TRACK,
      requestBody: {
        track: INTERNAL_TRACK,
        releases: [
          {
            name: releaseName,
            status: draft ? 'draft' : 'completed',
            versionCodes: [String(uploadedVersionCode)],
          },
        ],
      },
    });

    await play.edits.commit({ packageName: PACKAGE_NAME, editId });

    console.log(`\nPlay Internal ${draft ? 'draft' : 'rollout'} committed.`);
    if (versionCode != null && uploadedVersionCode !== versionCode) {
      console.log(
        `Note: requested versionCode ${versionCode} but Play reported ${uploadedVersionCode}.`,
      );
    }
    return uploadedVersionCode;
  } catch (err) {
    try {
      await play.edits.delete({ packageName: PACKAGE_NAME, editId });
    } catch {
      // best-effort cleanup
    }
    throw err;
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const uploadOnly = Boolean(opts.aab);

  console.log('Android internal release (local Gradle AAB)');
  console.log(`  root: ${ROOT}`);
  console.log(
    `  mode: ${uploadOnly ? 'upload-only' : opts.uploadInternal ? 'build+upload' : 'build'}`,
  );
  if (opts.versionCode != null) console.log(`  versionCode: ${opts.versionCode}`);
  if (!uploadOnly) {
    console.log(`  env: ${opts.envFile ?? ENV_PATH}`);
    console.log(`  prebuild: ${opts.skipPrebuild ? 'skip' : opts.clean ? 'clean' : 'no-clean'}`);
  }
  if (opts.uploadInternal) {
    console.log(`  upload: internal${opts.draft ? ' (draft)' : ''}`);
    console.log(`  serviceAccount: ${opts.serviceAccount}`);
  }

  let versionName = null;
  let outPath = opts.aab;

  if (!uploadOnly) {
    assertToolchain();
    assertSigning();
    const activeEnv = opts.envFile ?? ENV_PATH;
    assertReleaseEnv(activeEnv);
    if (existsSync(ENV_LOCAL_PATH)) {
      assertNoE2eFlags(ENV_LOCAL_PATH);
    }

    if (opts.dryRun) {
      console.log(
        `\nDry run OK — would set versionCode, prebuild, bundleRelease${
          opts.uploadInternal ? ', and upload to Internal' : ''
        }.`,
      );
      return;
    }

    versionName = setVersionCode(opts.versionCode);

    withReleaseEnvIsolation(opts.envFile, () => {
      const buildEnv = {
        ...process.env,
        SENTRY_DISABLE_AUTO_UPLOAD: 'true',
      };
      for (const key of Object.keys(buildEnv)) {
        if (key.startsWith('EXPO_PUBLIC_E2E_')) {
          delete buildEnv[key];
        }
      }

      if (!opts.skipPrebuild) {
        const prebuildArgs = ['expo', 'prebuild', '-p', 'android'];
        if (opts.clean) prebuildArgs.push('--clean');
        run('npx', prebuildArgs, { env: buildEnv });
      } else if (!existsSync(join(ROOT, 'android'))) {
        throw new Error('--skip-prebuild set but android/ is missing');
      }

      const gradlew = join(ROOT, 'android/gradlew');
      if (!existsSync(gradlew)) {
        throw new Error('android/gradlew missing — run without --skip-prebuild');
      }

      run(gradlew, ['bundleRelease'], {
        cwd: join(ROOT, 'android'),
        env: buildEnv,
      });
    });

    if (!existsSync(DEFAULT_AAB)) {
      throw new Error(`AAB not found at ${DEFAULT_AAB}`);
    }

    mkdirSync(OUT_DIR, { recursive: true });
    const outName = `coach-watts-${versionName}-vc${opts.versionCode}.aab`;
    outPath = join(OUT_DIR, outName);
    copyFileSync(DEFAULT_AAB, outPath);
  } else {
    if (!existsSync(outPath)) {
      throw new Error(`--aab not found: ${outPath}`);
    }
    if (opts.dryRun) {
      console.log(
        `\nDry run OK — would upload ${outPath} to Play Internal${opts.draft ? ' as draft' : ''}.`,
      );
      return;
    }
    try {
      versionName = String(JSON.parse(readFileSync(APP_JSON, 'utf8')).expo?.version ?? '');
    } catch {
      versionName = null;
    }
  }

  const mb = (statSync(outPath).size / (1024 * 1024)).toFixed(1);
  console.log(`\nAAB ready (${mb} MiB):`);
  console.log(`  ${outPath}`);

  if (opts.uploadInternal) {
    const uploaded = await uploadInternalAab({
      aabPath: outPath,
      serviceAccountPath: opts.serviceAccount,
      draft: opts.draft,
      versionCode: opts.versionCode,
      versionName,
    });
    console.log(`\nNext:`);
    console.log('  1. Confirm Internal testing release in Play Console (testers + opt-in link)');
    console.log(
      `  2. Prepend versionName ${versionName ?? '?'} / versionCode ${uploaded} to docs/distribution/log.md`,
    );
    console.log('  3. Promote Internal → Production later from Play Console (task 017)');
    return;
  }

  console.log(`\nNext:`);
  console.log(
    '  1. Re-run with --upload-internal, or Play Console → Internal testing → upload AAB',
  );
  console.log(
    `  2. Prepend versionName ${versionName} / versionCode ${opts.versionCode} to docs/distribution/log.md`,
  );
  console.log('  3. Promote Internal → Production later from Play Console (task 017)');
}

try {
  await main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  const details = err?.errors?.[0]?.message || err?.response?.data?.error?.message;
  console.error(`\n${message}`);
  if (details && details !== message) console.error(details);
  process.exit(1);
}
