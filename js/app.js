import { el } from './ui.js';
import { getProfile, resetAll } from './store.js';
import { renderDashboard } from './views/dashboard.js';
import { renderBasics } from './views/basics.js';
import { renderPersonality } from './views/personality.js';
import { renderFitness } from './views/fitness.js';
import { renderFinance } from './views/finance.js';
import { renderCognition } from './views/cognition.js';
import { renderCareer } from './views/career.js';
import { renderLanguages } from './views/languages.js';
import { renderRelationships } from './views/relationships.js';
import { renderGoals } from './views/goals.js';

const ROUTES = [
  { path: '#/', label: 'Synthesis', render: renderDashboard, section: 'Overview', done: () => false },
  { path: '#/potential', label: 'Potential & plans', render: renderGoals, section: 'Overview', done: () => false },
  { path: '#/basics', label: 'Basics', render: renderBasics, section: 'Profile', done: (p) => !!p.basics?.age },
  { path: '#/personality', label: 'Personality', render: renderPersonality, section: 'Profile', done: (p) => !!p.personality },
  { path: '#/fitness', label: 'Fitness', render: renderFitness, section: 'Profile', done: (p) => !!p.fitness },
  { path: '#/finance', label: 'Finances', render: renderFinance, section: 'Profile', done: (p) => !!p.finance },
  { path: '#/cognition', label: 'Cognition', render: renderCognition, section: 'Profile', done: (p) => !!(p.cognition?.battery || (p.cognition?.digitSpan && p.cognition?.reactionMs)) },
  { path: '#/career', label: 'Career', render: renderCareer, section: 'Profile', done: (p) => !!p.career },
  { path: '#/languages', label: 'Languages', render: renderLanguages, section: 'Profile', done: (p) => !!p.languages?.list?.length },
  { path: '#/relationships', label: 'Relationships', render: renderRelationships, section: 'Profile', done: (p) => !!p.relationships },
];

const navEl = document.getElementById('nav');
const viewEl = document.getElementById('view');

function currentRoute() {
  const hash = location.hash || '#/';
  return ROUTES.find((r) => r.path === hash) || ROUTES[0];
}

function renderNav() {
  const profile = getProfile();
  const route = currentRoute();
  navEl.replaceChildren();
  let lastSection = null;
  for (const r of ROUTES) {
    if (r.section !== lastSection) {
      navEl.append(el('div', { class: 'nav-section' }, r.section));
      lastSection = r.section;
    }
    navEl.append(el('a', { href: r.path, class: r === route ? 'active' : '' },
      el('span', {}, r.label),
      r.done(profile) ? el('span', { class: 'done' }, '✓') : null));
  }
}

function render() {
  renderNav();
  viewEl.replaceChildren(currentRoute().render(render));
}

window.addEventListener('hashchange', () => {
  render();
  viewEl.scrollTop = 0;
});

document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('Delete all profile data from this browser? This cannot be undone.')) {
    resetAll();
    location.hash = '#/';
    render();
  }
});

render();
