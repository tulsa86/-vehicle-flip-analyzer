(function (root) {
  'use strict';
  function calculate(values) {
    const fields = ['purchase', 'fees', 'transport', 'repairs', 'misc', 'resale', 'target', 'minRoi'];
    for (const key of fields) {
      if (!Number.isFinite(values[key]) || values[key] < 0 || values[key] > 1e12) {
        throw new Error('Enter valid, nonnegative amounts (up to 1 trillion).');
      }
    }
    // Work in cents so ordinary currency inputs do not accumulate floating-point error.
    const cents = key => Math.round(values[key] * 100);
    const otherCosts = ['fees', 'transport', 'repairs', 'misc'].reduce((sum, key) => sum + cents(key), 0);
    const invested = cents('purchase') + otherCosts;
    const profit = cents('resale') - invested;
    const roi = invested > 0 ? profit / invested * 100 : null;
    const maxPurchase = cents('resale') - otherCosts - cents('target');
    let assessment = 'Pass';
    if (profit > 0) {
      assessment = profit >= cents('target') && roi !== null && roi >= values.minRoi ? 'Buy' : 'Maybe';
    }
    return { invested: invested / 100, profit: profit / 100, roi, breakEven: invested / 100,
      maxPurchase: maxPurchase / 100, otherCosts: otherCosts / 100, assessment };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  else root.VehicleCalculator = { calculate };
})(typeof globalThis !== 'undefined' ? globalThis : this);
