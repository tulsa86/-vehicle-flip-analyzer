'use strict';
const form = document.getElementById('deal-form');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const resultIds = ['profit', 'conservative-profit', 'invested', 'roi', 'break-even', 'max-purchase'];
const el = id => document.getElementById(id);
function update() {
  const vehicle = ['year', 'make', 'model', 'trim'].map(key => form.elements[key].value.trim()).filter(Boolean).join(' ');
  el('vehicle-name').textContent = vehicle || 'Your vehicle';
  const mileage = form.elements.mileage;
  el('vehicle-mileage').textContent = mileage.value && mileage.validity.valid ? `${Number(mileage.value).toLocaleString('en-US')} miles` : 'Vehicle details are optional.';
  const invalid = [...form.elements].find(input => ['INPUT', 'SELECT'].includes(input.tagName) && !input.validity.valid);
  for (const input of form.querySelectorAll('input, select')) {
    input.setAttribute('aria-invalid', String(!input.validity.valid && input.value !== ''));
  }
  if (invalid) {
    resultIds.forEach(id => el(id).textContent = '—');
    el('badge').textContent = 'Awaiting inputs';
    el('badge').className = 'badge neutral';
    el('status').textContent = invalid.value === '' ? 'Enter cash costs, both sale values, and targets to see your analysis. Use 0 for costs that do not apply.' : 'Check your inputs: costs and targets must be nonnegative; year and mileage must be valid whole numbers, and ZIP code must have five digits.';
    el('limit-note').textContent = 'Your buying limit for the target profit.';
    el('profit').className = '';
    el('conservative-profit').className = '';
    return;
  }
  const values = {};
  ['purchase', 'fees', 'transport', 'repairs', 'misc', 'target', 'minRoi'].forEach(key => values[key] = Number(form.elements[key].value));
  const vehicleDetails = {};
  ['year', 'make', 'model', 'mileage', 'vin', 'trim', 'zip', 'condition'].forEach(key => vehicleDetails[key] = form.elements[key].value.trim());
  const manualValues = {};
  ['marketValue', 'conservativeSaleValue', 'expectedSaleValue'].forEach(key => {
    manualValues[key] = form.elements[key].value === '' ? null : Number(form.elements[key].value);
  });
  const valuation = VehicleValuation.manualProvider.getValues(vehicleDetails, manualValues);
  const result = VehicleCalculator.calculate({ ...values, ...valuation });
  el('conservative-profit').textContent = money.format(result.conservativeProfit);
  el('conservative-profit').className = result.conservativeProfit > 0 ? 'buy-text' : result.conservativeProfit < 0 ? 'pass-text' : '';
  el('profit').textContent = money.format(result.profit);
  el('profit').className = result.profit > 0 ? 'buy-text' : result.profit < 0 ? 'pass-text' : '';
  el('invested').textContent = money.format(result.invested);
  el('roi').textContent = result.roi === null ? 'N/A' : `${result.roi.toFixed(1)}%`;
  el('break-even').textContent = money.format(result.breakEven);
  el('max-purchase').textContent = result.maxPurchase < 0 ? 'Not achievable' : money.format(result.maxPurchase);
  el('limit-note').textContent = result.maxPurchase < 0 ? `Even a free vehicle falls ${money.format(-result.maxPurchase)} short of your profit target.` : `Expected Sale Value minus other cash costs minus ${money.format(values.target)} target profit. This limit does not enforce your ROI target.`;
  el('badge').textContent = result.assessment;
  el('badge').className = `badge ${result.assessment.toLowerCase()}`;
  el('status').textContent = result.assessment === 'Buy' ? 'The expected sale estimate meets both of your deal targets.' : result.assessment === 'Pass' ? 'The expected sale estimate leaves no positive cash profit.' : 'There is a cash profit, but the deal does not meet both targets.';
  if (result.roi === null) el('status').textContent += ' ROI is undefined with zero cash invested.';
}
form.addEventListener('input', update);
form.addEventListener('change', update);
form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('reset', () => setTimeout(update, 0));
el('example').addEventListener('click', () => {
  const sample = { year: 2015, make: 'Toyota', model: 'Camry', mileage: 120000, purchase: 4500, fees: 450, transport: 250, repairs: 800, misc: 200, marketValue: 9000, conservativeSaleValue: 7500, expectedSaleValue: 8500, vin: '', trim: 'SE', zip: '12345', condition: 'Good', target: 2000, minRoi: 20 };
  Object.entries(sample).forEach(([key, value]) => form.elements[key].value = value);
  update();
});
update();
