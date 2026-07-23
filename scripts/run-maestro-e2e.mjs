#!/usr/bin/env node
/**
 * Run Maestro with a fresh e2e login deep link.
 *
 * When coach-wattz e2e is only on 127.0.0.1 (ssh -L), the iOS Simulator often
 * cannot mint via loopback — we forward the Mac LAN IP → 127.0.0.1:3199 and
 * pass that host in coachwatts://e2e/login?instance=…
 *
 * Usage: node scripts/run-maestro-e2e.mjs [maestro args…]
 * Example: node scripts/run-maestro-e2e.mjs maestro/smoke-shell.yaml
 */
import { createConnection, createServer } from 'node:net';
import { networkInterfaces } from 'node:os';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = Number(process.env.E2E_PORT || 3199);
const EMAIL = process.env.E2E_LOGIN_EMAIL || 'e2e-athlete@coachwatts.test';

function lanIpv4() {
  const preferred = process.env.E2E_INSTANCE_HOST?.trim();
  if (preferred) return preferred;
  for (const entries of Object.values(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.internal || entry.family !== 'IPv4') continue;
      if (
        entry.address.startsWith('192.168.') ||
        entry.address.startsWith('10.') ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(entry.address)
      ) {
        return entry.address;
      }
    }
  }
  return null;
}

async function healthy(host) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(`http://${host}:${PORT}/api/health`, {
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function ensureLanForward(lanHost) {
  return new Promise((resolve, reject) => {
    const server = createServer((client) => {
      const upstream = createConnection({ host: '127.0.0.1', port: PORT }, () => {
        client.pipe(upstream);
        upstream.pipe(client);
      });
      upstream.on('error', () => client.destroy());
      client.on('error', () => upstream.destroy());
    });
    server.on('error', reject);
    server.listen(PORT, lanHost, () => resolve(server));
  });
}

const maestroArgs = process.argv.slice(2);
if (maestroArgs.length === 0) {
  console.error('usage: node scripts/run-maestro-e2e.mjs <maestro-args…>');
  process.exit(1);
}

if (!(await healthy('127.0.0.1'))) {
  console.error(
    `run-maestro-e2e: 127.0.0.1:${PORT}/api/health failed — start coach-wattz e2e first`
  );
  process.exit(1);
}

let instanceHost = '127.0.0.1';
const lan = lanIpv4();
if (lan) {
  if (!(await healthy(lan))) {
    try {
      await ensureLanForward(lan);
      await sleep(200);
    } catch (error) {
      if (error && typeof error === 'object' && error.code !== 'EADDRINUSE') {
        console.warn('run-maestro-e2e: LAN forward failed', error.message ?? error);
      }
    }
  }
  if (await healthy(lan)) {
    instanceHost = lan;
  }
}

const instanceUrl = `http://${instanceHost}:${PORT}`;
const e2eLoginUrl =
  process.env.E2E_LOGIN_URL ||
  `coachwatts://e2e/login?email=${encodeURIComponent(EMAIL)}&instance=${encodeURIComponent(instanceUrl)}`;

console.log(`run-maestro-e2e: instance ${instanceUrl}`);
console.log(`run-maestro-e2e: ${e2eLoginUrl}`);

const child = spawn(
  'maestro',
  ['test', '-e', `E2E_LOGIN_URL=${e2eLoginUrl}`, ...maestroArgs],
  { stdio: 'inherit', env: process.env }
);

child.on('exit', (code) => process.exit(code ?? 1));
