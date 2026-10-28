# Widget test pages

Static test pages that embed a widget from URL query parameters, with a small debug panel.

## Pages

- `/` – landing page with a link builder
- `/en/`, `/de/`, `/pt-PT/`, `/pt/` – the same content with that `<html lang>`; `/nolang/` – English without a `lang` attribute; `/en-US/` – English, `/de-DE/` – German; `/de-nolang/` – German without a `lang` attribute; `/en-de/` – German content with `lang="en"`, `/fr-en/` – English content with `lang="fr"` (mismatch pages)
- `/widget/` – generic page for any widget
- `/pricing-en/`, `/pricing-de/`, `/pricing-fr/`, `/pricing-ru/` – Northwind Goods shop pages with mixed currency and amount formats in that language; `/pricing-nolang/` – the English shop page without a `lang` attribute
- Each language folder has `index.html` and `page2.html` with headings, a list, buttons, exclusion test elements, dynamic content (a Load more button and a block added 3 s after load) and an anchor `#section` far down the page.

Internal links keep all query parameters except `lang`.

The language folders are generated: edit `src/content.js` or `build.js`, then run `node build.js`. Pricing pages: edit `build-pricing.js`, then run `node build-pricing.js`.

## Query parameters

| Param | Meaning |
|---|---|
| `id` | Widget id(s), comma-separated |
| `place` | `inline` (header, default) · `body` (end of `<body>`, alias `floating`) · `both` |
| `lazy` | `1` / `0` forces lazy loading on / off (default: inline lazy, body not) |
| `ga`, `gtm` | Load real gtag.js / GTM with this id; otherwise analytics calls are only logged |
| `analytics` | Without `ga`/`gtm`: `gtag` (default stub) · `datalayer` · `none` |
| `nostorage=1` | `localStorage` throws (blocked-storage simulation) |
| `watch` | Comma-separated URL substrings; matching network requests are counted in the panel |
| `panel` | `0` hides the debug panel · `min` starts it collapsed |
| `hl` | `/widget/` only: `<html lang>` to set (`none` removes it) |

Example: `/en/index.html?id=<widget-id>&place=inline#section`

## Debug panel

Shows `navigator.languages`, `navigator.webdriver`, html `lang`, the URL, all localStorage keys, watched requests, analytics calls, History API URL changes and errors. Any script on the page can add entries to its event log:

```js
window.dispatchEvent(new CustomEvent('qa:event', { detail: { name: 'my-event', args: [{ some: 'data' }] } }));
```

`window.__qa.state()` returns the panel data as JSON.

## Local run

```
python3 -m http.server 8765   # then open http://localhost:8765/en/?id=<widget-id>
```
