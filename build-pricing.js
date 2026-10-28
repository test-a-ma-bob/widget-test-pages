#!/usr/bin/env node
// Generates shop/pricing pages. Run: node build-pricing.js
const fs = require('fs');
const path = require('path');

const NNBS = '\u202F'; // narrow no-break space
const NBSP = '\u00A0';

const pages = [
  {
    dir: 'pricing-en',
    lang: 'en',
    title: 'Shop & pricing — Northwind Goods',
    navHome: 'Home',
    navShop: 'Shop',
    h1: 'Northwind Goods — shop and pricing',
    lead: 'A small harbour shop for lanterns, oak trays and spare glass. Below you will find sample prices, a cart summary and a few product cards.',
    formatsH: 'Price formats you may see on the site',
    formatsIntro: 'Currency symbols before or after the amount, ISO codes, and mixed separators:',
    formats: [
      `$19.99 · €19.99 · 19,99${NBSP}€ · £5 · ¥1,200 · ₽1${NBSP}990 · 1${NBSP}990${NBSP}₽ · ₹499 · CHF 49.90 · kr 99`,
      `USD 1,250.00 · 1.250,00 EUR · 1,234,567.89 · 1.234.567,89 · 1${NBSP}234${NBSP}567,89 · 1${NNBS}234${NNBS}567,89 · 1'234.50`,
      `Negatives and discounts: -$5.00 · −15% · save 20% · price range $10–$20 · from $9/mo · $9.99/month`,
      `Large and small: 0.00042 BTC · $1.2M · 3,5 Mio. € · per-unit $0.45/oz`,
    ],
    cardsH: 'Featured products',
    cards: [
      { name: 'Harbour Glow lantern', imgAlt: 'Harbour Glow lantern, $49.00', title: 'Buy Harbour Glow for $49.00', old: '$59.00', priceHtml: '<span class="cur">$</span><span class="int">49</span><sup class="dec">.00</sup>', badge: '−17%', note: 'SKU NW-HG-2048 · qty in stock: 36' },
      { name: 'Oak serving tray', imgAlt: 'Oak tray priced at £38', title: 'Oak tray £38', old: '', priceHtml: '£38.00', badge: '', note: 'Made in 2024 · phone for wholesale +1 (415) 555-0199' },
      { name: 'Spare glass set', imgAlt: 'Spare glass ¥4,800', title: 'Spare glass ¥4,800', old: '', priceHtml: '¥4,800', badge: '', note: 'Order #ORD-88421 · ships in 3 days' },
    ],
    splitNote: 'Split markup example (same product):',
    splitHtml: `<span class="price"><span class="cur">$</span><span class="int">19</span><sup>.99</sup></span> <span class="old">$24.99</span>`,
    tableH: 'Plan comparison',
    tableHead: ['Plan', 'Monthly', 'Yearly', 'Seats'],
    tableRows: [
      ['Starter', 'from $9/mo', '$99/year', '1'],
      ['Workshop', '$29.00/month', 'USD 290.00', '5'],
      ['Harbour', '€49,90 / Monat', 'CHF 490.00', '20'],
    ],
    cartH: 'Cart summary',
    cartRows: [
      ['Subtotal', '$98.00'],
      ['Shipping', '$8.50'],
      ['Tax / VAT (8%)', '$8.52'],
      ['Discount (−15%)', '−$14.70'],
    ],
    cartTotal: ['Total', '$100.32'],
    qtyH: 'Adjust quantity',
    qtyLabel: 'Harbour Glow lantern',
    unitEach: 'each',
    unitPrice: '$49.00',
    unitAmount: '49',
    unitCurrency: 'USD',
    unitFormat: 'en-US',
    lineLabel: 'Line total:',
    selectH: 'Gift wrap options',
    selectLabel: 'Choose wrap',
    options: [
      ['0', 'No wrap — $0.00'],
      ['3.5', 'Kraft paper — $3.50'],
      ['7.99', 'Cloth ribbon — $7.99'],
    ],
    inputH: 'Custom tip',
    inputPlaceholder: 'e.g. $5.00',
    inputValue: '2.50',
    delayedH: 'Live offer',
    delayedWait: 'A limited offer will appear here in two seconds…',
    delayedText: 'Flash deal: buy 2 for $79 (save $19)!',
    metaH: 'Not money — kept for contrast',
    metaItems: [
      'Quantity on shelf: 12',
      'SKU: NW-GOODS-2048',
      'Support phone: +1 (415) 555-0199',
      'Opened: March 15, 2014',
      'Catalog year: 2026',
      'Order number: ORD-88421',
    ],
    footer: 'Northwind Goods · prices shown for demonstration · tax included where noted',
    btnMinus: '−',
    btnPlus: '+',
  },
  {
    dir: 'pricing-de',
    lang: 'de',
    title: 'Shop & Preise — Northwind Goods',
    navHome: 'Startseite',
    navShop: 'Shop',
    h1: 'Northwind Goods — Shop und Preise',
    lead: 'Ein kleiner Hafenshop für Laternen, Eichenbrettchen und Ersatzglas. Hier finden Sie Beispielpreise, eine Warenkorbübersicht und einige Produktkarten.',
    formatsH: 'Preiformate auf der Website',
    formatsIntro: 'Währungssymbole vor oder nach dem Betrag, ISO-Codes und gemischte Trennzeichen:',
    formats: [
      `19,99${NBSP}€ · €19,99 · $19.99 · £5 · ¥1.200 · 1${NBSP}990${NBSP}₽ · ₽1${NBSP}990 · ₹499 · CHF 49,90 · 99${NBSP}kr`,
      `1.250,00 EUR · USD 1.250,00 · 1.234.567,89 · 1${NBSP}234${NBSP}567,89 · 1${NNBS}234${NNBS}567,89 · 1'234.50 · 1,234,567.89`,
      `Negativ und Rabatt: −5,00 € · −15 % · 20 % sparen · Preisspanne 10–20 € · ab 9 €/Monat · 9,99 €/Monat`,
      `Groß und klein: 0,00042 BTC · 1,2 Mio. $ · 3,5 Mio. € · Stückpreis 0,45 $/oz`,
    ],
    cardsH: 'Empfohlene Produkte',
    cards: [
      { name: 'Harbour-Glow-Laterne', imgAlt: 'Harbour-Glow-Laterne, 49,00 €', title: 'Harbour Glow für 49,00 € kaufen', old: '59,00 €', priceHtml: '<span class="int">49</span><sup class="dec">,00</sup><span class="cur"> €</span>', badge: '−17 %', note: 'Art.-Nr. NW-HG-2048 · Bestand: 36' },
      { name: 'Eichen-Servierbrett', imgAlt: 'Eichenbrett für 38 £', title: 'Eichenbrett 38 £', old: '', priceHtml: '38,00 £', badge: '', note: 'Hergestellt 2024 · Großhandel +49 40 5550 199' },
      { name: 'Ersatzglas-Set', imgAlt: 'Ersatzglas ¥4.800', title: 'Ersatzglas ¥4.800', old: '', priceHtml: '¥4.800', badge: '', note: 'Bestellung #ORD-88421 · Versand in 3 Tagen' },
    ],
    splitNote: 'Geteiltes Markup (dasselbe Produkt):',
    splitHtml: `<span class="price"><span class="int">19</span><sup>,99</sup><span class="cur">${NBSP}€</span></span> <span class="old">24,99${NBSP}€</span>`,
    tableH: 'Tarifvergleich',
    tableHead: ['Tarif', 'Monatlich', 'Jährlich', 'Plätze'],
    tableRows: [
      ['Starter', 'ab 9 €/Monat', '99 €/Jahr', '1'],
      ['Werkstatt', '29,00 €/Monat', 'EUR 290,00', '5'],
      ['Hafen', 'CHF 49.90 / month', 'CHF 490.00', '20'],
    ],
    cartH: 'Warenkorb',
    cartRows: [
      ['Zwischensumme', '98,00 €'],
      ['Versand', '8,50 €'],
      ['MwSt. (19 %)', '18,62 €'],
      ['Rabatt (−15 %)', '−14,70 €'],
    ],
    cartTotal: ['Summe', '110,42 €'],
    qtyH: 'Menge anpassen',
    qtyLabel: 'Harbour-Glow-Laterne',
    unitEach: 'pro Stück',
    unitPrice: '49,00 €',
    unitAmount: '49',
    unitCurrency: 'EUR',
    unitFormat: 'de-DE',
    lineLabel: 'Zeilensumme:',
    selectH: 'Geschenkverpackung',
    selectLabel: 'Verpackung wählen',
    options: [
      ['0', 'Keine — 0,00 €'],
      ['3.5', 'Kraftpapier — 3,50 €'],
      ['7.99', 'Stoffband — 7,99 €'],
    ],
    inputH: 'Trinkgeld',
    inputPlaceholder: 'z. B. 5,00 €',
    inputValue: '2,50',
    delayedH: 'Aktuelles Angebot',
    delayedWait: 'In zwei Sekunden erscheint hier ein zeitlich begrenztes Angebot…',
    delayedText: 'Blitzangebot: 2 Stück für 79 € (19 € sparen)!',
    metaH: 'Keine Geldbeträge — zum Vergleich',
    metaItems: [
      'Menge im Regal: 12',
      'Artikelnr.: NW-GOODS-2048',
      'Telefon: +49 40 5550 199',
      'Eröffnet: 15.03.2014',
      'Katalogjahr: 2026',
      'Bestellnummer: ORD-88421',
    ],
    footer: 'Northwind Goods · Beispielpreise · MwSt. wo angegeben inklusive',
    btnMinus: '−',
    btnPlus: '+',
  },
  {
    dir: 'pricing-fr',
    lang: 'fr',
    title: 'Boutique et tarifs — Northwind Goods',
    navHome: 'Accueil',
    navShop: 'Boutique',
    h1: 'Northwind Goods — boutique et tarifs',
    lead: 'Une petite boutique du port pour lanternes, plateaux en chêne et verre de rechange. Ci-dessous : exemples de prix, un panier et quelques fiches produit.',
    formatsH: 'Formats de prix sur le site',
    formatsIntro: 'Symboles avant ou après le montant, codes ISO et séparateurs variés :',
    formats: [
      `19,99${NBSP}€ · €19,99 · $19.99 · £5 · ¥1${NNBS}200 · 1${NBSP}990${NBSP}₽ · ₹499 · CHF 49.90 · 99${NBSP}kr`,
      `1${NNBS}250,00${NBSP}EUR · USD 1,250.00 · 1${NBSP}234${NBSP}567,89 · 1${NNBS}234${NNBS}567,89 · 1.234.567,89 · 1'234.50`,
      `Négatifs et remises : −5,00 € · −15 % · économisez 20 % · de 10 à 20 € · dès 9 €/mois · 9,99 €/mois`,
      `Grand et petit : 0,00042 BTC · 1,2 M$ · 3,5 M€ · prix unitaire 0,45 $/oz`,
    ],
    cardsH: 'Produits mis en avant',
    cards: [
      { name: 'Lanterne Harbour Glow', imgAlt: 'Lanterne Harbour Glow, 49,00 €', title: 'Acheter Harbour Glow pour 49,00 €', old: '59,00 €', priceHtml: '<span class="int">49</span><sup class="dec">,00</sup><span class="cur"> €</span>', badge: '−17 %', note: 'Réf. NW-HG-2048 · stock : 36' },
      { name: 'Plateau en chêne', imgAlt: 'Plateau en chêne à 38 £', title: 'Plateau 38 £', old: '', priceHtml: '38,00 £', badge: '', note: 'Fabriqué en 2024 · gros +33 1 55 50 19 9' },
      { name: 'Set de verre de rechange', imgAlt: 'Verre de rechange ¥4 800', title: 'Verre ¥4 800', old: '', priceHtml: `¥4${NBSP}800`, badge: '', note: 'Commande #ORD-88421 · expédition en 3 jours' },
    ],
    splitNote: 'Markup fractionné (même produit) :',
    splitHtml: `<span class="price"><span class="int">19</span><sup>,99</sup><span class="cur">${NBSP}€</span></span> <span class="old">24,99${NBSP}€</span>`,
    tableH: 'Comparaison des formules',
    tableHead: ['Formule', 'Mensuel', 'Annuel', 'Places'],
    tableRows: [
      ['Starter', 'dès 9 €/mois', '99 €/an', '1'],
      ['Atelier', '29,00 €/mois', 'EUR 290,00', '5'],
      ['Port', 'CHF 49.90 / month', 'CHF 490.00', '20'],
    ],
    cartH: 'Récapitulatif du panier',
    cartRows: [
      ['Sous-total', '98,00 €'],
      ['Livraison', '8,50 €'],
      ['TVA (20 %)', '21,30 €'],
      ['Remise (−15 %)', '−14,70 €'],
    ],
    cartTotal: ['Total', '113,10 €'],
    qtyH: 'Modifier la quantité',
    qtyLabel: 'Lanterne Harbour Glow',
    unitEach: 'pièce',
    unitPrice: '49,00 €',
    unitAmount: '49',
    unitCurrency: 'EUR',
    unitFormat: 'fr-FR',
    lineLabel: 'Total ligne :',
    selectH: 'Emballage cadeau',
    selectLabel: 'Choisir l’emballage',
    options: [
      ['0', 'Sans — 0,00 €'],
      ['3.5', 'Papier kraft — 3,50 €'],
      ['7.99', 'Ruban en tissu — 7,99 €'],
    ],
    inputH: 'Pourboire',
    inputPlaceholder: 'ex. 5,00 €',
    inputValue: '2,50',
    delayedH: 'Offre du moment',
    delayedWait: 'Une offre limitée apparaîtra ici dans deux secondes…',
    delayedText: 'Offre flash : 2 pour 79 € (économisez 19 €) !',
    metaH: 'Ce n’est pas de l’argent — pour contraste',
    metaItems: [
      'Quantité en rayon : 12',
      'Référence : NW-GOODS-2048',
      'Téléphone : +33 1 55 50 19 9',
      'Ouverture : 15 mars 2014',
      'Année du catalogue : 2026',
      'N° de commande : ORD-88421',
    ],
    footer: 'Northwind Goods · prix d’exemple · TVA incluse le cas échéant',
    btnMinus: '−',
    btnPlus: '+',
  },
  {
    dir: 'pricing-ru',
    lang: 'ru',
    title: 'Магазин и цены — Northwind Goods',
    navHome: 'Главная',
    navShop: 'Магазин',
    h1: 'Northwind Goods — магазин и цены',
    lead: 'Небольшой магазин у гавани: фонари, дубовые подносы и запасное стекло. Ниже — примеры цен, корзина и несколько карточек товаров.',
    formatsH: 'Форматы цен на сайте',
    formatsIntro: 'Символы валют до и после суммы, ISO-коды и разные разделители:',
    formats: [
      `1${NBSP}990${NBSP}₽ · ₽1${NBSP}990 · $19.99 · 19,99${NBSP}€ · €19,99 · £5 · ¥1${NBSP}200 · ₹499 · CHF 49.90 · 99${NBSP}kr`,
      `1${NBSP}250,00${NBSP}USD · 1.250,00 EUR · 1${NBSP}234${NBSP}567,89 · 1${NNBS}234${NNBS}567,89 · 1.234.567,89 · 1,234,567.89 · 1'234.50`,
      `Отрицательные и скидки: −500${NBSP}₽ · −15 % · скидка 20 % · от 10 до 20 $ · от 900${NBSP}₽/мес · 9,99 $/месяц`,
      `Крупные и мелкие: 0,00042 BTC · $1.2M · 3,5 млн € · цена за единицу 0,45 $/унция`,
    ],
    cardsH: 'Рекомендуемые товары',
    cards: [
      { name: 'Фонарь Harbour Glow', imgAlt: 'Фонарь Harbour Glow, 4 900 ₽', title: 'Купить Harbour Glow за 4 900 ₽', old: `5${NBSP}900${NBSP}₽`, priceHtml: `<span class="int">4${NBSP}900</span><span class="cur">${NBSP}₽</span>`, badge: '−17 %', note: 'Артикул NW-HG-2048 · на складе: 36' },
      { name: 'Дубовый поднос', imgAlt: 'Дубовый поднос £38', title: 'Поднос £38', old: '', priceHtml: '£38.00', badge: '', note: 'Сделано в 2024 · опт +7 495 555-01-99' },
      { name: 'Набор запасного стекла', imgAlt: 'Запасное стекло ¥4 800', title: 'Стекло ¥4 800', old: '', priceHtml: `¥4${NBSP}800`, badge: '', note: 'Заказ #ORD-88421 · отправка за 3 дня' },
    ],
    splitNote: 'Размеченная цена (тот же товар):',
    splitHtml: `<span class="price"><span class="int">1${NBSP}990</span><span class="cur">${NBSP}₽</span></span> <span class="old">2${NBSP}490${NBSP}₽</span>`,
    tableH: 'Сравнение тарифов',
    tableHead: ['Тариф', 'В месяц', 'В год', 'Места'],
    tableRows: [
      ['Старт', `от 900${NBSP}₽/мес`, `9${NBSP}900${NBSP}₽/год`, '1'],
      ['Мастерская', `2${NBSP}900${NBSP}₽/мес`, 'USD 290.00', '5'],
      ['Гавань', 'CHF 49.90 / month', 'CHF 490.00', '20'],
    ],
    cartH: 'Корзина',
    cartRows: [
      ['Подытог', `9${NBSP}800${NBSP}₽`],
      ['Доставка', `850${NBSP}₽`],
      ['НДС (20 %)', `2${NBSP}130${NBSP}₽`],
      ['Скидка (−15 %)', `−1${NBSP}470${NBSP}₽`],
    ],
    cartTotal: ['Итого', `11${NBSP}310${NBSP}₽`],
    qtyH: 'Изменить количество',
    qtyLabel: 'Фонарь Harbour Glow',
    unitEach: 'шт.',
    unitPrice: `4${NBSP}900${NBSP}₽`,
    unitAmount: '4900',
    unitCurrency: 'RUB',
    unitFormat: 'ru-RU',
    lineLabel: 'Сумма строки:',
    selectH: 'Подарочная упаковка',
    selectLabel: 'Выберите упаковку',
    options: [
      ['0', `Без упаковки — 0${NBSP}₽`],
      ['3.5', `Крафт-бумага — 350${NBSP}₽`],
      ['7.99', `Тканевая лента — 799${NBSP}₽`],
    ],
    inputH: 'Чаевые',
    inputPlaceholder: `напр. 500${NBSP}₽`,
    inputValue: '250',
    delayedH: 'Текущее предложение',
    delayedWait: 'Через две секунды здесь появится ограниченное предложение…',
    delayedText: `Молниеносная акция: 2 шт. за 7${NBSP}900${NBSP}₽ (экономия 1${NBSP}900${NBSP}₽)!`,
    metaH: 'Не деньги — для контраста',
    metaItems: [
      'Количество на полке: 12',
      'Артикул: NW-GOODS-2048',
      'Телефон: +7 495 555-01-99',
      'Открытие: 15 марта 2014',
      'Год каталога: 2026',
      'Номер заказа: ORD-88421',
    ],
    footer: 'Northwind Goods · демонстрационные цены · налог указан где отмечено',
    btnMinus: '−',
    btnPlus: '+',
  },
];

