export const QUESTION_POOL = [
  {
    id: 'q1',
    category: 'Nutrition',
    question: 'How many grams of fiber should an average adult aim to eat each day?',
    options: ['5–10 grams', '15–20 grams', '25–38 grams', '50–60 grams'],
    answer: 2,
  },
  {
    id: 'q2',
    category: 'Sleep',
    question: 'What is the recommended amount of sleep per night for most adults?',
    options: ['3–4 hours', '5–6 hours', '7–9 hours', '10–12 hours'],
    answer: 2,
  },
  {
    id: 'q3',
    category: 'Fitness',
    question: 'How many minutes of moderate-intensity activity per week does the WHO recommend?',
    options: ['30 minutes', '75 minutes', '150 minutes', '300 minutes'],
    answer: 2,
  },
  {
    id: 'q4',
    category: 'Nutrition',
    question: 'What portion of your plate should be filled with fruits and vegetables?',
    options: ['One-quarter', 'One-third', 'Half', 'Three-quarters'],
    answer: 2,
  },
  {
    id: 'q5',
    category: 'Wellness',
    question: 'Roughly how many glasses of water should an adult drink daily?',
    options: ['2 glasses', '4 glasses', '8 glasses', '15 glasses'],
    answer: 2,
  },
  {
    id: 'q6',
    category: 'Fitness',
    question: 'How often is strength training recommended each week?',
    options: ['Never', 'Once a month', 'At least twice a week', 'Every single day'],
    answer: 2,
  },
  {
    id: 'q7',
    category: 'Nutrition',
    question: 'Which of these is considered a fermented food?',
    options: ['White bread', 'Yogurt', 'Apple juice', 'Boiled rice'],
    answer: 1,
  },
  {
    id: 'q8',
    category: 'Wellness',
    question: 'A safe weight-loss pace is generally considered to be about…',
    options: ['0.5–2 lbs per week', '5–7 lbs per week', '10 lbs per week', 'No safe limit'],
    answer: 0,
  },
  {
    id: 'q9',
    category: 'Sleep',
    question: 'Which habit best supports good sleep hygiene?',
    options: [
      'Bright screens before bed',
      'Consistent sleep & wake times',
      'Heavy meals at midnight',
      'Late-evening coffee',
    ],
    answer: 1,
  },
  {
    id: 'q10',
    category: 'Nutrition',
    question: 'Which of these is a good daily serving target for fruit?',
    options: ['0 servings', '2–3 servings', '8–10 servings', 'Only on weekends'],
    answer: 1,
  },
  {
    id: 'q11',
    category: 'Fitness',
    question: 'A simple daily step target many wellness programs use is around…',
    options: ['1,000 steps', '3,000 steps', '8,000–10,000 steps', '25,000 steps'],
    answer: 2,
  },
  {
    id: 'q12',
    category: 'Wellness',
    question: 'Added sugar should ideally stay below what share of daily calories?',
    options: ['Around 10%', 'Around 30%', 'Around 50%', 'No limit'],
    answer: 0,
  },
];

export function pickRandomQuestions(count = 5) {
  const shuffled = [...QUESTION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
