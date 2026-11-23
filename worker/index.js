const NOAA = 'https://www.ndbc.noaa.gov/data/realtime2/';
const HISTORY = (7 * 24 + 12) * 60 * 60 * 1000;
const CACHE_SECONDS = 180;
const directions = new Set('N NNE NE ENE E ESE SE SSE S SSW SW WSW W WNW NW NNW'.split(' '));
const steepnessValues = new Set(['VERY_STEEP', 'STEEP', 'AVERAGE', 'SWELL']);
const fields = {
  spec: {
    WVHT: 'wave', SwH: 'swell', SwP: 'swellPeriod', WWH: 'windWave', WWP: 'windWavePeriod',
    SwD: 'swellDirection', WWD: 'windWaveDirection', STEEPNESS: 'steepness', APD: 'averagePeriod', MWD: 'direction',
  },
  txt: { WVHT: 'wave', DPD: 'period', APD: 'averagePeriod', MWD: 'direction', WTMP: 'temperature' },
};

function parseValue(column, value) {
  if (column === 'STEEPNESS') return steepnessValues.has(value) ? value.replace('_', ' ').toLowerCase() : undefined;
  if (directions.has(value) && (column === 'SwD' || column === 'WWD')) return value;
  const number = Number(value);
  if (!Number.isFinite(number)) return;
  if (column === 'WTMP') return number >= -5 && number <= 50 ? number : undefined;
  if (column === 'MWD' || column === 'SwD' || column === 'WWD') {
    return number >= 0 && number <= 360 ? number : undefined;
  }
  const period = ['DPD', 'APD', 'SwP', 'WWP'].includes(column);
  if (number >= 0 && number < 99 && (!period || number > 0)) return number;
}

export function parseFeed(text, type, cutoff) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const names = header.trim().split(/\s+/);
  const columns = Object.entries(fields[type]).map(([column, key]) => [column, key, names.indexOf(column)]);
  if (names.slice(0, 5).join(' ') !== '#YY MM DD hh mm' || columns.some(([, , index]) => index < 0)) {
    throw new Error('Unexpected NOAA feed format');
  }
  const rows = [];
  for (const line of lines) {
    const cells = line.trim().split(/\s+/);
    if (cells.length !== names.length || !/^\d{4}$/.test(cells[0])) continue;
    const [year, month, day, hours, minutes] = cells.slice(0, 5).map(Number);
    const time = Date.UTC(year, month - 1, day, hours, minutes);
    if (!Number.isFinite(time)) continue;
    if (time < cutoff) break;
    const row = { time };
    for (const [column, key, index] of columns) {
      const value = parseValue(column, cells[index]);
      if (value !== undefined) row[key] = value;
    }
    if (Object.keys(row).length > 1) rows.push(row);
  }
  return rows;
}

async function fetchFeed(station, type, cutoff) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(NOAA + station + '.' + type, {
      redirect: 'manual',
      signal: controller.signal,
    });
    if (response.status === 404) return [];
    if (!response.ok) throw new Error('NOAA returned ' + response.status);
    return parseFeed(await response.text(), type, cutoff);
  } finally {
    clearTimeout(timer);
  }
}

function json(value, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      'access-control-allow-origin': '*',
      'cache-control': status === 200 ? 'public, max-age=' + CACHE_SECONDS : 'no-store',
    },
  });
}

export default {
  async fetch(request, _env, ctx) {
    if (request.method !== 'GET') return json({ error: 'Only GET is supported.' }, 405);
    const url = new URL(request.url);
    if (url.pathname === '/') {
      return json({ service: 'SurfingCoder buoy observations', route: '/waves/{station}.json', source: NOAA });
    }
    const match = /^\/waves\/([0-9A-Z]{5})\.json$/.exec(url.pathname);
    if (!match) return json({ error: 'Unknown station route.' }, 404);
    const station = match[1];
    url.search = '';
    const cache = globalThis.caches?.default;
    const cached = await cache?.match(url.href).catch(() => undefined);
    if (cached) return cached;

    const cutoff = Date.now() - HISTORY;
    const [detailed, standard] = await Promise.allSettled([
      fetchFeed(station, 'spec', cutoff),
      fetchFeed(station, 'txt', cutoff),
    ]);
    if (detailed.status === 'rejected') {
      console.error('NOAA detailed feed failed', station, detailed.reason?.message);
      return json({ error: 'NOAA wave summary is unavailable.' }, 502);
    }
    if (!detailed.value.length) return json({ error: 'No recent detailed observations for this buoy.' }, 404);

    const rows = new Map((standard.status === 'fulfilled' ? standard.value : []).map(row => [row.time, row]));
    for (const row of detailed.value) rows.set(row.time, { ...rows.get(row.time), ...row });
    const output = [...rows.values()].filter(row => Number.isFinite(row.wave) ||
      Number.isFinite(row.swell) || Number.isFinite(row.windWave)).sort((a, b) => b.time - a.time);
    if (!output.length) return json({ error: 'No recent wave observations for this buoy.' }, 404);
    const response = json(output);
    if (cache) ctx.waitUntil(cache.put(url.href, response.clone()).catch(() => {}));
    return response;
  },
};
