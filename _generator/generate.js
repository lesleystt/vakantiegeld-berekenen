'use strict';
const fs   = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..');

// ── Belastingberekening 2026 ─────────────────────────────────────────────
function getTaxRate(annual) {
    if (annual <= 10000)  return 0.0000;
    if (annual <= 22660)  return 0.3288;
    if (annual <= 38441)  return 0.3582;
    if (annual <= 76817)  return 0.3748;
    return 0.4950;
}
function calc(monthly) {
    const annual   = monthly * 12;
    const gross    = annual * 0.08;
    const rate     = getTaxRate(annual);
    const tax      = gross * rate;
    const net      = gross - tax;
    const netPct   = Math.round((net / gross) * 100);
    const monthly_gross = gross / 12;
    const monthly_net   = net   / 12;
    return { annual, gross, rate, tax, net, netPct, monthly_gross, monthly_net };
}
const nl2  = n => n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nl0  = n => n.toLocaleString('nl-NL', { minimumFractionDigits: 0,  maximumFractionDigits: 0  });
const pct  = r => (r * 100).toFixed(2).replace('.', ',') + '%';

// ── Alle salarissen ───────────────────────────────────────────────────────
const ALL = [
    1500, 1600, 1700, 1800, 1900,
    2000, 2100, 2200, 2300, 2400, 2500,
    2600, 2700, 2800, 2900, 3000,
    3100, 3200, 3300, 3400, 3500,
    3600, 3700, 3800, 3900, 4000,
    4200, 4500, 5000, 5500, 6000,
    6500, 7000, 7500, 8000, 9000, 10000
];

// Sla bestaande handgeschreven pagina's over
const SKIP = new Set([2500, 3000, 3500, 4500, 6000]);

function related(salary) {
    const i = ALL.indexOf(salary);
    const res = [];
    for (let j = Math.max(0, i - 2); j <= Math.min(ALL.length - 1, i + 2); j++) {
        if (ALL[j] !== salary) res.push(ALL[j]);
    }
    return res.slice(0, 4);
}

function taxLabel(annual) {
    if (annual <= 10000)  return '0%';
    if (annual <= 22660)  return '32,88%';
    if (annual <= 38441)  return '35,82%';
    if (annual <= 76817)  return '37,48%';
    return '49,50%';
}
function taxRange(annual) {
    if (annual <= 10000)  return 'tot € 10.000';
    if (annual <= 22660)  return '€ 10.001 – € 22.660';
    if (annual <= 38441)  return '€ 22.661 – € 38.441';
    if (annual <= 76817)  return '€ 38.442 – € 76.817';
    return 'boven € 76.817';
}
function modalText(s) {
    if (s < 3500)  return `€ ${nl0(3500 - s)} onder modaal (€ 3.500/mnd)`;
    if (s === 3500) return 'gelijk aan modaal (€ 3.500/mnd)';
    return `€ ${nl0(s - 3500)} boven modaal (€ 3.500/mnd)`;
}
function incomeLevel(s) {
    if (s <  2000) return 'een laag inkomen';
    if (s <  3500) return 'een beneden-modaal inkomen';
    if (s === 3500) return 'het modale inkomen';
    if (s <  5000) return 'een bovenmodaal inkomen';
    if (s < 8000)  return 'een hoog inkomen';
    return 'een topinkomen';
}

