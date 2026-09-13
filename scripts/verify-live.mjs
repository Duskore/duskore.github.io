import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT, ORIGIN, ADS_SHA256, renderSite, validateCatalog } from './build.mjs';

// Read-only HTTP verification. No console, store or advertising mutations.
const origin = process.argv[2] || ORIGIN;
const catalog = JSON.parse(readFileSync(resolve(ROOT, 'data/games.json'), 'utf8'));
validateCatalog(catalog);
const pages = renderSite(catalog);
const hash = value => createHash('sha256').update(value).digest('hex');

async function fetchPublic(path) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return response;
}

const checks = [...pages].map(async ([file, expected]) => {
  const path = '/' + file.replace(/index\.html$/, '');
  const response = await fetchPublic(path);
  const actual = await response.text();
  assert.equal(hash(actual), hash(expected), `${path}: deployed content differs from this checkout`);
  console.log(`PASS ${path}`);
});
const assets = ['/assets/site.css', ...new Set(catalog.games.map(game => game.image))];
for (const path of assets) {
  checks.push((async () => {
    const response = await fetchPublic(path);
    const actual = Buffer.from(await response.arrayBuffer());
    assert.equal(hash(actual), hash(readFileSync(resolve(ROOT, '.' + path))), `${path}: asset mismatch`);
    console.log(`PASS ${path}`);
  })());
}
checks.push((async () => {
  const response = await fetchPublic('/app-ads.txt');
  assert.match(response.headers.get('content-type'), /^text\/plain\b/);
  assert.equal(hash(Buffer.from(await response.arrayBuffer())), ADS_SHA256);
  console.log('PASS /app-ads.txt — exact publisher declaration, text/plain');
})());

if (origin === ORIGIN) {
  for (const path of ['/hexa-merge-support/', '/hexa-merge-support/support/', '/hexa-merge-support/privacy/']) {
    checks.push((async () => {
      const response = await fetchPublic(path);
      assert.match(response.headers.get('content-type'), /^text\/html\b/);
      assert.match(await response.text(), /Hexa Merge/);
      console.log(`PASS preserved ${path}`);
    })());
  }
}

const results = await Promise.allSettled(checks);
const failed = results.filter(result => result.status === 'rejected');
for (const failure of failed) console.error(failure.reason.message);
console.log(`${results.length - failed.length}/${results.length} HTTP checks passed for ${origin}.`);
process.exitCode = failed.length ? 1 : 0;
