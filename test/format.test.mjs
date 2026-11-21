import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatSchoolDate, isChronological, lifespan, normalize, publishedChronicles, splitChronicle } from '../src/format.js';

test('formatDate écrit les dates en français', () => {
  assert.equal(formatDate('1975-01-17'), '17 janvier 1975');
  assert.equal(formatDate('1944-04-01'), '1er avril 1944');
  assert.equal(formatDate('1893-09'), 'septembre 1893');
  assert.equal(formatDate('1405'), '1405');
});

test('formatSchoolDate écrit la date comme au tableau', () => {
  assert.equal(formatSchoolDate('2026-02-03'), 'Mardi 3 février 2026');
  assert.equal(formatSchoolDate('2026-01-01'), 'Jeudi 1er janvier 2026');
});

test('normalize retire accents et majuscules', () => assert.equal(normalize('Élisabeth'), 'elisabeth'));

test('lifespan', () => {
  assert.equal(lifespan({ birth: '1927', death: '2017' }), '1927 – 2017');
  assert.equal(lifespan({ birth: '1997', death: '' }), 'née en 1997');
});

test('isChronological compare seulement la précision commune', () => {
  assert.ok(isChronological(['1792', '1793-06', '1793', '1793-11-08']));
  assert.ok(!isChronological(['1793-11', '1793-06']));
});

test('publishedChronicles garde les chroniques déjà parues, dans l\'ordre de parution', () => {
  const women = [
    { name: 'B', published: '2026-03-02' },
    { name: 'A', published: '2026-01-05' },
    { name: 'C', published: '2026-12-25' },
  ];
  assert.deepEqual(publishedChronicles(women, '2026-11-21').map((woman) => woman.name), ['A', 'B']);
});

test('splitChronicle partage la chronique entre les deux pages', () => {
  const paragraphs = ['a'.repeat(200), 'b'.repeat(200), 'c'.repeat(200), 'd'.repeat(200)];
  const halves = splitChronicle(paragraphs);
  assert.deepEqual([...halves.left, ...halves.right], paragraphs, 'aucun paragraphe perdu, ordre gardé');
  assert.ok(halves.left.length >= 1 && halves.right.length >= 1, 'du texte sur chaque page');
  assert.equal(halves.left.length, 2);
  assert.deepEqual(splitChronicle(['seul']), { left: ['seul'], right: [] });
});