// ── HTML template ─────────────────────────────────────────────────────────
function page(salary) {
    const c   = calc(salary);
    const rel = related(salary);
    const s   = nl0(salary);
    const relRows = ALL
        .filter(x => x !== salary)
        .filter((_, i, a) => {
            const idx = ALL.indexOf(salary);
            return Math.abs(ALL.indexOf(ALL.filter(x => x !== salary)[i]) - idx) <= 3;
        })
        .slice(0, 5);

    const compTable = rel.map(r => {
        const rc = calc(r);
        return `            <tr${r === salary ? ' class="highlight-row"' : ''}><td>€ ${nl0(r)}</td><td>€ ${nl2(rc.gross)}</td><td>± € ${nl2(rc.net)}</td></tr>`;
    }).join('\n');

    const relLinks = rel.map(r =>
        `            <a href="vakantiegeld-${r}-bruto.html">Vakantiegeld bij € ${nl0(r)} bruto per maand</a>`
    ).join('\n');

    return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#7c3aed">
    <title>Vakantiegeld € ${s} bruto per maand — netto € ${nl2(c.net)} (2026) | VakantiegeldBerekening.nl</title>
    <meta name="description" content="Bij een bruto maandsalaris van € ${s} ontvang je € ${nl2(c.gross)} bruto vakantiegeld. Na loonheffing van ${taxLabel(c.annual)} houd je ± € ${nl2(c.net)} netto over. Volledige berekening 2026.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://vakantiegeldberekening.nl/vakantiegeld-${salary}-bruto.html">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <meta property="og:title" content="Vakantiegeld € ${s} bruto — netto € ${nl2(c.net)} (2026)">
    <meta property="og:description" content="Bij € ${s} bruto per maand ontvang je ± € ${nl2(c.net)} netto vakantiegeld in 2026.">
    <meta property="og:url" content="https://vakantiegeldberekening.nl/vakantiegeld-${salary}-bruto.html">
    <meta property="og:type" content="article">
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="dns-prefetch" href="//pagead2.googlesyndication.com">
    <link rel="dns-prefetch" href="//www.googletagmanager.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-FTQJEP46KB"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FTQJEP46KB');</script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6420854482230679" crossorigin="anonymous"></script>
    <script type="application/ld+json">
    {"@context":"https://schema.org","@graph":[
      {"@type":"Article","headline":"Vakantiegeld bij € ${s} bruto per maand (2026)","description":"Bij een bruto maandsalaris van € ${s} ontvang je ± € ${nl2(c.net)} netto vakantiegeld in 2026.","url":"https://vakantiegeldberekening.nl/vakantiegeld-${salary}-bruto.html","datePublished":"2026-05-04","dateModified":"2026-05-04","inLanguage":"nl-NL","publisher":{"@id":"https://vakantiegeldberekening.nl/#organization"}},
      {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://vakantiegeldberekening.nl/"},{"@type":"ListItem","position":2,"name":"Vakantiegeld € ${s} bruto","item":"https://vakantiegeldberekening.nl/vakantiegeld-${salary}-bruto.html"}]}
    ]}
    </script>
</head>
<body>

<nav class="navbar">
    <div class="nav-container">
        <a href="/" class="nav-logo" style="text-decoration:none">
            <div class="logo-text">
                <span class="logo-main">Vakantiegeld</span>
                <span class="logo-nl">Berekening.nl</span>
            </div>
        </a>
        <div class="nav-links">
            <a href="/">Calculator</a>
            <a href="/#faq">FAQ</a>
            <a href="over-ons.html">Over ons</a>
            <a href="contact.html">Contact</a>
        </div>
    </div>
</nav>

<div class="article-header">
    <div class="article-header-inner">
        <div class="article-breadcrumb"><a href="/">← Terug naar calculator</a></div>
        <h1>Vakantiegeld bij € ${s} bruto per maand (2026)</h1>
        <p>Met ${incomeLevel(salary)} van € ${s} bruto per maand ontvang je € ${nl2(c.gross)} bruto vakantiegeld. Na loonheffing houd je <strong>± € ${nl2(c.net)}</strong> netto over — dat is ${modalText(salary)}.</p>
    </div>
</div>

<div class="article-body">

    <div class="example-box">
        <p>📊 <strong>Directe berekening — € ${s} bruto/maand:</strong><br>
        Bruto jaarsalaris: € ${nl0(c.annual)}<br>
        Bruto vakantiegeld (8%): € ${nl2(c.gross)}<br>
        Loonheffing bijzondere beloningen: ${taxLabel(c.annual)}<br>
        Af: loonheffing − € ${nl2(c.tax)}<br>
        <strong>Netto vakantiegeld: ± € ${nl2(c.net)}</strong></p>
    </div>

    <h2>Berekening vakantiegeld bij € ${s} bruto (2026)</h2>
    <p>Bij ${incomeLevel(salary)} van € ${s} bruto per maand is je bruto jaarsalaris € ${nl0(c.annual)}. Hierover bouw je jaarlijks <strong>€ ${nl2(c.gross)} bruto vakantiegeld</strong> op (8% van het jaarsalaris, wettelijk verplicht).</p>

    <table class="article-table">
        <thead><tr><th>Component</th><th>Bedrag</th></tr></thead>
        <tbody>
            <tr><td>Bruto maandsalaris</td><td>€ ${s}</td></tr>
            <tr><td>Bruto jaarsalaris (× 12)</td><td>€ ${nl0(c.annual)}</td></tr>
            <tr><td>Bruto vakantiegeld (8%)</td><td>€ ${nl2(c.gross)}</td></tr>
            <tr><td>Loonheffing tarief</td><td>${taxLabel(c.annual)}</td></tr>
            <tr><td>Loonheffing (af)</td><td>− € ${nl2(c.tax)}</td></tr>
            <tr><td><strong>Netto vakantiegeld</strong></td><td><strong>± € ${nl2(c.net)}</strong></td></tr>
        </tbody>
    </table>

    <h2>Welk belastingtarief geldt bij € ${s} bruto per maand?</h2>
    <p>Bij een bruto jaarsalaris van € ${nl0(c.annual)} valt je vakantiegeld in de schijf van <strong>${taxLabel(c.annual)}</strong> van de tabel bijzondere beloningen 2026. Deze schijf geldt voor jaarsalarissen van ${taxRange(c.annual)}.</p>

    <div class="info-box">
        <p>💡 <strong>Let op:</strong> De tabel bijzondere beloningen geldt specifiek voor vakantiegeld en andere eenmalige uitkeringen. Het tarief verschilt van je normale maandelijkse loonheffing.</p>
    </div>

    <h2>Maandelijkse opbouw vakantiegeld</h2>
    <p>Elk gewerkte maand bouw je een deel van je vakantiegeld op. Bij € ${s} bruto per maand bouw je iedere maand <strong>€ ${nl2(c.monthly_gross)} bruto</strong> vakantiegeld op — dat is netto circa <strong>€ ${nl2(c.monthly_net)}</strong> per maand.</p>

    <div class="example-box">
        <p>📅 <strong>Per maand opgebouwd:</strong> € ${nl2(c.monthly_gross)} bruto / ± € ${nl2(c.monthly_net)} netto<br>
        Uitbetaald in mei 2026: ± € ${nl2(c.net)} in één keer</p>
    </div>

    <h2>Wanneer wordt het uitbetaald?</h2>
    <p>De meeste werkgevers betalen vakantiegeld uit in <strong>mei</strong>, samen met het salaris van die maand. In mei 2026 ontvang je bij € ${s} bruto per maand eenmalig ± € ${nl2(c.net)} netto extra op je rekening — bovenop je reguliere salaris.</p>

    <div class="article-cta">
        <h3>Bereken jouw exacte netto vakantiegeld</h3>
        <p>Vul je eigen salaris in voor een nauwkeurige berekening op basis van de officiële tarieven 2026.</p>
        <a href="/" class="cta-btn">Gebruik de gratis calculator →</a>
    </div>

    <h2>Vergelijking met andere salarissen</h2>
    <table class="article-table">
        <thead><tr><th>Bruto maandsalaris</th><th>Bruto vakantiegeld</th><th>Netto vakantiegeld</th></tr></thead>
        <tbody>
${rel.map(r => {
    const rc = calc(r);
    return `            <tr><td>€ ${nl0(r)}</td><td>€ ${nl2(rc.gross)}</td><td>± € ${nl2(rc.net)}</td></tr>`;
}).join('\n')}
            <tr class="highlight-row"><td><strong>€ ${s} (jouw salaris)</strong></td><td>€ ${nl2(c.gross)}</td><td>± € ${nl2(c.net)}</td></tr>
        </tbody>
    </table>

    <div class="related-articles">
        <h3>Meer salarissen berekenen</h3>
        <div class="related-links">
${relLinks}
            <a href="vakantiegeld-2026.html">Vakantiegeld 2026: tarieven en uitbetaling</a>
            <a href="/">Bereken jouw netto vakantiegeld</a>
        </div>
    </div>

</div>

<div class="ad-zone">
    <div class="ad-inner">
        <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6420854482230679" data-ad-format="auto" data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
</div>

<footer>
    <div class="footer-container">
        <div class="footer-logo"><strong>VakantiegeldBerekening.nl</strong></div>
        <p class="footer-links">
            <a href="over-ons.html">Over ons</a> &nbsp;·&nbsp;
            <a href="contact.html">Contact</a> &nbsp;·&nbsp;
            <a href="wat-is-vakantiegeld.html">Wat is vakantiegeld?</a> &nbsp;·&nbsp;
            <a href="vakantiegeld-2026.html">Vakantiegeld 2026</a>
        </p>
        <p class="footer-links">
            <a href="vakantiegeld-parttime.html">Parttime</a> &nbsp;·&nbsp;
            <a href="vakantiegeld-ontslag.html">Bij ontslag</a> &nbsp;·&nbsp;
            <a href="privacyverklaring.html">Privacyverklaring</a> &nbsp;·&nbsp;
            <a href="cookies.html">Cookiebeleid</a>
        </p>
        <p class="footer-disclaimer">De berekeningen zijn indicatief en gebaseerd op de tabel bijzondere beloningen 2026. Aan de berekeningen kunnen geen rechten worden ontleend.</p>
        <p class="footer-copy">© 2026 VakantiegeldBerekening.nl</p>
    </div>
</footer>

</body>
</html>`;
}

// ── Genereer alle salaris-pagina's ────────────────────────────────────────
let generated = 0;
let skipped   = 0;

for (const salary of ALL) {
    const file = path.join(OUT, `vakantiegeld-${salary}-bruto.html`);
    if (SKIP.has(salary)) {
        console.log(`SKIP  vakantiegeld-${salary}-bruto.html (bestaande handgeschreven pagina)`);
        skipped++;
        continue;
    }
    fs.writeFileSync(file, page(salary), 'utf8');
    console.log(`GEN   vakantiegeld-${salary}-bruto.html  →  netto € ${calc(salary).net.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2})}`);
    generated++;
}

console.log(`\n✓ ${generated} pagina's gegenereerd, ${skipped} overgeslagen.`);

// ── Update sitemap.xml ────────────────────────────────────────────────────
const sitemapPath = path.join(OUT, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

// Voeg ontbrekende salaris-pagina's toe voor het </urlset> tag
const newUrls = ALL.filter(s => !SKIP.has(s)).map(s => `
  <url>
    <loc>https://vakantiegeldberekening.nl/vakantiegeld-${s}-bruto.html</loc>
    <lastmod>2026-05-04</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

// Verwijder eventueel bestaande gegenereerde entries en voeg ze opnieuw toe
const marker = '  <!-- GENERATED-SALARY-PAGES -->';
if (sitemap.includes(marker)) {
    // Vervang het blok tussen markers
    sitemap = sitemap.replace(/  <!-- GENERATED-SALARY-PAGES -->[\s\S]*?<!-- END-GENERATED -->/, marker + newUrls + '\n  <!-- END-GENERATED -->');
} else {
    sitemap = sitemap.replace('</urlset>', marker + newUrls + '\n  <!-- END-GENERATED -->\n\n</urlset>');
}

fs.writeFileSync(sitemapPath, sitemap, 'utf8');
console.log('✓ sitemap.xml bijgewerkt');
