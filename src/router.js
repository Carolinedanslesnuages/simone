import { ref } from 'vue';

// Minimal hash router: "#/" (cover), "#/page/<slug>", "#/sommaire", "#/a-propos".
// Hashes that do not start with "#/" are ignored, so in-page anchors keep the current page.

function parse(hash) {
  const path = hash.startsWith('#/') ? hash.slice(1) : '/';
  const pageMatch = path.match(/^\/page\/([a-z0-9-]+)\/?$/);
  if (pageMatch) return { name: 'page', slug: pageMatch[1] };
  if (path === '/sommaire') return { name: 'contents' };
  if (path === '/a-propos') return { name: 'about' };
  if (path === '/' || path === '') return { name: 'cover' };
  return { name: 'notFound' };
}

export const route = ref(parse(location.hash));

window.addEventListener('hashchange', () => {
  if (location.hash && !location.hash.startsWith('#/')) return;
  route.value = parse(location.hash);
});
