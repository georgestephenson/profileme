// Renders the shareable profile summary as a 1080x1080 PNG (canvas), suitable
// for social media. Contains only what the user chooses to share by posting it.

import { DOMAIN_LABELS } from './synthesis.js';

export function drawShareCard(canvas, { composite, scores, domains, twin, traitsSummary }) {
  const S = 1080;
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, '#1d4ed8');
  grad.addColorStop(1, '#0f2a80');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '600 40px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('My ProfileMe', 70, 100);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '400 30px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Know yourself, systematically', 70, 145);

  // Composite
  if (composite) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 190px -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(String(composite.score), 70, 360);
    const w = ctx.measureText(String(composite.score)).width;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '600 44px -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('/100 composite', 80 + w, 360);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '400 28px -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`from ${composite.components} of ${composite.total} life domains`, 70, 405);
  }

  // Domain bars
  const barX = 70, barW = S - 340, barH = 26, gap = 62;
  let y = composite ? 490 : 260;
  ctx.font = '600 30px -apple-system, "Segoe UI", Roboto, sans-serif';
  for (const d of domains) {
    const v = scores[d];
    if (v === null || v === undefined) continue;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(DOMAIN_LABELS[d], barX, y - 12);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    roundRect(ctx, barX, y, barW, barH, 13);
    ctx.fillStyle = v >= 60 ? '#4ade80' : v >= 40 ? '#fbbf24' : '#f87171';
    roundRect(ctx, barX, y, Math.max(barH, barW * (Math.min(100, v) / 100)), barH, 13);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(String(Math.round(v)), barX + barW + 30, y + 24);
    y += gap;
    if (y > 870) break;
  }

  // Twin + traits line
  let footY = 930;
  if (twin) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '600 34px -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Most like: ${twin.name} (${twin.similarity}%)`, 70, footY - 60);
  }
  if (traitsSummary) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '400 28px -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(traitsSummary, 70, footY - (twin ? 15 : 60));
  }

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(70, footY + 20, S - 140, 2);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 38px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('geosona.com/profileme', 70, footY + 80);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '400 26px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('private by design — data never leaves your browser', S - 70, footY + 80);
  ctx.textAlign = 'left';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
