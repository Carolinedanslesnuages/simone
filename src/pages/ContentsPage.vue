<script setup>
import { computed, ref } from 'vue';
import { pages } from '../data.js';
import { formatDate, normalize } from '../format.js';

const query = ref('');

/** Pages grouped by month of publication, filtered by the search words. */
const months = computed(() => {
  const words = normalize(query.value).split(/\s+/).filter(Boolean);
  const groups = new Map();
  pages.forEach((woman, index) => {
    const haystack = normalize([woman.name, woman.country, woman.summary].join(' '));
    if (!words.every((word) => haystack.includes(word))) return;
    const month = formatDate(woman.published.slice(0, 7));
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month).push({ woman, pageNumber: index + 1 });
  });
  return [...groups].map(([label, entries]) => ({ label, entries }));
});

const count = computed(() => months.value.reduce((total, month) => total + month.entries.length, 0));
</script>

<template>
  <div class="sheet sheet-single">
    <h1 class="page-title" tabindex="-1">Sommaire</h1>
    <form class="search" role="search" @submit.prevent>
      <label for="search">Chercher un nom, un pays…</label>
      <input id="search" v-model="query" type="search" autocomplete="off">
    </form>
    <p class="count" role="status">{{ count === 0 ? 'Aucune chronique trouvée' : `${count} chronique${count > 1 ? 's' : ''}` }}</p>
    <section v-for="(month, monthIndex) in months" :key="month.label" :aria-labelledby="`mois-${monthIndex}`">
      <h2 :id="`mois-${monthIndex}`">{{ month.label }}</h2>
      <ul class="contents">
        <li v-for="entry in month.entries" :key="entry.woman.slug">
          <a :href="`#/page/${entry.woman.slug}`">{{ entry.woman.name }}</a>
          <span class="contents-meta">{{ entry.woman.country }} · page {{ entry.pageNumber }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
