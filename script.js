'use strict';

var salaryType = 'monthly';
var CIRCUMFERENCE = 2 * Math.PI * 30;
var els;
var animVals = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;
var resultVisible = false;

function setSalaryType(type) {
    salaryType = type;
    els.btnMonthly.classList.toggle('active', type === 'monthly');
    els.btnAnnual.classList.toggle('active', type === 'annual');
    els.salaryLabel.textContent = type === 'monthly' ? 'Jouw bruto maandsalaris' : 'Jouw bruto jaarsalaris';
    if (resultVisible) calculate();
}

function stepSalary(step) {
    els.salary.value = Math.max(0, (parseFloat(els.salary.value) || 0) + step);
    if (resultVisible) calculate();
}

function calculateFromButton() {
    resultVisible = true;
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

function animateTo(el, target, fmtFn) {
    var start = (animVals && animVals.has(el)) ? animVals.get(el) : 0;
    if (el._raf) cancelAnimationFrame(el._raf);
    var t0 = null;
    var dur = 480;
    function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        var val = start + (target - start) * ease;
        el.textContent = fmtFn(val);
        if (animVals) animVals.set(el, val);
        if (p < 1) {
            el._raf = requestAnimationFrame(step);
        } else {
            if (animVals) animVals.set(el, target);
            el.textContent = fmtFn(target);
        }
    }
    el._raf = requestAnimationFrame(step);
}

function updateDonut(netPct) {
    var filled = CIRCUMFERENCE * (netPct / 100);
    els.donutFill.setAttribute('stroke-dasharray', filled + ' ' + (CIRCUMFERENCE - filled));
}

function setDisplay(grossAnnual, grossVak, taxRate, taxAmount, netVak, netPct, taxPct) {
    animateTo(els.grossAnnual,           grossAnnual, fmt);
    animateTo(els.grossVakantiegeld,     grossVak,    fmt);
    animateTo(els.taxAmount,             taxAmount,   function(v) { return '− ' + fmt(v); });
    animateTo(els.netVakantiegeld,       netVak,      fmt);
    animateTo(els.netVakantiegeld2Strong, netVak,     fmt);
    els.taxRateLabel.textContent = (taxRate * 100).toFixed(2).replace('.', ',');
    els.donutPct.textContent     = netPct + '%';
    els.pctNet.textContent       = netPct + '%';
    els.pctTax.textContent       = taxPct + '%';
    updateDonut(netPct);
}

function calculate() {
    var input = parseFloat(els.salary.value);
    var resultsCard = document.getElementById('results-card');
    if (!input) {
        setDisplay(0, 0, 0, 0, 0, 0, 0);
        highlightBracket(0);
        if (resultsCard) resultsCard.style.display = 'none';
        return;
    }
    var grossAnnual = salaryType === 'monthly' ? input * 12 : input;
    var grossVak    = grossAnnual * 0.08;
    var taxRate     = getTaxRate(grossAnnual);
    var taxAmount   = grossVak * taxRate;
    var netVak      = grossVak - taxAmount;
    var netPct      = Math.round((netVak / grossVak) * 100);
    setDisplay(grossAnnual, grossVak, taxRate, taxAmount, netVak, netPct, 100 - netPct);
    highlightBracket(grossAnnual);
    if (resultsCard) resultsCard.style.display = 'block';
}

function highlightBracket(grossAnnual) {
    var rows = document.querySelectorAll('.rates-table tbody tr');
    if (!rows.length) return;
    rows.forEach(function(r) { r.classList.remove('active-bracket'); });
    if (!grossAnnual) return;
    var i = 3;
    if (grossAnnual <= 22660)      i = 0;
    else if (grossAnnual <= 38441) i = 1;
    else if (grossAnnual <= 76817) i = 2;
    rows[i].classList.add('active-bracket');
}

function toggleFaq(btn) {
    var item = btn.parentElement;
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function(el) { el.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
}


document.addEventListener('DOMContentLoaded', function () {
    els = {
        salary:                 document.getElementById('salary'),
        btnMonthly:             document.getElementById('btn-monthly'),
        btnAnnual:              document.getElementById('btn-annual'),
        salaryLabel:            document.getElementById('salary-label'),
        grossAnnual:            document.getElementById('grossAnnual'),
        grossVakantiegeld:      document.getElementById('grossVakantiegeld'),
        taxRateLabel:           document.getElementById('taxRateLabel'),
        taxAmount:              document.getElementById('taxAmount'),
        netVakantiegeld:        document.getElementById('netVakantiegeld'),
        netVakantiegeld2Strong: document.querySelector('#netVakantiegeld2 strong'),
        donutPct:               document.getElementById('donut-pct'),
        pctNet:                 document.getElementById('pct-net'),
        pctTax:                 document.getElementById('pct-tax'),
        donutFill:              document.getElementById('donut-fill'),
        cookieBanner:           document.getElementById('cookie-banner'),
    };


    els.salary.value = 3500;
    calculate();

    els.salary.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') calculateFromButton();
    });

    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (typeof IntersectionObserver !== 'undefined') {
        var revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    revealObserver.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });
    } else {
        document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('visible'); });
    }
});
