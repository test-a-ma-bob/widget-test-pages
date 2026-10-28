/* Quantity stepper and delayed price inject for shop/pricing pages. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var unit = document.getElementById('qa-unit-price');
    var qtyEl = document.getElementById('qa-qty');
    var lineEl = document.getElementById('qa-line-total');
    var minus = document.getElementById('qa-qty-minus');
    var plus = document.getElementById('qa-qty-plus');
    if (unit && qtyEl && lineEl) {
      var base = parseFloat(unit.getAttribute('data-amount') || '0');
      var currency = unit.getAttribute('data-currency') || '';
      var format = unit.getAttribute('data-format') || 'en';
      function fmt(n) {
        try {
          return new Intl.NumberFormat(format, { style: 'currency', currency: currency || 'USD' }).format(n);
        } catch (e) {
          return currency + ' ' + n.toFixed(2);
        }
      }
      function render() {
        var q = parseInt(qtyEl.textContent, 10) || 1;
        lineEl.textContent = fmt(base * q);
        if (window.__qa && window.__qa.log) window.__qa.log('qa', 'qty-change', { qty: q, total: base * q });
      }
      if (minus) minus.addEventListener('click', function () {
        var q = Math.max(1, (parseInt(qtyEl.textContent, 10) || 1) - 1);
        qtyEl.textContent = q;
        render();
      });
      if (plus) plus.addEventListener('click', function () {
        var q = (parseInt(qtyEl.textContent, 10) || 1) + 1;
        qtyEl.textContent = q;
        render();
      });
    }

    setTimeout(function () {
      var box = document.getElementById('qa-delayed');
      if (!box) return;
      var text = box.getAttribute('data-text') || '';
      box.textContent = text;
      box.removeAttribute('hidden');
      if (window.__qa && window.__qa.log) window.__qa.log('qa', 'delayed-price', { text: text });
    }, 2000);
  });
})();
