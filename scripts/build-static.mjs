/**
 * Build the frontend as static assets in ./dist
 *
 * Usage:
 *   npm run build:static
 *   node scripts/build-static.mjs
 *
 * Optional env:
 *   VITE_API_BASE_URL=https://api.example.com/api/v1
 *   VITE_BASE=/subpath/
 */

import { spawnSync } from 'node:child_process';
import { readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const distDir = path.join(frontendRoot, 'dist');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: frontendRoot,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function listDistSummary() {
  const entries = await readdir(distDir);
  let totalBytes = 0;

  async function walk(relativePath) {
    const fullPath = path.join(distDir, relativePath);
    const info = await stat(fullPath);
    if (info.isDirectory()) {
      const children = await readdir(fullPath);
      for (const child of children) {
        await walk(path.join(relativePath, child));
      }
      return;
    }
    totalBytes += info.size;
  }

  for (const entry of entries) {
    await walk(entry);
  }

  return { fileCount: entries.length, totalBytes };
}

async function main() {
  console.log('Building static frontend into dist/ ...');

  await rm(distDir, { recursive: true, force: true });

  run('npx', ['tsc', '-b']);
  run('npx', ['vite', 'build', '--mode', 'production']);

  const summary = await listDistSummary();
  const sizeKb = (summary.totalBytes / 1024).toFixed(1);

  console.log('');
  console.log(`Static build complete: ${distDir}`);
  console.log(`Top-level entries: ${summary.fileCount} | Total size: ${sizeKb} KB`);
  console.log('');
  console.log('Preview locally:');
  console.log('  npm run preview');
  console.log('');
  console.log('Serve dist/ with any static file server (SPA fallback to index.html).');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
