/* Widget test pages: loaded synchronously in <head>, before the widget platform script.
 * Query params (see README.md):
 *   id=<uuid>[,<uuid>...]   widget id(s) to embed
 *   place=inline|body|both   inline = header slot (default), body = end of <body> (alias: floating)
 *   lazy=1|0                 force lazy loading on/off. Default: inline = lazy, body = not lazy
 *   ga=G-XXXX                load real gtag.js with this measurement id (otherwise calls are only logged)
 *   gtm=GTM-XXXX             load a real GTM container
 *   analytics=gtag|datalayer|none   which stub to expose when no ga/gtm (default gtag)
 *   nostorage=1              make window.localStorage throw (blocked-storage simulation)
 *   watch=a,b                count network requests whose URL contains any of these substrings
 *   panel=0|min              hide the debug panel / start it collapsed
 *   hl=<code>                /widget/ page only: html lang to set ('none' removes it)
 */
(function () {
  'use strict';
  var P = new URLSearchParams(location.search);
  var T0 = performance.now();
  var Q = window.__qa = { events: [], ga: [], requests: [], errors: [], params: Object.fromEntries(P) };
  function ts() { return ((performance.now() - T0) / 1000).toFixed(2) + 's'; }
  function safe(v) { try { return JSON.parse(JSON.stringify(v, function (k, x) { return x instanceof Node ? '[Node]' : x; })); } catch (e) { return String(v); } }
  function log(kind, name, payload) {
    var e = { t: ts(), kind: kind, name: name, payload: safe(payload) };
    Q.events.push(e);
    try { console.debug('[qa]', kind, name, e.payload); } catch (_) { }
    if (Q._render) Q._render();
    return e;
  }
  Q.log = log;

  /* ---- /widget/ page: html lang override (runs before any widget script) ---- */
  if (document.documentElement.hasAttribute('data-qa-hl') && P.has('hl')) {
    var hl = P.get('hl');
    if (hl === 'none') document.documentElement.removeAttribute('lang'); else document.documentElement.setAttribute('lang', hl);
  }

  /* ---- blocked localStorage simulation ---- */
  if (P.get('nostorage') === '1') {
    try {
      Object.defineProperty(window, 'localStorage', { configurable: true, get: function () { throw new DOMException('localStorage blocked (nostorage=1)', 'SecurityError'); } });
    } catch (e) { }
  }
  function storageDump() {
    var out = {};
    try {
      var ls = window.localStorage;
      for (var i = 0; i < ls.length; i++) { var k = ls.key(i); out[k] = ls.getItem(k); }
    } catch (e) { out['<error>'] = String(e && e.message || e); }
    return out;
  }
  Q.storage = storageDump;

  /* ---- analytics interception (nothing leaves the page unless ga=/gtm= is given) ---- */
  var GA = P.get('ga'), GTM = P.get('gtm'), AMODE = P.get('analytics') || 'gtag';
  window.dataLayer = window.dataLayer || [];
  var dl = window.dataLayer, origPush = dl.push;
  dl.push = function () {
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      var isArgs = a && typeof a === 'object' && typeof a.length === 'number' && !Array.isArray(a);
      var rec = isArgs ? Array.prototype.slice.call(a) : a;
      // skip gtag setup calls
      if (!(isArgs && (rec[0] === 'js' || rec[0] === 'config'))) { Q.ga.push({ t: ts(), via: isArgs ? 'gtag' : 'dataLayer', data: safe(rec) }); log(isArgs ? 'gtag' : 'dataLayer', isArgs ? rec[0] + ':' + rec[1] : (a && a.event) || 'push', rec); }
    }
    return origPush.apply(dl, arguments);
  };
  if (GA || AMODE === 'gtag') {
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
  }
  if (GA) {
    window.gtag('config', GA);
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA); document.head.appendChild(s);
  }
  if (GTM) {
    dl.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM); document.head.appendChild(g);
  }
  if (AMODE === 'none' && !GA && !GTM) { try { delete window.dataLayer; } catch (e) { window.dataLayer = undefined; } }

  /* ---- watched request counter (?watch=substr1,substr2) ---- */
  var WATCH = (P.get('watch') || '').split(',').map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
  Q.watch = WATCH;
  function watched(url) { url = String(url || '').toLowerCase(); return WATCH.some(function (w) { return url.indexOf(w) !== -1; }); }
  if (WATCH.length) {
    try {
      new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (en) {
          if (watched(en.name)) {
            Q.requests.push({ t: (en.startTime / 1000).toFixed(2) + 's', url: en.name.slice(0, 200), type: en.initiatorType, ms: Math.round(en.duration) });
            if (Q._render) Q._render();
          }
        });
      }).observe({ type: 'resource', buffered: true });
    } catch (e) { }
  }

  /* ---- generic page event log: window.dispatchEvent(new CustomEvent('qa:event', {detail: {name, args}})) ---- */
  window.addEventListener('qa:event', function (e) {
    var d = e.detail || {};
    log('event', d.name || 'qa:event', d.args && d.args.length === 1 ? d.args[0] : (d.args !== undefined ? d.args : d));
  });

  window.addEventListener('error', function (e) { Q.errors.push(String(e.message)); log('error', 'window.onerror', { message: e.message, src: e.filename }); });
  window.addEventListener('unhandledrejection', function (e) { Q.errors.push(String(e.reason)); log('error', 'unhandledrejection', String(e.reason)); });

  /* ---- url helpers ---- */
  function qsWithout(keys) {
    var p = new URLSearchParams(location.search); keys.forEach(function (k) { p.delete(k); });
    var s = p.toString(); return s ? '?' + s : '';
  }
  Q.qsWithout = qsWithout;

  /* ---- embed widget(s) using the standard installation code ---- */
  var APP = 'elfsight-app';
  var PLATFORM = 'https://elfsightcdn.com/platform.js';
  var IDS = (P.get('id') || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  Q.ids = IDS;
  var PLACE = (P.get('place') || 'inline').toLowerCase(); if (PLACE === 'floating') PLACE = 'body';
  function isLazy(where) { var l = P.get('lazy'); return l === '1' ? true : l === '0' ? false : where === 'inline'; }
  function mk(id, where) {
    var d = document.createElement('div'); d.className = APP + '-' + id;
    if (isLazy(where)) d.setAttribute('data-' + APP + '-lazy', '');
    d.setAttribute('data-qa-place', where); return d;
  }
  function embed() {
    if (!IDS.length) return;
    IDS.forEach(function (id) {
      if (PLACE === 'inline' || PLACE === 'both') { var slot = document.getElementById('qa-slot-header') || document.body; slot.appendChild(mk(id, 'inline')); }
      if (PLACE === 'body' || PLACE === 'both') document.body.appendChild(mk(id, 'body'));
    });
    var sc = document.createElement('script'); sc.src = PLATFORM; sc.async = true; document.body.appendChild(sc);
    log('qa', 'embed', { ids: IDS, place: PLACE, lazy: { inline: isLazy('inline'), body: isLazy('body') } });
  }

  /* ---- preserve query string (minus lang) on same-origin links ---- */
  function rewriteLinks(root) {
    var keep = qsWithout(['lang']);
    (root || document).querySelectorAll('a[href]:not([data-qa-raw])').forEach(function (a) {
      var href = a.getAttribute('href'); if (!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return;
      var u; try { u = new URL(href, location.href); } catch (e) { return; }
      if (u.origin !== location.origin) return;
      var p = new URLSearchParams(keep); u.searchParams.forEach(function (v, k) { p.set(k, v); });
      var s = p.toString(); a.href = u.pathname + (s ? '?' + s : '') + u.hash;
    });
  }
  Q.rewriteLinks = rewriteLinks;

  /* ---- base path (works under a sub-path on GitHub Pages and at / locally) ---- */
  function base() { var m = document.querySelector('meta[name="qa-base"]'); return new URL(m ? m.content : './', location.href).pathname; }
  Q.base = base;

  /* ---- debug panel ---- */
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function panel() {
    if (P.get('panel') === '0') return;
    var css = el('style', {}, '#qa-panel{position:fixed;left:8px;bottom:8px;z-index:2147483000;width:340px;max-height:45vh;overflow:auto;font:12px/1.35 ui-monospace,Menlo,Consolas,monospace;background:#101418;color:#d8e1e8;border:1px solid #3a4652;border-radius:8px;box-shadow:0 4px 18px rgba(0,0,0,.35)}' +
      '#qa-panel summary{cursor:pointer;padding:6px 8px;background:#1c252e;border-radius:8px;font-weight:bold;list-style:none}#qa-panel summary::-webkit-details-marker{display:none}' +
      '#qa-panel .b{padding:6px 8px;border-top:1px solid #2a343e}#qa-panel h4{margin:0 0 3px;font-size:11px;color:#8fb3d1;text-transform:uppercase}' +
      '#qa-panel pre{margin:0;white-space:pre-wrap;word-break:break-all}#qa-panel button{font:inherit;margin:2px 4px 2px 0;padding:2px 6px;background:#2d6cdf;color:#fff;border:0;border-radius:4px;cursor:pointer}' +
      '#qa-panel a{color:#7cc4ff;margin-right:6px}#qa-panel .ev{border-bottom:1px dotted #2a343e;padding:2px 0}#qa-panel .k-event{color:#9fe870}#qa-panel .k-gtag,#qa-panel .k-dataLayer{color:#ffd166}#qa-panel .k-error,#qa-panel .k-warn{color:#ff7b7b}');
    // Closed shadow root + translate="no" keep the panel isolated from the page content under test.
    var host = el('div', { id: 'qa-panel-host', translate: 'no', class: 'notranslate', 'data-qa-panel': '' });
    document.body.appendChild(host);
    var sr = host.attachShadow ? host.attachShadow({ mode: 'closed' }) : host;
    sr.appendChild(css);
    var d = el('details', { id: 'qa-panel', translate: 'no', class: 'notranslate' });
    if (P.get('panel') !== 'min') d.open = true;
    d.innerHTML = '<summary>Debug panel · <span data-f="sum"></span></summary>' +
      '<div class="b"><h4>Environment</h4><pre data-f="env"></pre></div>' +
      '<div class="b"><h4>localStorage</h4><pre data-f="ls"></pre></div>' +
      '<div class="b"><h4>Watched requests (<span data-f="w"></span>): <span data-f="rc">0</span></h4><pre data-f="rq"></pre></div>' +
      '<div class="b"><h4>Event log</h4><div data-f="log"></div></div>' +
      '<div class="b"><h4>Controls</h4><button data-a="clear">Clear storage &amp; reload without ?lang</button><button data-a="reload">Reload</button><button data-a="copy">Copy state JSON</button><div data-f="langs" style="margin-top:4px"></div></div>';
    sr.appendChild(d);
    Q.panelRoot = sr;
    var f = function (n) { return d.querySelector('[data-f="' + n + '"]'); };
    var lk = '';
    var folders = [['en', 'en'], ['de', 'de'], ['pt-PT', 'pt-PT'], ['pt', 'pt'], ['nolang', 'no lang'], ['widget', '/widget/']];
    var keep = qsWithout(['lang']), page = location.pathname.split('/').pop() || 'index.html';
    folders.forEach(function (x) { lk += '<a data-qa-raw href="' + base() + x[0] + '/' + (x[0] === 'widget' ? '' : page) + keep + '">' + x[1] + '</a>'; });
    lk += '<a data-qa-raw href="' + base() + keep + '">home</a>';
    f('langs').innerHTML = 'Switch page: ' + lk;
    f('w').textContent = WATCH.length ? WATCH.join(', ') : 'add ?watch=';
    d.addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'clear') { try { localStorage.clear(); } catch (_) { } try { sessionStorage.clear(); } catch (_) { } location.href = location.pathname + qsWithout(['lang']) + location.hash; }
      if (a === 'reload') location.reload();
      if (a === 'copy') navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(Q.state(), null, 2));
    });
    var pending = false;
    Q._render = function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var s = Q.state();
        var set = function (n, v, html) { var x = f(n); if (html ? x.innerHTML !== v : x.textContent !== v) { if (html) x.innerHTML = v; else x.textContent = v; } };
        set('sum', 'lang=' + (s.htmlLang == null ? '∅' : s.htmlLang) + ' · req=' + s.requests.length + ' · ev=' + s.events.filter(function (x) { return x.kind === 'event'; }).length + ' · ga=' + s.ga.length);
        set('env', 'navigator.languages: ' + JSON.stringify(s.navigator.languages) + '\nnavigator.language: ' + s.navigator.language + '\nnavigator.webdriver: ' + s.navigator.webdriver +
          '\nUA: ' + s.navigator.userAgent + '\nhtml lang: ' + (s.htmlLang == null ? '(none)' : s.htmlLang) + '\ntitle: ' + s.title + '\nsearch: ' + (s.search || '(empty)') + '  hash: ' + (s.hash || '') +
          '\nids: ' + (Q.ids.join(', ') || '(none, add ?id=)') + '\nwidget containers: ' + s.widgetRoots);
        set('ls', JSON.stringify(s.storage, null, 1));
        set('rc', String(s.requests.length));
        set('rq', s.requests.slice(-15).map(function (r) { return r.t + ' ' + r.url.replace(/^https?:\/\//, '').slice(0, 80); }).join('\n') || '-');
        set('log', s.events.slice(-60).map(function (e) { return '<div class="ev k-' + esc(e.kind) + '">' + esc(e.t) + ' [' + esc(e.kind) + '] ' + esc(e.name) + ' ' + esc(JSON.stringify(e.payload) || '') + '</div>'; }).join('') || '-', true);
      });
    };
    Q._render();
    setInterval(Q._render, 1000);
    window.addEventListener('popstate', Q._render);
  }

  Q.state = function () {
    return {
      url: location.href, search: location.search, hash: location.hash, title: document.title,
      htmlLang: document.documentElement.getAttribute('lang'),
      navigator: { languages: Array.prototype.slice.call(navigator.languages || []), language: navigator.language, webdriver: navigator.webdriver, userAgent: navigator.userAgent },
      storage: storageDump(), watch: WATCH.slice(), requests: Q.requests.slice(), events: Q.events.slice(), ga: Q.ga.slice(), errors: Q.errors.slice(),
      widgetRoots: document.querySelectorAll('[class*="' + APP + '-"]').length
    };
  };

  /* ---- dynamic content (Load more + auto inject after 3 s) ---- */
  function dynamic() {
    var tpl = document.getElementById('qa-dyn-tpl'); var box = document.getElementById('qa-dyn'); if (!tpl || !box) return;
    var n = 0;
    function add(src) { n++; var frag = tpl.content.cloneNode(true); frag.querySelectorAll('[data-n]').forEach(function (x) { x.textContent = n; }); var w = el('div', { 'data-qa-dyn': src }); w.appendChild(frag); box.appendChild(w); log('qa', 'dynamic-block', { n: n, src: src }); }
    var btn = document.getElementById('qa-load-more'); if (btn) btn.addEventListener('click', function () { add('button'); });
    setTimeout(function () { add('auto-3s'); var a = document.getElementById('qa-auto'); if (a) a.hidden = false; }, 3000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    rewriteLinks(); embed(); panel(); dynamic();
    // log URL changes made via the History API
    ['pushState', 'replaceState'].forEach(function (m) { var o = history[m]; history[m] = function () { var r = o.apply(this, arguments); log('url', m, location.search + location.hash); return r; }; });
  });
})();
