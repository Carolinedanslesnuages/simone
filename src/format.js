// Pure helpers, shared by the site and the tests.

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
  'septembre', 'octobre', 'novembre', 'décembre'];

/** Accepted date formats: "1793", "1793-07" or "1793-07-13". */
export const DATE_PATTERN = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;

/** "0060" → "60 apr. J.-C.", "1792" → "1792". */
export function formatYear(year) {
  const number = Number(year);
  return number < 1000 ? `${number} apr. J.-C.` : String(number);
}

/** "1793-07-13" → "13 juillet 1793", "1871-04" → "avril 1871", "1792" → "1792". */
export function formatDate(date) {
  const [rawYear, month, day] = date.split('-');
  const year = formatYear(rawYear);
  if (!month) return year;
  const monthName = MONTHS[Number(month) - 1];
  if (!day) return `${monthName} ${year}`;
  return `${Number(day) === 1 ? '1er' : Number(day)} ${monthName} ${year}`;
}

/** Lowercase, without accents: « Théroigne » matches « theroigne ». */
export function normalize(text) {
  return String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}





/**
 * Dates in order, comparing only what both dates say:
 * "1793-06" then "1793" is fine (both in 1793), "1793-11" then "1793-06" is not.
 */
export function isChronological(dates) {
  return dates.every((date, index) => {
    if (index === 0) return true;
    const previous = dates[index - 1];
    const length = Math.min(date.length, previous.length);
    return previous.slice(0, length) <= date.slice(0, length);
  });
}

/** "1748 – 1793", "née en 1979" (living woman: empty death), "naissance inconnue – 43". */
export function lifespan(woman) {
  if (!woman.death) return `née en ${woman.birth}`;
  const birth = woman.birth === 'inconnue' ? 'naissance inconnue' : woman.birth;
  return `${birth} – ${woman.death}`;
}


const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** School-notebook date: "2026-02-03" → "Mardi 3 février 2026". */
export function formatSchoolDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  const text = `${weekday} ${formatDate(date)}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Chronicles already published on the given day ("AAAA-MM-JJ"), in publication order. */
export function publishedChronicles(women, today) {
  return women
    .filter((woman) => woman.published <= today)
    .sort((first, second) => first.published.localeCompare(second.published) || first.name.localeCompare(second.name, 'fr'));
}

/** Room taken by the date, the name and the identity line (left), and by the sources (right). */
const HEADER_WEIGHT = 300;
const SOURCES_WEIGHT = 250;

/**
 * Splits the chronicle paragraphs over the two pages of a spread, so that both pages hold
 * about the same amount of text. The left page also holds the header; the right one, the sources.
 */
export function splitChronicle(paragraphs) {
  const total = HEADER_WEIGHT + SOURCES_WEIGHT + paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0);
  let leftWeight = HEADER_WEIGHT;
  let splitIndex = 0;
  while (splitIndex < paragraphs.length - 1 && leftWeight + paragraphs[splitIndex].length / 2 <= total / 2) {
    leftWeight += paragraphs[splitIndex].length;
    splitIndex += 1;
  }
  return { left: paragraphs.slice(0, Math.max(splitIndex, 1)), right: paragraphs.slice(Math.max(splitIndex, 1)) };
}