// nolang: same English content, no lang attribute
const en = pages[0];
pages.push(Object.assign({}, en, { dir: 'pricing-nolang', lang: null, title: 'Shop & pricing — Northwind Goods (no lang)' }));

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function render(p) {
  const langAttr = p.lang ? ` lang="${p.lang}"` : '';
  const cards = p.cards.map(c => `      <article class="card">
        <h3 title="${esc(c.title)}">${esc(c.name)}</h3>
        <p><img src="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect fill="#eef3fb" width="160" height="90"/><text x="80" y="50" text-anchor="middle" fill="#2c3e50" font-size="12">product</text></svg>')}" width="160" height="90" alt="${esc(c.imgAlt)}"></p>
        <p class="price">${c.old ? `<span class="old">${esc(c.old)}</span>` : ''}${c.priceHtml}${c.badge ? ` <span class="badge">${esc(c.badge)}</span>` : ''}</p>
        <p class="meta">${esc(c.note)}</p>
        <p><button type="button" class="cta" title="${esc(c.title)}">${esc(c.title)}</button></p>
      </article>`).join('\n');

  const tableHead = p.tableHead.map(h => `<th>${esc(h)}</th>`).join('');
  const tableRows = p.tableRows.map(r => `<tr><td>${esc(r[0])}</td><td class="num">${esc(r[1])}</td><td class="num">${esc(r[2])}</td><td class="num">${esc(r[3])}</td></tr>`).join('\n        ');
  const cartRows = p.cartRows.map(r => `      <div class="row"><span>${esc(r[0])}</span><span>${esc(r[1])}</span></div>`).join('\n');
  const formats = p.formats.map(f => `      <li>${esc(f)}</li>`).join('\n');
  const options = p.options.map(o => `        <option value="${esc(o[0])}">${esc(o[1])}</option>`).join('\n');
  const meta = p.metaItems.map(m => `      <li>${esc(m)}</li>`).join('\n');

  return `<!DOCTYPE html>
<html${langAttr}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="qa-base" content="../">
  <title>${esc(p.title)}</title>
  <link rel="stylesheet" href="../assets/site.css">
  <script src="../assets/qa.js"></script>
  <script src="../assets/pricing.js"></script>
</head>
<body data-variant="${p.dir}" data-page="pricing">
  <header class="site-header">
    <div class="brand-mark" translate="no">Northwind Goods</div>
    <nav>
      <a href="../">Home</a>
      <a href="./index.html">${esc(p.navShop)}</a>
    </nav>
    <div id="qa-slot-header" class="widget-slot"></div>
  </header>
  <main>
    <h1>${esc(p.h1)}</h1>
    <p class="lead">${esc(p.lead)}</p>

    <h2>${esc(p.formatsH)}</h2>
    <p>${esc(p.formatsIntro)}</p>
    <ul class="formats">
${formats}
    </ul>

    <h2>${esc(p.cardsH)}</h2>
    <div class="price-grid">
${cards}
    </div>
    <p>${esc(p.splitNote)} ${p.splitHtml}</p>

    <h2>${esc(p.tableH)}</h2>
    <table class="pricing-table">
      <thead><tr>${tableHead}</tr></thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <h2>${esc(p.cartH)}</h2>
    <div class="cart">
${cartRows}
      <div class="row total"><span>${esc(p.cartTotal[0])}</span><span>${esc(p.cartTotal[1])}</span></div>
    </div>

    <h2>${esc(p.qtyH)}</h2>
    <p>${esc(p.qtyLabel)} — <span id="qa-unit-price" data-amount="${esc(p.unitAmount)}" data-currency="${esc(p.unitCurrency)}" data-format="${esc(p.unitFormat)}">${esc(p.unitPrice)}</span> ${esc(p.unitEach)}</p>
    <div class="qty">
      <button type="button" id="qa-qty-minus" aria-label="${esc(p.btnMinus)}">${esc(p.btnMinus)}</button>
      <span id="qa-qty">1</span>
      <button type="button" id="qa-qty-plus" aria-label="${esc(p.btnPlus)}">${esc(p.btnPlus)}</button>
      <span>${esc(p.lineLabel)} <strong id="qa-line-total">${esc(p.unitPrice)}</strong></span>
    </div>

    <h2>${esc(p.selectH)}</h2>
    <p><label>${esc(p.selectLabel)}
      <select class="sample-select" name="wrap">
${options}
      </select>
    </label></p>

    <h2>${esc(p.inputH)}</h2>
    <p><label><input class="sample-input" type="text" name="tip" placeholder="${esc(p.inputPlaceholder)}" value="${esc(p.inputValue)}"></label></p>

    <h2>${esc(p.delayedH)}</h2>
    <p id="qa-delayed" data-text="${esc(p.delayedText)}">${esc(p.delayedWait)}</p>

    <h2>${esc(p.metaH)}</h2>
    <ul class="meta">
${meta}
    </ul>
  </main>
  <footer><p>${esc(p.footer)}</p></footer>
</body>
</html>
`;
}

for (const p of pages) {
  const dir = path.join(__dirname, p.dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(p));
  console.log('built', p.dir);
}
