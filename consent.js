(function () {
  'use strict';

  var KEY = 'cookies_accepted';

  function hasConsent() {
    return localStorage.getItem(KEY) === '1';
  }

  function loadGA() {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-FTQJEP46KB');
    gtag('config', 'G-3DEPP15SG9');
    gtag('config', 'AW-18139104816');
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-FTQJEP46KB';
    document.head.appendChild(s);
  }

  function loadAdSense() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6420854482230679';
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }

  function loadAll() {
    loadGA();
    loadAdSense();
  }

  // Laad direct als eerder toestemming gegeven
  if (hasConsent()) {
    loadAll();
  }

  // Toon cookiebanner als nog geen keuze gemaakt
  document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('cookie-banner');
    if (banner && !localStorage.getItem(KEY)) {
      banner.style.display = 'block';
    }
  });

  // Knoppen in de cookiebanner
  window.acceptCookies = function () {
    localStorage.setItem(KEY, '1');
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
    loadAll();
  };

  window.declineCookies = function () {
    localStorage.setItem(KEY, '0');
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
  };
})();
