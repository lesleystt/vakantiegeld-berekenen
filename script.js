'use strict';

var salaryType = 'monthly';

function setSalaryType(type) {
    salaryType = type;
    document.getElementById('btn-monthly').classList.toggle('active', type === 'monthly');
    document.getElementById('btn-annual').classList.toggle('active', type === 'annual');
    document.getElementById('salary-label').textContent =
        type === 'monthly' ? 'Jouw bruto maandsalaris' : 'Jouw bruto jaarsalaris';
    document.getElementById('salary').placeholder = type === 'monthly' ? '3.500' : '42.000';
    calculate();
}

function stepSalary(step) {
    var input = document.getElementById('salary');
    var val = parseFloat(input.value) || 0;
    val = Math.max(0, val + step);
    input.value = val;
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
    var circumference = 2 * Math.PI * 30; // r=30 → 188.5
    var filled = circumference * (netPct / 100);
    var donut = document.getElementById('donut-fill');
    if (donut) {
        donut.setAttribute('stroke-dasharray', filled + ' ' + (circumference - filled));
    }
}

function setDisplay(grossAnnual, grossVak, taxRate, taxAmount, netVak, netPct, taxPct) {
    document.getElementById('grossAnnual').textContent       = fmt(grossAnnual);
    document.getElementById('grossVakantiegeld').textContent  = fmt(grossVak);
    document.getElementById('taxRateLabel').textContent      = (taxRate * 100).toFixed(2).replace('.', ',');
    document.getElementById('taxAmount').textContent         = '− ' + fmt(taxAmount);
    document.getElementById('netVakantiegeld').textContent   = fmt(netVak);
    document.getElementById('netVakantiegeld2').innerHTML    = '<strong>' + fmt(netVak) + '</strong>';
    document.getElementById('donut-pct').textContent         = netPct + '%';
    document.getElementById('pct-net').textContent           = netPct + '%';
    document.getElementById('pct-tax').textContent           = taxPct + '%';
    updateDonut(netPct);
}

function calculate() {
    var input = parseFloat(document.getElementById('salary').value);

    if (!input || input <= 0) {
        setDisplay(0, 0, 0, 0, 0, 0, 0);
        return;
    }

    var grossAnnual = salaryType === 'monthly' ? input * 12 : input;
    var grossVak    = grossAnnual * 0.08;
    var taxRate     = getTaxRate(grossAnnual);
    var taxAmount   = grossVak * taxRate;
    var netVak      = grossVak - taxAmount;
    var netPct      = Math.round((netVak / grossVak) * 100);
    var taxPct      = 100 - netPct;

    setDisplay(grossAnnual, grossVak, taxRate, taxAmount, netVak, netPct, taxPct);
}

function acceptCookies() {
    localStorage.setItem('cookies_accepted', '1');
    document.getElementById('cookie-banner').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('cookies_accepted')) {
        document.getElementById('cookie-banner').style.display = 'block';
    }
    document.getElementById('salary').addEventListener('input', calculate);
    document.getElementById('salary').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') calculate();
    });
});
