'use strict';
const form = document.getElementById('deal-form');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const resultIds = ['profit', 'invested', 'roi', 'break-even', 'max-purchase'];
const el = id => document.getElementById(id);
function update() {
  const vehicle = ['year', 'make', 'model'].map(key => form.elements[key].value.trim()).filter(Boolean).join(' ');
  el('vehicle-name').textContent = vehicle || 'Your vehicle';
  const mileage = form.elements.mileage;
  el('vehicle-mileage').textContent = mileage.value && mileage.validity.valid ? `${Number(mileage.value).toLocaleString('en-US')} miles` : 'Vehicle details are optional.';
  const invalid = [...form.elements].find(input => input.tagName === 'INPUT' && !input.validity.valid);
  for (const input of form.querySelectorAll('input')) {
    input.setAttribute('aria-invalid', String(!input.validity.valid && input.value !== ''));
  }
  if (invalid) {
    resultIds.forEach(id => el(id).textContent = '—');
    el('badge').textContent = 'Awaiting inputs';
    el('badge').className = 'badge neutral';
    el('status').textContent = invalid.value === '' ? 'Enter all cash amounts and targets to see your analysis. Use 0 for costs that do not apply.' : 'Check your inputs: costs and targets must be nonnegative; year and mileage must be valid whole numbers.';
    el('limit-note').textContent = 'Your buying limit for the target profit.';
    el('profit').className = '';
    return;
  }
  const values = {};
  ['purchase', 'fees', 'transport', 'repairs', 'misc', 'resale', 'target', 'minRoi'].forEach(key => values[key] = Number(form.elements[key].value));
  const result = VehicleCalculator.calculate(values);
  el('profit').textContent = money.format(result.profit);
  el('profit').className = result.profit > 0 ? 'buy-text' : result.profit < 0 ? 'pass-text' : '';
  el('invested').textContent = money.format(result.invested);
  el('roi').textContent = result.roi === null ? 'N/A' : `${result.roi.toFixed(1)}%`;
  el('break-even').textContent = money.format(result.breakEven);
  el('max-purchase').textContent = result.maxPurchase < 0 ? 'Not achievable' : money.format(result.maxPurchase);
  el('limit-note').textContent = result.maxPurchase < 0 ? `Even a free vehicle falls ${money.format(-result.maxPurchase)} short of your profit target.` : `Resale minus other cash costs minus ${money.format(values.target)} target profit. This limit does not enforce your ROI target.`;
  el('badge').textContent = result.assessment;
  el('badge').className = `badge ${result.assessment.toLowerCase()}`;
  el('status').textContent = result.assessment === 'Buy' ? 'This estimate meets both of your deal targets.' : result.assessment === 'Pass' ? 'This estimate leaves no positive cash profit.' : 'There is a cash profit, but the deal does not meet both targets.';
  if (result.roi === null) el('status').textContent += ' ROI is undefined with zero cash invested.';
}
form.addEventListener('input', update);
form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('reset', () => setTimeout(update, 0));
el('example').addEventListener('click', () => {
  const sample = { year: 2015, make: 'Toyota', model: 'Camry', mileage: 120000, purchase: 4500, fees: 450, transport: 250, repairs: 800, misc: 200, resale: 8500, target: 2000, minRoi: 20 };
  Object.entries(sample).forEach(([key, value]) => form.elements[key].value = value);
  update();
});
update();
