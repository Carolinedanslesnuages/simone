// Journey and RGAA checks in Chromium. Run by "npm run test:browser", site served on port 4173.
// Fails when a check fails. axe-core does not replace the manual RGAA method: see README.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SITE_URL = process.env.URL || 'http://localhost:4173/';
const AXE_SOURCE = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const AXE_RULES = { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] };
const results = [];
const check = (criterion, passed, message) => {
  results.push(passed);
  console.log(`${passed ? '✅' : '❌'} ${criterion} · ${message}`);
};

const browser = await chromium.launch();

async function axeViolations(page) {
  await page.addScriptTag({ content: AXE_SOURCE });
  const report = await page.evaluate((rules) => window.axe.run(document, rules), AXE_RULES);
  return report.violations.map((violation) => `${violation.id} (${violation.nodes.length})`);
}

// First published page, read from the home page's "Ouvrir le carnet" link.
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
await page.goto(SITE_URL);
await page.waitForSelector('h1');
const firstPageHash = await page.getAttribute('a.open-link', 'href');
check('accueil', /^#\/page\/[a-z0-9-]+$/.test(firstPageHash ?? ''), `« Ouvrir le carnet » mène à ${firstPageHash}`);

for (const colorScheme of ['light', 'dark']) {
  const themed = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme, reducedMotion: 'reduce' });
  for (const hash of ['#/', firstPageHash, '#/sommaire', '#/a-propos']) {
    await themed.goto(SITE_URL + hash);
    await themed.waitForSelector('h1');
    const violations = await axeViolations(themed);
    check('axe', violations.length === 0, `${hash} (${colorScheme}) sans erreur axe${violations.length ? ' : ' + violations.join(', ') : ''}`);
    if (colorScheme === 'dark') continue;
    check('8.6', /^(Simone|.+ · Simone)$/.test(await themed.title()), `${hash} : titre de page « ${await themed.title()} »`);
    check('9.1', (await themed.locator('h1').count()) === 1, `${hash} : un seul titre de niveau 1`);
  }
  await themed.close();
}

// 12.7 skip link.
await page.goto(SITE_URL);
await page.waitForSelector('h1');
await page.keyboard.press('Tab');
check('12.7', (await page.evaluate(() => document.activeElement.textContent)) === 'Aller au contenu', 'premier Tab : « Aller au contenu »');
await page.keyboard.press('Enter');
check('12.7', (await page.evaluate(() => document.activeElement.id)) === 'contenu', 'le lien mène au contenu');

// Turning the pages: link, then arrow keys; focus goes to the new page title.
await page.click('a.open-link');
await page.waitForSelector('.sheet-left h1');
const firstName = await page.textContent('h1');
check('12', (await page.evaluate(() => document.activeElement.tagName)) === 'H1', 'en ouvrant le carnet, le focus est sur le nom');
check('pages', (await page.locator('.sheet').count()) === 2, 'une femme par double page');
check('dates', (await page.locator('time[datetime]').count()) >= 3, 'date de la chronique et des actions dans des balises <time>');
const pageCount = Number((await page.textContent('.page-number')).match(/sur (\d+)/)[1]);
if (pageCount > 1) {
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction((name) => document.querySelector('h1')?.textContent !== name, firstName);
  check('clavier', (await page.textContent('h1')) !== firstName, 'flèche droite : page suivante');
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction((name) => document.querySelector('h1')?.textContent === name, firstName);
  check('clavier', (await page.textContent('h1')) === firstName, 'flèche gauche : retour');
}

// Contents: search with a short status message.
await page.goto(SITE_URL + '#/sommaire');
await page.waitForSelector('h1');
const total = await page.locator('.contents > li').count();
check('sommaire', total === pageCount, `le sommaire liste les ${pageCount} chroniques`);
await page.fill('#search', firstName.split(' ')[0]);
const found = await page.locator('.contents > li').count();
check('7.5', found >= 1 && /^\d+ chroniques?$/.test(await page.textContent('[role=status]')), `recherche : ${found} chronique(s), message de statut`);

// Unknown page.
await page.goto(SITE_URL + '#/page/inconnue');
await page.waitForSelector('h1');
check('erreur', (await page.textContent('h1')) === 'Page introuvable', 'page inconnue : page introuvable');

// 10.11 reflow at 320 px, 10.4 text at 200 %.
const narrow = await browser.newPage({ viewport: { width: 320, height: 640 }, reducedMotion: 'reduce' });
for (const hash of ['#/', firstPageHash, '#/sommaire']) {
  await narrow.goto(SITE_URL + hash);
  await narrow.waitForSelector('h1');
  const overflow = await narrow.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('10.11', overflow <= 0, `${hash} à 320 px : pas de défilement horizontal`);
}
await narrow.setViewportSize({ width: 640, height: 640 });
await narrow.goto(SITE_URL + firstPageHash);
await narrow.addStyleTag({ content: 'html { font-size: 200% }' });
check('10.4', (await narrow.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0, 'texte à 200 % : rien ne déborde');

await browser.close();
const failures = results.filter((passed) => !passed).length;
console.log(failures ? `\n${failures} vérification(s) en échec` : `\nToutes les vérifications passent (${results.length})`);
process.exit(failures ? 1 : 0);
