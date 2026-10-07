const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('./calculator.js');
const example = { purchase: 4500, fees: 450, transport: 250, repairs: 800, misc: 200, resale: 8500, target: 2000, minRoi: 20 };
test('example costs, profit, ROI, break-even and buying limit', () => {
  const r = calculate(example);
  assert.equal(r.invested, 6200); assert.equal(r.profit, 2300);
  assert.equal(r.roi, 2300 / 6200 * 100); assert.equal(r.breakEven, 6200);
  assert.equal(r.maxPurchase, 4800); assert.equal(r.assessment, 'Buy');
  assert.equal(calculate({ ...example, purchase: r.maxPurchase }).profit, example.target);
});
test('target and ROI thresholds independently downgrade positive deals', () => {
  assert.equal(calculate({ ...example, target: 2500 }).assessment, 'Maybe');
  assert.equal(calculate({ ...example, minRoi: 40 }).assessment, 'Maybe');
  assert.equal(calculate({ ...example, resale: 6200 }).assessment, 'Pass');
  assert.equal(calculate({ ...example, resale: 6100 }).assessment, 'Pass');
});
test('zero investment has undefined ROI and cannot earn Buy', () => {
  const r = calculate({ purchase: 0, fees: 0, transport: 0, repairs: 0, misc: 0, resale: 100, target: 50, minRoi: 0 });
  assert.equal(r.roi, null); assert.equal(r.assessment, 'Maybe');
});
test('impossible target retains a negative buying limit', () => {
  assert.equal(calculate({ ...example, target: 10000 }).maxPurchase, -3200);
});
test('currency arithmetic uses cents; exact thresholds qualify', () => {
  const r = calculate({ purchase: 0.1, fees: 0.2, transport: 0, repairs: 0, misc: 0, resale: 0.6, target: 0.3, minRoi: 100 });
  assert.equal(r.invested, 0.3); assert.equal(r.profit, 0.3); assert.equal(r.assessment, 'Buy');
});
test('invalid cash inputs are rejected', () => {
  for (const purchase of [-1, NaN, Infinity, 1e13]) assert.throws(() => calculate({ ...example, purchase }));
});
test('two sale profits share the same cash investment, with cent precision', () => {
  const r = calculate({ ...example, conservativeSaleValue: 6000.01, expectedSaleValue: 8500.02 });
  assert.equal(r.conservativeProfit, -199.99); assert.equal(r.expectedProfit, 2300.02);
  assert.equal(r.profit, r.expectedProfit); assert.equal(r.assessment, 'Buy');
  assert.equal(r.maxPurchase, 4800.02); assert.equal(r.breakEven, 6200);
});
test('market value and vehicle details never add labor or change financial results', () => {
  const base = { ...example, conservativeSaleValue: 7500, expectedSaleValue: 8500 };
  assert.deepEqual(calculate(base), calculate({ ...base, marketValue: 50000, condition: 'Poor', labor: 9000 }));
});
test('zero expected sale overrides legacy resale and conservative sale can break even', () => {
  const r = calculate({ ...example, expectedSaleValue: 0, conservativeSaleValue: 6200 });
  assert.equal(r.expectedProfit, -6200); assert.equal(r.conservativeProfit, 0);
  assert.equal(r.assessment, 'Pass');
});
test('invalid new valuation inputs are rejected', () => {
  for (const key of ['expectedSaleValue', 'conservativeSaleValue', 'marketValue']) {
    for (const value of [-1, NaN, Infinity, 1e13]) assert.throws(() => calculate({ ...example, [key]: value }));
  }
});
test('both sale scenarios handle zero investment and conservative changes leave expected metrics intact', () => {
  const values = { purchase: 0, fees: 0, transport: 0, repairs: 0, misc: 0, expectedSaleValue: 100, conservativeSaleValue: 50, target: 50, minRoi: 0 };
  const r = calculate(values);
  assert.equal(r.expectedProfit, 100); assert.equal(r.conservativeProfit, 50);
  assert.equal(r.roi, null); assert.equal(r.breakEven, 0); assert.equal(r.assessment, 'Maybe');
  const changed = calculate({ ...values, conservativeSaleValue: 0 });
  assert.deepEqual({ ...changed, conservativeProfit: r.conservativeProfit }, r);
});
