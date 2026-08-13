// Shared SVG radar chart. Used by the main dashboard and by each module's
// "breakdown" card, so every section shows the sub-dimensions behind its score.

import { el } from './ui.js';

export function radarChart(points, { size = 430 } = {}) {
  const cx = size / 2, cy = size / 2, radius = size * 0.3;
  const n = points.length;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];

  for (const frac of [0.25, 0.5, 0.75, 1]) {
    const ring = document.createElementNS(svgNS, 'polygon');
    ring.setAttribute('points', points.map((_, i) => pt(i, radius * frac).join(',')).join(' '));
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', '#e3e6ea');
    svg.append(ring);
  }
  points.forEach((p, i) => {
    const [x, y] = pt(i, radius);
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', x); line.setAttribute('y2', y);
    line.setAttribute('stroke', '#e3e6ea');
    svg.append(line);

    const [lx, ly] = pt(i, radius + size * 0.055);
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', lx); text.setAttribute('y', ly);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', Math.max(10, size / 36));
    text.setAttribute('fill', '#5b6675');
    text.textContent = `${p.label} ${Math.round(p.value)}`;
    svg.append(text);
  });
  const clampPct = (v) => Math.max(0, Math.min(100, v));
  const poly = document.createElementNS(svgNS, 'polygon');
  poly.setAttribute('points', points.map((p, i) => pt(i, (radius * clampPct(p.value)) / 100).join(',')).join(' '));
  poly.setAttribute('fill', 'rgba(37, 99, 235, 0.18)');
  poly.setAttribute('stroke', '#2563eb');
  poly.setAttribute('stroke-width', '2');
  svg.append(poly);

  points.forEach((p, i) => {
    const [x, y] = pt(i, (radius * clampPct(p.value)) / 100);
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', Math.max(2.5, size / 120));
    dot.setAttribute('fill', '#2563eb');
    svg.append(dot);
  });

  return el('div', { class: 'radar-wrap' }, svg);
}

// Convenience: a "breakdown" radar card body for a module — renders only when
// at least 3 sub-dimensions have values.
export function breakdownRadar(subscores, { size = 360 } = {}) {
  const points = subscores.filter((s) => s.value !== null && s.value !== undefined && !Number.isNaN(s.value));
  if (points.length < 3) return null;
  return radarChart(points, { size });
}
