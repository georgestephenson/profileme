// Chronotype (morningness-eveningness): 5 original items in the style of the
// Horne-Ostberg MEQ. Chronotype is a PROFILE, not a grade — larks and owls are
// both normal biology; what matters is aligning your schedule to it.

export const CHRONO_ITEMS = [
  {
    id: 'c1', text: 'If you were entirely free to plan your day, when would you get up?',
    options: [
      { points: 5, label: 'Before 6:00' },
      { points: 4, label: '6:00-7:30' },
      { points: 3, label: '7:30-9:00' },
      { points: 2, label: '9:00-10:30' },
      { points: 1, label: 'After 10:30' },
    ],
  },
  {
    id: 'c2', text: 'When would you naturally go to bed?',
    options: [
      { points: 5, label: 'Before 21:30' },
      { points: 4, label: '21:30-22:45' },
      { points: 3, label: '22:45-00:15' },
      { points: 2, label: '00:15-1:30' },
      { points: 1, label: 'After 1:30' },
    ],
  },
  {
    id: 'c3', text: 'How alert do you feel in the first half hour after waking?',
    options: [
      { points: 5, label: 'Very alert' },
      { points: 4, label: 'Fairly alert' },
      { points: 3, label: 'Somewhat groggy' },
      { points: 2, label: 'Groggy' },
      { points: 1, label: 'Barely functional' },
    ],
  },
  {
    id: 'c4', text: 'At what time of day do you do your best, most demanding work?',
    options: [
      { points: 5, label: 'Early morning' },
      { points: 4, label: 'Late morning' },
      { points: 3, label: 'Early afternoon' },
      { points: 2, label: 'Late afternoon / evening' },
      { points: 1, label: 'Late at night' },
    ],
  },
  {
    id: 'c5', text: 'If you had two hours of hard physical work, when would you choose to do it?',
    options: [
      { points: 5, label: '8:00-10:00' },
      { points: 4, label: '10:00-13:00' },
      { points: 3, label: '13:00-16:00' },
      { points: 2, label: '16:00-19:00' },
      { points: 1, label: '19:00-22:00' },
    ],
  },
];

// answers {itemId: points} -> { total 5-25, type }
export function scoreChronotype(answers) {
  let total = 0;
  for (const item of CHRONO_ITEMS) {
    const a = answers[item.id];
    if (!a) return null;
    total += a;
  }
  const type = total >= 21 ? 'Definite morning type ("lark")'
    : total >= 17 ? 'Moderate morning type'
    : total >= 12 ? 'Intermediate type'
    : total >= 8 ? 'Moderate evening type'
    : 'Definite evening type ("owl")';
  return { total, type };
}

export function chronotypeAdvice(result) {
  if (result.total >= 17) {
    return 'Schedule your hardest work in the morning, protect an early bedtime, and treat late-evening commitments as the exception. Your willpower and focus peak early — spend them there.';
  }
  if (result.total >= 12) {
    return 'You have scheduling flexibility most people lack. Anchor a consistent wake time and place deep work in late morning to early afternoon, your most reliable window.';
  }
  return 'Fighting an evening chronotype with brute-force early alarms mostly produces sleep debt. Where possible, shift demanding work to the afternoon/evening, keep wake time consistent (even weekends), and get bright light soon after waking to stop your rhythm drifting later.';
}
