/**
 * POST только через HTML-форму (fetch к formResponse даёт 401).
 * target="_self" — надёжно, но уводит на страницу Google.
 * Скрытый iframe — остаётесь на сайте; тот же POST, ответ грузится в iframe (в консоли может быть CSP/401 — на запись в таблицу обычно не влияет).
 * partialResponse не шлём — иначе второй клик «Отправить» в Google.
 */

const IFRAME_ID = 'gf-form-response-frame';

function appendHidden(form, name, value) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  form.appendChild(input);
}

function ensureHiddenIframe() {
  let iframe = document.getElementById(IFRAME_ID);
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe.name = IFRAME_ID;
    iframe.title = 'Ответ Google Forms';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.cssText =
      'position:fixed;width:1px;height:1px;left:-9999px;top:0;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(iframe);
  }
  return IFRAME_ID;
}

/**
 * @param {object} params
 * @param {string} params.actionUrl
 * @param {Record<string, string>} params.fields
 * @param {string} params.fbzx
 * @param {() => void} [params.onDone] — вызывается после отправки (остаётесь на странице приглашения)
 */
export function submitToGoogleForm({ actionUrl, fields, fbzx, onDone }) {
  const target = ensureHiddenIframe();

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = actionUrl;
  form.target = target;
  form.acceptCharset = 'UTF-8';
  form.style.display = 'none';

  Object.entries(fields).forEach(([name, value]) => {
    if (value === undefined || value === null || String(value).trim() === '') {
      return;
    }
    appendHidden(form, name, String(value));
  });

  appendHidden(form, 'fvv', '1');
  appendHidden(form, 'pageHistory', '0');
  appendHidden(form, 'fbzx', String(fbzx));
  appendHidden(form, 'submissionTimestamp', '-1');

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  window.setTimeout(() => {
    if (typeof onDone === 'function') {
      onDone();
    }
  }, 400);
}
