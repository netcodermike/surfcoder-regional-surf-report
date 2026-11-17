import {test} from 'node:test';import assert from 'node:assert/strict';import * as c from '../src/core.js';
test('coordinates, unit conversion, compass and hourly alignment',()=>{assert.throws(()=>c.coordinates(91,0));assert.throws(()=>c.coordinates(NaN,0));assert.ok(Math.abs(c.height(1,'imperial')-3.28084)<1e-8);assert.equal(c.height(null,'metric'),null);assert.equal(c.compass(359),'N');const r=c.align({hourly:{time:[1,2],wave_height:[1,null]}},{hourly:{time:[2],wind_speed_10m:[10],wind_direction_10m:[90]}});assert.equal(r[0].speed,undefined);assert.equal(r[1].speed,10);assert.throws(()=>c.align({},null))});

test("optional swell partitions align and preserve missing values",()=>{const rows=c.align({hourly:{time:[1,2],secondary_swell_wave_height:[1.2,null],secondary_swell_wave_period:[12,13],tertiary_swell_wave_height:[null,null],wind_wave_height:[.4,.5]}},null);assert.equal(rows[0].secondary,1.2);assert.equal(rows[1].secondary,null);assert.equal(rows[1].secondaryPeriod,13);assert.equal(rows[0].tertiary,null);assert.equal(rows[0].windWave,.4);assert.equal(rows[0].swellDirection,null)});

import { nearestBuoys, parseReadings } from '../src/buoys.js';

test('the closest wave buoys are ordered by distance and limited to three nearby stations', () => {
  const { point: [, lat, lon] } = c.presetForLabel('Indian Beach, NC');
  const nearby = { id: '41159', lat: 34.211, lon: -76.944 };
  const stations = [
    { id: 'distant', lat: 38, lon },
    { id: 'second', lat: 34, lon },
    { id: 'third', lat: 33.8, lon },
    nearby,
    { id: 'fourth', lat: 33.7, lon },
  ];
  const results = nearestBuoys(stations, { lat, lon });
  assert.deepEqual(results.map(station => station.id), ['41159', 'second', 'third']);
  assert.ok(Math.abs(results[0].km - 52.6) < .2);
  assert.deepEqual(nearestBuoys(stations, { lat: 0, lon: 0 }), []);
});

test('the distance calculation works across the antimeridian', () => {
  const [station] = nearestBuoys([{ id: 'west', lat: 0, lon: -179.8 }], { lat: 0, lon: 179.8 });
  assert.ok(Math.abs(station.km - 44.5) < .1);
});

test('buoy readings use station and timestamp, skip missing heights, and preserve missing optional fields', () => {
  const data = { table: {
    columnNames: ['time', 'station', 'DPD', 'WVHT', 'WTMP', 'MWD'],
    rows: [
      ['2026-11-16T18:26:00Z', '41159', 7, .9, 20, 92],
      ['2026-11-16T19:26:00Z', '41159', 8, 1.1, null, null],
      ['2026-11-16T19:56:00Z', '41159', 8, null, 20, 90],
      ['2026-11-16T20:26:00Z', '44056', 5, .4, 16, 85],
    ],
  } };
  const readings = parseReadings(data, '41159');
  assert.deepEqual(readings.map(row => row.wave), [1.1, .9]);
  assert.equal(readings[0].direction, null);
  assert.equal(readings[0].time, Date.parse('2026-11-16T19:26:00Z'));
});
