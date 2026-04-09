const test = require('node:test');
const assert = require('node:assert/strict');

const calculations = require('../.tmp-tests/lib/mistico/calculations.js');
const normalization = require('../.tmp-tests/lib/mistico/normalization.js');
const parser = require('../.tmp-tests/lib/mistico/parser.js');

test('YoY formula uses (new-old)/old', () => {
  assert.equal(calculations.calculateYoYChange(120, 100), 0.2);
  assert.equal(calculations.calculateYoYChange(80, 100), -0.2);
  assert.equal(calculations.calculateYoYChange(10, 0), null);
});

test('market normalization maps aliases', () => {
  assert.equal(normalization.normalizeMarketChannel('EXP').canonical, 'EXPORT');
  assert.equal(normalization.normalizeMarketChannel('export').canonical, 'EXPORT');
  assert.equal(normalization.normalizeMarketChannel('hawker').canonical, 'HAWKERS');
});

test('orchard parser recalculates inconsistent 2026 ton/ha', () => {
  const csv = [
    'fruit;plant_year;age;rootstock;block;variety;trees;ha;bha;plant;row;c2024;t2024;c2025;t2025;c2026;t2026',
    'Appels;2011;12;M793;H3;FUJI;8354;5,01;1667;2;4;364;28;604;46;606;40',
  ].join('\n');

  const result = parser.parseOrchardCsv(csv);
  assert.equal(result.rows.length, 1);
  assert.equal(result.issues.some((i) => i.code === 'TON_HA_RECALCULATED'), true);
  assert.equal(result.rows[0].ton_ha_2026 > 2, true);
});
