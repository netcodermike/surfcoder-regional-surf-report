import assert from 'node:assert/strict';
import test from 'node:test';
import worker, { parseFeed } from './index.js';

const summary =
  '#YY MM DD hh mm WVHT SwH SwP WWH WWP SwD WWD STEEPNESS APD MWD\n' +
  '2026 11 21 00 56 2.1 0.8 10.5 2.0 9.9 SSE SSE AVERAGE 5.9 159\n' +
  '2026 11 21 00 26 2.0 0.8 11.1 1.9 MM SSE 999 N/A 5.8 153\n';
const standard =
  '#YY MM DD hh mm WVHT DPD APD MWD WTMP\n' +
  '2026 11 21 00 56 2.2 11 5.9 159 19.8\n';
const time = Date.UTC(2026, 10, 21, 0, 56);

test('parses wave fields, skips sentinels, and applies the cutoff', () => {
  const [first, second] = parseFeed(summary, 'spec', time - 2_000_000);
  assert.deepEqual(first, { time, wave: 2.1, swell: 0.8, swellPeriod: 10.5, windWave: 2, windWavePeriod: 9.9,
    swellDirection: 'SSE', windWaveDirection: 'SSE', steepness: 'average', averagePeriod: 5.9, direction: 159 });
  assert.equal(second.windWaveDirection, undefined);
  assert.equal(second.windWavePeriod, undefined);
  assert.equal(parseFeed(summary, 'spec', time).length, 1);
});

test('merges the NOAA feeds and caches successful public responses', async context => {
  context.mock.method(Date, 'now', () => time + 1000);
  const fetcher = context.mock.method(globalThis, 'fetch', async url =>
    new Response(url.endsWith('.spec') ? summary : standard));
  const cacheEntries = new Map();
  const previousCaches = globalThis.caches;
  globalThis.caches = { default: {
    match: async key => cacheEntries.get(key)?.clone(),
    put: async (key, value) => cacheEntries.set(key, value),
  } };
  context.after(() => { globalThis.caches = previousCaches; });
  const ctx = { waitUntil: () => {} };
  const url = 'https://example.test/waves/41159.json';
  const result = await worker.fetch(new Request(url), {}, ctx);
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('access-control-allow-origin'), '*');
  const [first] = await result.json();
  assert.equal(first.wave, 2.1);
  assert.equal(first.period, 11);
  assert.equal(first.temperature, 19.8);
  await worker.fetch(new Request(url + '?cache-bust=true'), {}, ctx);
  assert.equal(fetcher.mock.callCount(), 2);
  const noData = await worker.fetch(new Request('https://example.test/unknown'), {}, ctx);
  assert.equal(noData.status, 404);
});

test('reports an upstream summary failure so the client can use its mirror', async context => {
  context.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }));
  const request = new Request('https://example.test/waves/41159.json');
  const result = await worker.fetch(request, {}, {});
  assert.equal(result.status, 502);
  assert.equal(result.headers.get('cache-control'), 'no-store');
});
