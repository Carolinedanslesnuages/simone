<script setup>
import { pages } from '../data.js';
import { formatDate } from '../format.js';

const firstPage = pages[0];
const lastPage = pages[pages.length - 1];
</script>

<template>
  <div class="cover">
    <div class="cover-label">
      <h1 class="page-title" tabindex="-1">Le carnet de Simone</h1>
      <p><span class="label-field">Matière :</span> les droits des femmes</p>
      <p><span class="label-field">Classe :</span> toutes les époques, tous les pays</p>
      <p><span class="label-field">Contenu :</span> {{ pages.length }} chroniques</p>
    </div>
    <p class="cover-intro">
      Elles ont obtenu le droit de voter, d'étudier, de travailler, de disposer de leur corps.
      Une femme par double page, une chronique de temps en temps, sans ordre imposé :
      on feuillette.
    </p>
    <p v-if="firstPage" class="cover-actions">
      <a class="button" :href="`#/page/${firstPage.slug}`">Ouvrir le carnet</a>
      <a :href="`#/page/${lastPage.slug}`">Dernière chronique : {{ lastPage.name }}, le {{ formatDate(lastPage.published) }}</a>
    </p>
  </div>
</template>
