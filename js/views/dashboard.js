import { el, card, traitBar } from '../ui.js';
import { getProfile } from '../store.js';
import { computeScores, getRecommendations, DOMAIN_LABELS } from '../synthesis.js';
import { TRAITS } from '../data/ipip.js';

export function renderDashboard() {
  const profile = getProfile();
  const scores = computeScores(profile);

  const domains = Object.keys(DOMAIN_LABELS);
  const completed = domains.filter((d) => scores[d] !== null && scores[d] !== undefined);
  const hasPersonality = !!scores.personalityTraits;

  const container = el('div', {},
    el('h2', {}, 'Your synthesis'),
    el('p', { class: 'view-intro' },
      `${completed.length + (hasPersonality ? 1 : 0)} of ${domains.length + 1} domains profiled. The more you complete, the sharper the picture.`));

  if (completed.length === 0 && !hasPersonality) {
    container.append(card('Get started',
      el('p', {}, 'Nothing profiled yet. Set your ', el('a', { href: '#/basics' }, 'basics'), ' first, then work through the modules in the sidebar. Each takes 2-10 minutes.')));
    return container;
  }

  // Radar of scored domains
  if (completed.length >= 3) {
    container.append(card('Domain overview',
      el('div', { class: 'radar-wrap' }, radarChart(completed.map((d) => ({ label: DOMAIN_LABELS[d], value: scores[d] })))),
      el('p', { class: 'hint' }, 'Domain scores are benchmark-based (0-100). Personality is shown separately below — traits are a profile, not a grade.')));
  } else {
    container.append(card('Domain scores',
      completed.length
        ? completed.map((d) => traitBar({
            name: DOMAIN_LABELS[d], value: scores[d],
            tone: scores[d] >= 60 ? 'good' : scores[d] >= 40 ? 'ok' : 'bad',
          }))
        : el('p', { class: 'empty-note' }, 'Complete scored modules (fitness, finances…) to see domain scores.'),
      el('p', { class: 'hint' }, 'Complete at least 3 scored domains to unlock the radar chart.')));
  }

  if (completed.length >= 2) {
    const ranked = [...completed].sort((a, b) => scores[b] - scores[a]);
    const strongest = ranked[0], weakest = ranked[ranked.length - 1];
    container.append(card('Analysis',
      el('p', {},
        'Strongest domain: ', el('strong', {}, DOMAIN_LABELS[strongest]), ` (${Math.round(scores[strongest])}/100). `,
        'Biggest opportunity: ', el('strong', {}, DOMAIN_LABELS[weakest]), ` (${Math.round(scores[weakest])}/100).`),
      el('p', { class: 'hint' },
        'Improvement compounds fastest in your weakest domain — marginal gains there usually matter more than pushing a strength from 80 to 85.')));
  }

  if (hasPersonality) {
    const t = scores.personalityTraits;
    container.append(card('Personality profile',
      Object.keys(TRAITS).map((k) => traitBar({ name: TRAITS[k], value: t[k] }))));
  }

  const recs = getRecommendations(profile, scores);
  container.append(card('Recommendations',
    recs.length
      ? recs.map((r) =>
          el('div', { class: 'rec' },
            el('div', { class: 'rec-domain' }, r.domain),
            el('p', {}, r.text),
            el('p', { class: 'rec-why' }, `Why: ${r.why}`)))
      : el('p', { class: 'empty-note' },
          'No flags raised by your current data — either things look solid, or there is not enough profiled yet to say.'),
    el('p', { class: 'hint' },
      'Each recommendation is rule-based and triggered by your actual data, with the supporting evidence stated. This is guidance, not medical, psychological, or financial advice.')));

  return container;
}

// Minimal SVG radar chart, no dependencies.
function radarChart(points) {
  const size = 430, cx = size / 2, cy = size / 2, radius = 130;
  const n = points.length;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];

  // grid rings
  for (const frac of [0.25, 0.5, 0.75, 1]) {
    const ring = document.createElementNS(svgNS, 'polygon');
    ring.setAttribute('points', points.map((_, i) => pt(i, radius * frac).join(',')).join(' '));
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', '#e3e6ea');
    svg.append(ring);
  }
  // spokes + labels
  points.forEach((p, i) => {
    const [x, y] = pt(i, radius);
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', x); line.setAttribute('y2', y);
    line.setAttribute('stroke', '#e3e6ea');
    svg.append(line);

    const [lx, ly] = pt(i, radius + 24);
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', lx); text.setAttribute('y', ly);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', '12');
    text.setAttribute('fill', '#5b6675');
    text.textContent = `${p.label} ${Math.round(p.value)}`;
    svg.append(text);
  });
  // data polygon
  const poly = document.createElementNS(svgNS, 'polygon');
  poly.setAttribute('points', points.map((p, i) => pt(i, (radius * Math.max(0, Math.min(100, p.value))) / 100).join(',')).join(' '));
  poly.setAttribute('fill', 'rgba(37, 99, 235, 0.18)');
  poly.setAttribute('stroke', '#2563eb');
  poly.setAttribute('stroke-width', '2');
  svg.append(poly);

  points.forEach((p, i) => {
    const [x, y] = pt(i, (radius * Math.max(0, Math.min(100, p.value))) / 100);
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', '3.5');
    dot.setAttribute('fill', '#2563eb');
    svg.append(dot);
  });

  return svg;
}
