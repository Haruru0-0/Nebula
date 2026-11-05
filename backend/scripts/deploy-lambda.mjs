#!/usr/bin/env node
// Builds the Lambda container image and deploys it with SAM.
//
//   node scripts/deploy-lambda.mjs --client-url https://your-frontend.vercel.app
//
// The secrets are read from backend/.env on THIS machine and handed straight to `sam deploy` as parameters.
// Nothing is printed and nothing is written to a file. Run it yourself in your own terminal.
// Needs: Docker Desktop running, the AWS CLI configured (`aws configure`), and SAM.

import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const clientUrl = flag('client-url') ?? 'http://localhost:3000';
const region = flag('region') ?? 'us-east-2';
const stack = flag('stack') ?? 'nebula-api';

// Minimal .env reader: KEY=VALUE lines, optional quotes, trailing comments after " #" ignored
const env = {};
for (const line of readFileSync(join(root, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (!m) continue;
  let value = m[2].trim();
  if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
  else value = value.replace(/\s+#.*$/, '');
  env[m[1]] = value;
}

const need = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'KEY_ENCRYPTION_SECRET', 'SMTP_USER', 'SMTP_PASSWORD', 'EMAIL_FROM'];
const missing = need.filter((k) => !env[k]);
if (missing.length) {
  console.error(`backend/.env is missing: ${missing.join(', ')}`);
  process.exit(1);
}

const overrides = [
  ['ClientUrl', clientUrl],
  ['DatabaseUrl', env.DATABASE_URL],
  ['JwtSecret', env.JWT_SECRET],
  ['JwtRefreshSecret', env.JWT_REFRESH_SECRET],
  ['KeyEncryptionSecret', env.KEY_ENCRYPTION_SECRET],
  ['SmtpHost', env.SMTP_HOST || 'smtp.gmail.com'],
  ['SmtpPort', env.SMTP_PORT || '587'],
  ['SmtpUser', env.SMTP_USER],
  ['SmtpPassword', env.SMTP_PASSWORD],
  ['EmailFrom', env.EMAIL_FROM],
].map(([k, v]) => `${k}=${v}`);
// Note: OPENAI_API_KEY, GEMINI_API_KEY and DEEPSEEK_API_KEY are deliberately not sent, so every user adds their own.

const sam = process.platform === 'win32' ? 'sam.cmd' : 'sam';
const run = (cmd, cmdArgs) => {
  const r = spawnSync(cmd, cmdArgs, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' && cmd.endsWith('.cmd') });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

// Compile the app and install only its production packages here, on your machine, then let Docker copy the result.
// (Installing packages inside Docker stalled on some networks.)
const yarn = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
console.log('Compiling and staging the app in .lambda-build/ ...');
run(yarn, ['build']);
const stage = join(root, '.lambda-build');
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
cpSync(join(root, 'dist'), join(stage, 'dist'), { recursive: true });
cpSync(join(root, 'package.json'), join(stage, 'package.json'));
cpSync(join(root, 'yarn.lock'), join(stage, 'yarn.lock'));
const install = spawnSync(yarn, ['install', '--frozen-lockfile', '--production', '--ignore-scripts'], {
  cwd: stage,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (install.status !== 0) process.exit(install.status ?? 1);

console.log('Building the image (Docker must be running)...');
run(sam, ['build']);

console.log(`Deploying stack "${stack}" to ${region} with client URL ${clientUrl} ...`);
run(sam, [
  'deploy',
  '--stack-name', stack,
  '--region', region,
  '--resolve-image-repos',
  '--capabilities', 'CAPABILITY_IAM',
  '--no-confirm-changeset',
  '--no-fail-on-empty-changeset',
  '--parameter-overrides', ...overrides,
]);

console.log('\nDone. The ApiUrl above is your backend address.');
