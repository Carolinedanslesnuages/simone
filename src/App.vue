<script setup>
import { computed, nextTick, watch } from 'vue';
import { route } from './router.js';
import { pages } from './data.js';
import CoverPage from './pages/CoverPage.vue';
import NotebookPage from './pages/NotebookPage.vue';
import ContentsPage from './pages/ContentsPage.vue';
import AboutPage from './pages/AboutPage.vue';
import NotFoundPage from './pages/NotFoundPage.vue';

const pageIndex = computed(() => (route.value.name === 'page'
  ? pages.findIndex((woman) => woman.slug === route.value.slug) : -1));

const viewName = computed(() => (route.value.name === 'page' && pageIndex.value < 0 ? 'notFound' : route.value.name));

const viewTitle = computed(() => ({
  cover: 'Simone',
  page: pages[pageIndex.value]?.name,
  contents: 'Sommaire',
  about: 'À propos',
  notFound: 'Page introuvable',
}[viewName.value]));

const navigation = [
  { name: 'cover', href: '#/', label: 'Accueil' },
  { name: 'contents', href: '#/sommaire', label: 'Sommaire' },
  { name: 'about', href: '#/a-propos', label: 'À propos' },
];

/** Skip link: focus the main content without changing the hash (the hash holds the page). */
function skipToContent(event) {
  event.preventDefault();
  document.getElementById('contenu').focus();
}

// RGAA 12.x: on each new view, update the title, go to the top and move focus to the view title.
watch(route, async () => {
  await nextTick();
  window.scrollTo(0, 0);
  document.querySelector('.page-title')?.focus();
});
watch(viewTitle, (title) => { document.title = title === 'Simone' ? title : `${title} · Simone`; }, { immediate: true });
</script>

<template>
  <a class="skip-link" href="#contenu" @click="skipToContent">Aller au contenu</a>
  <header class="site-header">
    <p class="site-name"><a href="#/">Simone</a></p>
    <nav aria-label="Menu principal">
      <ul>
        <li v-for="item in navigation" :key="item.name">
          <a :href="item.href" :aria-current="item.name === viewName ? 'page' : null">{{ item.label }}</a>
        </li>
      </ul>
    </nav>
  </header>
  <main id="contenu" tabindex="-1">
    <CoverPage v-if="viewName === 'cover'" />
    <NotebookPage v-else-if="viewName === 'page'" :index="pageIndex" />
    <ContentsPage v-else-if="viewName === 'contents'" />
    <AboutPage v-else-if="viewName === 'about'" />
    <NotFoundPage v-else />
  </main>
  <footer class="site-footer">
    <p>
      Chaque chronique est sourcée. Une erreur, un oubli ?
      <a href="https://github.com/Carolinedanslesnuages/simone">Proposez une correction sur GitHub</a>.
    </p>
  </footer>
</template>
