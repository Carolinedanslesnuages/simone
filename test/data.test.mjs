// Every chronicle must follow the schema described in the README.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { DATE_PATTERN, isChronological } from '../src/format.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const themeIds = readJson('../data/themes.json').map((theme) => theme.id);
const regionIds = readJson('../data/regions.json').map((region) => region.id);
const fileNames = readdirSync(new URL('../data/women/', import.meta.url)).filter((name) => name.endsWith('.json'));
const KNOWN_KEYS = ['name', 'birth', 'death', 'country', 'region', 'published', 'summary', 'chronicle', 'actions', 'sources'];
const FULL_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

test('il y a des chroniques', () => assert.ok(fileNames.length > 0));

test('une seule chronique par jour de publication', () => {
  const dates = fileNames.map((name) => readJson(`../data/women/${name}`).published);
  const repeated = dates.filter((date, index) => dates.indexOf(date) !== index);
  assert.deepEqual(repeated, [], `jours en double : ${repeated.join(', ')}`);
});

for (const fileName of fileNames) {
  test(`chronique ${fileName}`, () => {
    assert.match(fileName, /^[a-z0-9]+(-[a-z0-9]+)*\.json$/, 'nom de fichier en minuscules, sans accent, mots séparés par des tirets');
    const woman = readJson(`../data/women/${fileName}`);
    for (const key of Object.keys(woman)) assert.ok(KNOWN_KEYS.includes(key), `clé inconnue : ${key}`);
    assert.equal(typeof woman.death, 'string', 'death : un texte, vide si elle est vivante');
    for (const key of ['name', 'birth', 'country', 'summary']) {
      assert.equal(typeof woman[key], 'string', `${key} doit être un texte`);
      assert.ok(woman[key].trim(), `${key} est vide`);
    }
    assert.ok(regionIds.includes(woman.region), `région inconnue : ${woman.region}`);
    assert.match(woman.published, FULL_DATE, 'published : date complète AAAA-MM-JJ');
    assert.ok(woman.published >= '2026-01-01', 'published : à partir du 1er janvier 2026');

    assert.ok(Array.isArray(woman.chronicle) && woman.chronicle.length >= 2, 'chronique : au moins deux paragraphes');
    for (const paragraph of woman.chronicle) assert.ok(paragraph.trim(), 'paragraphe vide');

    assert.ok(woman.actions.length >= 2, 'au moins deux actions');
    for (const action of woman.actions) {
      assert.match(action.date, DATE_PATTERN, `date « ${action.date} » : AAAA, AAAA-MM ou AAAA-MM-JJ`);
      assert.ok(themeIds.includes(action.theme), `thème inconnu : ${action.theme}`);
      assert.ok(action.text?.trim(), 'texte d\'action vide');
    }
    const dates = woman.actions.map((action) => action.date);
    assert.ok(isChronological(dates), `actions dans l'ordre chronologique : ${dates.join(', ')}`);

    assert.ok(woman.sources.length, 'au moins une source');
    for (const source of woman.sources) {
      assert.ok(source.title?.trim(), 'source sans titre');
      if (source.url) assert.match(source.url, /^https:\/\//, 'lien de source en https');
      assert.doesNotMatch(source.url ?? '', /wikipedia\.org|wikiwand|grokipedia/, 'Wikipédia n\'est pas une source');
      assert.ok(source.url || source.author, 'une source sans lien cite au moins son auteur');
    }
  });
}
