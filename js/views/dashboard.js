import { el, card, traitBar, statCard } from '../ui.js';
import { getProfile } from '../store.js';
import { computeScores, getRecommendations, DOMAIN_LABELS, COMPONENT_LABELS } from '../synthesis.js';
import { TRAITS } from '../data/ipip.js';
import { matchFigures, BASIS_LABELS } from '../data/figures.js';
import { radarChart } from '../radar.js';
import { drawShareCard } from '../sharecard.js';
import { buildAiPrompt } from '../aiprompt.js';

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
    container.replaceChildren(
      el('div', { class: 'hero' },
        el('h3', {}, 'Profile everything about yourself. Then improve it.'),
        el('p', {}, 'Validated personality and cognition tests, fitness and finance benchmarks, relationships, languages, well-being, and more — synthesized into one honest picture with evidence-based plans.'),
        el('p', {}, 'Everything runs in your browser. Nothing is ever uploaded, tracked, or sent to a server.'),
        el('a', { class: 'btn', href: '#/basics' }, 'Start with the basics →')),
      card('How it works',
        el('p', { style: 'font-size:0.92rem;' },
          '1. Work through the modules in the menu — each takes 2-10 minutes, in any order. ',
          '2. Your synthesis appears here: composite score, radar, strengths and gaps. ',
          '3. Get science-grounded recommendations, quantified plans, and your closest matches among 256 historical figures.'),
        el('p', { class: 'hint' },
          'Where a validated instrument exists we use it (IPIP Big Five, ICAR-format cognitive items, UCLA-3 loneliness scale, Satisfaction With Life Scale, Cooper test). Where it doesn\'t, we say so plainly.')));
    return container;
  }

  // Composite score
  if (scores.composite) {
    const comp = scores.composite;
    const componentKeys = [...Object.keys(DOMAIN_LABELS), 'personalityAssets']
      .filter((k) => scores[k] !== null && scores[k] !== undefined);
    container.append(card('Composite score',
      el('div', { class: 'stat-grid' },
        statCard({
          label: 'Overall', value: `${comp.score}`,
          sub: `out of 100 — from ${comp.components} of ${comp.total} components`,
          tone: comp.score >= 60 ? 'good' : comp.score >= 40 ? 'ok' : 'bad',
        })),
      el('div', { style: 'margin-top:0.9rem;' },
        componentKeys.map((k) => traitBar({
          name: COMPONENT_LABELS[k], value: scores[k],
          tone: scores[k] >= 60 ? 'good' : scores[k] >= 40 ? 'ok' : 'bad',
        }))),
      el('p', { class: 'hint' },
        'Equal-weighted mean of your completed components. "Personality assets" covers only the aspects with broadly positive outcomes across contexts — conscientiousness, emotional stability, and honesty-humility; the rest of personality stays ungraded because its optima depend on your goals. One number can\'t capture a life — treat this as a progress gauge, not a verdict.')));
  }

  // Radar of scored domains
  if (completed.length >= 3) {
    container.append(card('Domain overview',
      radarChart(completed.map((d) => ({ label: DOMAIN_LABELS[d], value: scores[d] }))),
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

  // Profile twins: matched on every completed dimension — Big Five traits
  // plus each finished life domain.
  const userDomains = Object.fromEntries(
    Object.keys(DOMAIN_LABELS).map((k) => [k, scores[k]]));
  const twinResult = matchFigures(scores.personalityTraits, userDomains, 5);
  if (twinResult) {
    container.append(card('You are most like…',
      el('p', { class: 'hint', style: 'margin-bottom:0.8rem;' },
        `Your top matches from 256 historical figures, across ${twinResult.dimensions} dimensions of your profile — Big Five traits plus every life domain you have completed. Finish more modules to sharpen the match.`),
      twinResult.matches.map((m, i) =>
        el('div', { class: 'rec', style: i === 0 ? '' : 'opacity:0.85;' },
          el('div', { class: 'rec-domain' },
            `${m.similarity}% profile similarity · their composite: ${m.composite}/100`),
          el('p', {}, el('strong', {}, m.name), ` (${m.era}) — ${m.tag}`),
          el('p', { class: 'rec-why' }, m.note),
          el('p', { class: 'rec-why', style: 'opacity:0.75;' }, BASIS_LABELS[m.basis]))),
      el('p', { class: 'hint' },
        'For fun. Personalities use published historiometric estimates (expert presidential ratings, Rubenzer & Faschingbauer 2004; cognitive estimates, Cox 1926); life domains are coarse bands from documented biography — "spoke nine languages", "died in debt", "boxed daily". Scholarly guesses about people who never took the tests: entertainment with footnotes, not science. Living people are excluded because no published estimates exist.')));
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

  // Shareable summary card
  if (completed.length >= 2) {
    const canvas = el('canvas');
    const t = scores.personalityTraits;
    const traitsSummary = t
      ? `Big Five: E${t.E} A${t.A} C${t.C} S${t.N} O${t.O}`
      : null;
    drawShareCard(canvas, {
      composite: scores.composite,
      scores,
      domains: completed,
      twin: twinResult?.matches?.[0] ?? null,
      traitsSummary,
    });
    const downloadBtn = el('button', {
      class: 'btn',
      onclick: () => {
        canvas.toBlob((blob) => {
          const a = el('a', { href: URL.createObjectURL(blob), download: 'my-profileme.png' });
          a.click();
          URL.revokeObjectURL(a.href);
        }, 'image/png');
      },
    }, 'Download image');
    container.append(card('Share your profile',
      el('div', { class: 'share-preview' }, canvas),
      el('div', { style: 'text-align:center; margin-top:0.8rem;' }, downloadBtn),
      el('p', { class: 'hint', style: 'text-align:center;' },
        'A square summary image for social media. It contains only what you see above — share it wherever you like. Politics is never included.')));
  }

  // Prompt for AI agents
  if (completed.length >= 2 || hasPersonality) {
    const promptText = buildAiPrompt(profile, scores);
    const ta = el('textarea', {
      readonly: true,
      style: 'width:100%; height:220px; font-family:ui-monospace, monospace; font-size:0.72rem;'
        + 'border:1px solid var(--border); border-radius:8px; padding:0.7rem; background:var(--bg); color:var(--text); resize:vertical;',
    });
    ta.value = promptText;
    const copyNote = el('span', { class: 'progress-note', style: 'margin-left:0.8rem; display:none;' }, 'Copied ✓');
    const copyBtn = el('button', {
      class: 'btn',
      onclick: async () => {
        try {
          await navigator.clipboard.writeText(promptText);
        } catch {
          ta.select();
          document.execCommand('copy');
        }
        copyNote.style.display = 'inline';
        setTimeout(() => { copyNote.style.display = 'none'; }, 2000);
      },
    }, 'Copy prompt');
    container.append(card('Prompt for AI agents',
      el('p', { class: 'hint', style: 'margin-bottom:0.6rem;' },
        `Your entire profile — every result, score, grade, and the app's own analysis (${Math.round(promptText.length / 1000)}k characters) — packaged as one prompt. Paste it into any capable AI (Claude, ChatGPT, Gemini…) for a deep personalized read: a summary of who you are, strengths and weaknesses, predictions about how you come across and where you're heading, and prioritized advice.`),
      ta,
      el('div', { style: 'margin-top:0.7rem;' }, copyBtn, copyNote),
      el('p', { class: 'hint' },
        'Includes everything you\'ve completed — politics too, since this prompt is for your own private use. Remember that whatever you paste into an AI service is governed by that service\'s privacy policy.')));
  }

  return container;
}
