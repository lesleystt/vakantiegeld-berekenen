'use strict';

var salaryType = 'monthly';

function setSalaryType(type) {
    salaryType = type;
    document.getElementById('btn-monthly').classList.toggle('active', type === 'monthly');
    document.getElementById('btn-annual').classList.toggle('active', type === 'annual');
    document.getElementById('salary-label').textContent =
        type === 'monthly' ? 'Bruto maandsalaris (€)' : 'Bruto jaarsalaris (€)';
    document.getElementById('salary').placeholder = type === 'monthly' ? '3.500' : '42.000';
    calculate();
}

// Tabel bijzondere beloningen 2026 (indicatief)
function getTaxRate(grossAnnual) {
    if (grossAnnual <= 10000)  return 0.0000;   // heffingskorting dekt dit
    if (grossAnnual <= 22660)  return 0.3288;
    if (grossAnnual <= 38441)  return 0.3582;
    if (grossAnnual <= 76817)  return 0.3748;
    return 0.4950;
}

function fmt(amount) {
    return '€ ' + amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
    var input = parseFloat(document.getElementById('salary').value);
    if (!input || input <= 0) {
        document.getElementById('results').style.display = 'none';
        return;
    }

    var grossAnnual   = salaryType === 'monthly' ? input * 12 : input;
    var grossVak      = grossAnnual * 0.08;
    var taxRate       = getTaxRate(grossAnnual);
    var taxAmount     = grossVak * taxRate;
    var netVak        = grossVak - taxAmount;

    document.getElementById('grossAnnual').textContent      = fmt(grossAnnual);
    document.getElementById('grossVakantiegeld').textContent = fmt(grossVak);
    document.getElementById('taxRateLabel').textContent     = (taxRate * 100).toFixed(2).replace('.', ',');
    document.getElementById('taxAmount').textContent        = '- ' + fmt(taxAmount);
    document.getElementById('netVakantiegeld').textContent  = fmt(netVak);
    document.getElementById('netVakantiegeld2').innerHTML   = '<strong>' + fmt(netVak) + '</strong>';

    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Cookie consent
function acceptCookies() {
    localStorage.setItem('cookies_accepted', '1');
    document.getElementById('cookie-banner').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('cookies_accepted')) {
        document.getElementById('cookie-banner').style.display = 'block';
    }
    // Bereken live terwijl gebruiker typt
    document.getElementById('salary').addEventListener('input', calculate);
    // Enter key
    document.getElementById('salary').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') calculate();
    });
});
