(function (root) {
  'use strict';
  // Provider boundary: vehicle metadata in, explicit monetary values out.
  // This provider only reads manual inputs; it never infers prices or uses a network.
  const manualProvider = {
    getValues(vehicle, inputs) {
      const values = { source: 'manual' };
      for (const key of ['marketValue', 'conservativeSaleValue', 'expectedSaleValue']) {
        const amount = inputs[key];
        if (amount != null && (!Number.isFinite(amount) || amount < 0 || amount > 1e12)) {
          throw new Error('Enter valid, nonnegative valuation amounts.');
        }
        values[key] = amount ?? null;
      }
      return values;
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = { manualProvider };
  else root.VehicleValuation = { manualProvider };
})(typeof globalThis !== 'undefined' ? globalThis : this);
