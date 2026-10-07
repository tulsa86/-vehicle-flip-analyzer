const { test } = require('node:test');
const assert = require('node:assert/strict');
const { manualProvider } = require('./valuation.js');
const { calculate } = require('./calculator.js');
const costs = { purchase: 4500, fees: 450, transport: 250, repairs: 800, misc: 200, target: 2000, minRoi: 20 };
test('manual provider passes explicit values to the calculator without changing metadata', () => {
  const vehicle = { vin: 'TEST', trim: 'SE', zip: '01234', condition: 'Good' };
  const inputs = { marketValue: 9000, conservativeSaleValue: 7500, expectedSaleValue: 8500 };
  const valuation = manualProvider.getValues(vehicle, inputs);
  assert.deepEqual(valuation, { ...inputs, source: 'manual' });
  const r = calculate({ ...costs, ...valuation });
  assert.equal(r.expectedProfit, 2300); assert.equal(r.conservativeProfit, 1300);
  assert.equal(r.invested, 6200); assert.equal(r.maxPurchase, 4800);
  assert.equal(vehicle.zip, '01234'); assert.deepEqual(inputs, { marketValue: 9000, conservativeSaleValue: 7500, expectedSaleValue: 8500 });
});
test('manual provider does not invent missing values', () => {
  assert.deepEqual(manualProvider.getValues({}, {}), { source: 'manual', marketValue: null, conservativeSaleValue: null, expectedSaleValue: null });
});
test('manual provider rejects invalid amounts', () => {
  for (const value of [-1, NaN, Infinity, '8500', 1e13]) {
    assert.throws(() => manualProvider.getValues({}, { expectedSaleValue: value }));
  }
});
