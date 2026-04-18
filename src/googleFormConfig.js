/**
 * Google Forms: ответы попадают в форму, а таблица с ответами подключается в настройках формы
 * (Ответы → связать с таблицей). URL таблицы в коде не нужен — достаточно ID формы и entry.*.
 *
 * Если нет файла .env (например после git clone), используются значения по умолчанию ниже.
 * Переопределение: переменные REACT_APP_* в .env или на хостинге.
 */

/** Та же форма, что и на сайте приглашения */
const DEFAULT_FORM_ID = '1FAIpQLSeSG53u4vTYACiOP6ySpFCQQmPkZohteOah-8MYnxJzCMoOVw';

/**
 * Токен из HTML: <input type="hidden" name="fbzx" value="...">
 * При ошибке 400 при отправке обновите в .env или здесь и пересоберите.
 */
const DEFAULT_FBZX = '6037787300172835998';

const DEFAULT_ENTRIES = {
  name: 'entry.559352220',
  attending: 'entry.877086558',
  plusOne: 'entry.924523986',
  transfer: 'entry.186230675',
  menu: 'entry.1952658341',
  comment: 'entry.1751303409',
};

function pick(envVal, fallback) {
  const v = envVal?.trim();
  return v || fallback;
}

const formId = pick(process.env.REACT_APP_GOOGLE_FORM_ID, DEFAULT_FORM_ID);

/** Публичная ссылка на таблицу ответов (только для подсказки в UI, API не вызывает). */
export const responsesSpreadsheetUrl =
  'https://docs.google.com/spreadsheets/d/1dx5QBQpx8KGtVyMsE3YnHLuHPGnOeR9WhQzYh0rfLW8/edit?usp=sharing';

/** Короткая ссылка на ту же форму (редирект на тот же form id). */
export const formShortUrl = 'https://forms.gle/PaNhzez7hSUY3VMV8';

/** Обязателен для POST: из .env или DEFAULT_FBZX */
export const gfFbzx = pick(process.env.REACT_APP_GF_FBZX, DEFAULT_FBZX);

export function getFormResponseUrl() {
  return `https://docs.google.com/forms/d/e/${formId}/formResponse`;
}

export const gfEntries = {
  name: pick(process.env.REACT_APP_GF_ENTRY_NAME, DEFAULT_ENTRIES.name),
  attending: pick(process.env.REACT_APP_GF_ENTRY_ATTENDING, DEFAULT_ENTRIES.attending),
  plusOne: pick(process.env.REACT_APP_GF_ENTRY_PLUS_ONE, DEFAULT_ENTRIES.plusOne),
  transfer: pick(process.env.REACT_APP_GF_ENTRY_TRANSFER, DEFAULT_ENTRIES.transfer),
  menu: pick(process.env.REACT_APP_GF_ENTRY_MENU, DEFAULT_ENTRIES.menu),
  comment: pick(process.env.REACT_APP_GF_ENTRY_COMMENT, DEFAULT_ENTRIES.comment),
};

export function isGoogleFormConfigured() {
  return Boolean(formId && gfFbzx && Object.values(gfEntries).every(Boolean));
}
