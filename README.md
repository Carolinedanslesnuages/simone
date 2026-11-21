# Simone

Chroniques de femmes qui ont fait avancer les droits des femmes, dans un carnet d'écolière.

**Site : https://carolinedanslesnuages.github.io/simone/**

Le nom rend hommage à Simone de Beauvoir, qui écrit *Le Deuxième Sexe* en 1949, et à Simone Veil,
qui fait voter en 1975 la loi sur l'interruption volontaire de grossesse.

## Le carnet

- **Une femme par double page** : sa chronique commence sous son nom, à gauche, et continue à
  droite, avec ses sources. Sur un petit écran, les deux pages se suivent.
- **L'accueil** : simplement « Simone », et un lien pour ouvrir le carnet.
- **On tourne les pages** avec les liens ou les flèches du clavier. L'animation disparaît si le
  système demande de réduire les mouvements.
- **Pas d'ordre imposé** : les chroniques paraissent de temps en temps, dans le désordre de
  l'histoire, comme dans un carnet que l'on remplit. Chacune porte sa date, écrite comme au
  tableau : « Mardi 3 février 2026 ».
- **Un sommaire** classe les chroniques par mois de parution, avec une recherche.

Partout dans le monde et à toutes les époques : voter, étudier, travailler, être payée autant,
disposer de son corps, vivre sans violence. Les femmes qui ont surtout voulu renverser un pouvoir
ont leur propre carnet : [Séverine](https://github.com/Carolinedanslesnuages/severine).

## Les sources

Chaque fait vient d'une source citée dans la chronique : notice du Maitron, encyclopédie, site
d'institution (parlement, musée, Fondation Nobel, Nations unies), livre d'historienne ou
d'historien. Wikipédia sert à repérer une piste, jamais de source (le test le refuse).

## Ajouter une chronique

Une chronique = un fichier `data/women/<identifiant>.json` (minuscules, sans accents, tirets) :

```json
{
  "name": "Simone Veil",
  "birth": "1927",
  "death": "2017",
  "country": "France",
  "region": "europe",
  "published": "2026-11-26",
  "summary": "Une phrase courte.",
  "chronicle": ["Premier paragraphe.", "Deuxième paragraphe."],
  "actions": [
    { "date": "1974-11-26", "theme": "corps", "text": "Ce qu'elle a fait, en une ou deux phrases." }
  ],
  "sources": [
    { "title": "Titre de la page (Institution)", "url": "https://…" }
  ]
}
```

- `published` : jour de parution (`AAAA-MM-JJ`), un seul par jour. Une chronique datée dans le
  futur reste cachée jusqu'à ce jour-là (le site est reconstruit chaque nuit).
- `death` : vide (`""`) si elle est vivante.
- `region` : [data/regions.json](data/regions.json) ; `theme` : [data/themes.json](data/themes.json).
- `actions` : ses actions datées (`AAAA`, `AAAA-MM` ou `AAAA-MM-JJ`, dans l'ordre
  chronologique). Elles ne s'affichent pas : elles servent à vérifier la chronique et à
  rechercher.
- Une source sans lien cite au moins son auteur.

`npm test` vérifie toutes les chroniques.

## Développer

Il faut Node.js 20 ou plus récent.

```sh
npm install
npm run dev            # site local
npm test               # chroniques et fonctions
npm run build && npm run preview &
npm run test:browser   # parcours et accessibilité dans Chromium
```

Vue 3 et Vite, sans autre dépendance. Chaque push sur `main` vérifie les chroniques, construit le
site, contrôle le parcours et l'accessibilité (RGAA 4.1.2 : titres, lien d'évitement, focus,
flèches du clavier, message de statut, reflow à 320 px, texte à 200 %, axe-core en clair et en
sombre), puis publie sur GitHub Pages. Ces contrôles automatiques ne remplacent pas un audit RGAA
complet.

## Licence

[MIT](LICENSE).
