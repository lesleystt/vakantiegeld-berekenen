'use strict';

var salaryType = 'monthly';
var CIRCUMFERENCE = 2 * Math.PI * 30;
var els;

function setSalaryType(type) {
    salaryType = type;
    els.btnMonthly.classList.toggle('active', type === 'monthly');
    els.btnAnnual.classList.toggle('active', type === 'annual');
    els.salaryLabel.textContent = type === 'monthly' ? 'Jouw bruto maandsalaris' : 'Jouw bruto jaarsalaris';
    calculate();
}

function stepSalary(step) {
    els.salary.value = Math.max(0, (parseFloat(els.salary.value) || 0) + step);
    calculate();
}

function getTaxRate(grossAnnual) {
    if (grossAnnual <= 10000)  return 0.0000;
    if (grossAnnual <= 22660)  return 0.3288;
    if (grossAnnual <= 38441)  return 0.3582;
    if (grossAnnual <= 76817)  return 0.3748;
    return 0.4950;
}

function fmt(amount) {
    return '€ ' + amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateDonut(netPct) {
    var filled = CIRCUMFERENCE * (netPct / 100);
    els.donutFill.setAttribute('stroke-dasharray', filled + ' ' + (CIRCUMFERENCE - filled));
}

function setDisplay(grossAnnual, grossVak, taxRate, taxAmount, netVak, netPct, taxPct) {
    var netFmt = fmt(netVak);
    els.grossAnnual.textContent          = fmt(grossAnnual);
    els.grossVakantiegeld.textContent     = fmt(grossVak);
    els.taxRateLabel.textContent          = (taxRate * 100).toFixed(2).replace('.', ',');
    els.taxAmount.textContent             = '− ' + fmt(taxAmount);
    els.netVakantiegeld.textContent       = netFmt;
    els.netVakantiegeld2Strong.textContent = netFmt;
    els.donutPct.textContent              = netPct + '%';
    els.pctNet.textContent                = netPct + '%';
    els.pctTax.textContent                = taxPct + '%';
    updateDonut(netPct);
}

function calculate() {
    var input = parseFloat(els.salary.value);
    if (!input) {
        setDisplay(0, 0, 0, 0, 0, 0, 0);
        return;
    }
    var grossAnnual = salaryType === 'monthly' ? input * 12 : input;
    var grossVak    = grossAnnual * 0.08;
    var taxRate     = getTaxRate(grossAnnual);
    var taxAmount   = grossVak * taxRate;
    var netVak      = grossVak - taxAmount;
    var netPct      = Math.round((netVak / grossVak) * 100);
    setDisplay(grossAnnual, grossVak, taxRate, taxAmount, netVak, netPct, 100 - netPct);
}

function acceptCookies() {
    localStorage.setItem('cookies_accepted', '1');
    els.cookieBanner.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    els = {
        salary:               document.getElementById('salary'),
        btnMonthly:           document.getElementById('btn-monthly'),
        btnAnnual:            document.getElementById('btn-annual'),
        salaryLabel:          document.getElementById('salary-label'),
        grossAnnual:          document.getElementById('grossAnnual'),
        grossVakantiegeld:    document.getElementById('grossVakantiegeld'),
        taxRateLabel:         document.getElementById('taxRateLabel'),
        taxAmount:            document.getElementById('taxAmount'),
        netVakantiegeld:      document.getElementById('netVakantiegeld'),
        netVakantiegeld2Strong: document.querySelector('#netVakantiegeld2 strong'),
        donutPct:             document.getElementById('donut-pct'),
        pctNet:               document.getElementById('pct-net'),
        pctTax:               document.getElementById('pct-tax'),
        donutFill:            document.getElementById('donut-fill'),
        cookieBanner:         document.getElementById('cookie-banner'),
    };

    if (!localStorage.getItem('cookies_accepted')) {
        els.cookieBanner.style.display = 'block';
    }

    els.salary.addEventListener('input', calculate);
});
