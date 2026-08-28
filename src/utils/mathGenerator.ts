import { Difficulty, LevelConfig, MathProblem, Operation } from '../types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateProblem(
  difficulty: Difficulty,
  allowedOperations: Operation[] = ['all'],
  levelNumber: number = 1
): MathProblem {
  let ops: ('+' | '-' | '*' | '/')[] = [];

  if (allowedOperations.includes('all')) {
    if (difficulty === 'easy') ops = ['+', '-'];
    else if (difficulty === 'medium') ops = ['+', '-', '*'];
    else ops = ['+', '-', '*', '/'];
  } else {
    if (allowedOperations.includes('add')) ops.push('+');
    if (allowedOperations.includes('subtract')) ops.push('-');
    if (allowedOperations.includes('multiply')) ops.push('*');
    if (allowedOperations.includes('divide')) ops.push('/');
  }

  if (ops.length === 0) ops = ['+'];
  const operator = ops[randomInt(0, ops.length - 1)];

  let expression = '';
  let correctAnswer = 0;
  let explanation = '';
  let operands: number[] = [];
  const operators: string[] = [operator];

  // Logic based on difficulty & operations
  if (difficulty === 'easy') {
    if (operator === '+') {
      const a = randomInt(1, 15);
      const b = randomInt(1, 15);
      correctAnswer = a + b;
      operands = [a, b];
      expression = `${a} + ${b}`;
      explanation = `${a} ga ${b} qo'shilsa = ${correctAnswer} bo'ladi.`;
    } else {
      const a = randomInt(5, 20);
      const b = randomInt(1, a);
      correctAnswer = a - b;
      operands = [a, b];
      expression = `${a} - ${b}`;
      explanation = `${a} dan ${b} ayrilsa = ${correctAnswer} bo'ladi.`;
    }
  } else if (difficulty === 'medium') {
    if (operator === '+') {
      const a = randomInt(10, 60);
      const b = randomInt(10, 60);
      correctAnswer = a + b;
      operands = [a, b];
      expression = `${a} + ${b}`;
      explanation = `${a} + ${b} = (${Math.floor(a/10)*10} + ${Math.floor(b/10)*10}) + (${a%10} + ${b%10}) = ${correctAnswer}`;
    } else if (operator === '-') {
      const a = randomInt(20, 90);
      const b = randomInt(5, a - 5);
      correctAnswer = a - b;
      operands = [a, b];
      expression = `${a} - ${b}`;
      explanation = `${a} - ${b} = ${correctAnswer}`;
    } else if (operator === '*') {
      const a = randomInt(2, 9);
      const b = randomInt(2, 9);
      correctAnswer = a * b;
      operands = [a, b];
      expression = `${a} × ${b}`;
      explanation = `${a} ni ${b} marta ko'paytirganda = ${correctAnswer}`;
    } else {
      const b = randomInt(2, 9);
      const result = randomInt(2, 9);
      const a = b * result;
      correctAnswer = result;
      operands = [a, b];
      expression = `${a} ÷ ${b}`;
      explanation = `${a} ni ${b} ga bo'lganda = ${correctAnswer} (${b} × ${result} = ${a})`;
    }
  } else if (difficulty === 'hard') {
    const isTwoStep = Math.random() > 0.45;
    if (isTwoStep) {
      const stepType = randomInt(1, 3);
      if (stepType === 1) {
        // (a + b) * c
        const a = randomInt(2, 8);
        const b = randomInt(2, 8);
        const c = randomInt(2, 6);
        correctAnswer = (a + b) * c;
        operands = [a, b, c];
        operators.push('*');
        expression = `(${a} + ${b}) × ${c}`;
        explanation = `Avval qavs ichi: ${a} + ${b} = ${a + b}, keyin: ${a + b} × ${c} = ${correctAnswer}`;
      } else if (stepType === 2) {
        // a * b - c
        const a = randomInt(3, 9);
        const b = randomInt(3, 9);
        const c = randomInt(2, 20);
        correctAnswer = (a * b) - c;
        operands = [a, b, c];
        operators.push('-');
        expression = `${a} × ${b} - ${c}`;
        explanation = `Avval ko'paytirish: ${a} × ${b} = ${a * b}, keyin ayirish: ${a * b} - ${c} = ${correctAnswer}`;
      } else {
        // a + b * c
        const a = randomInt(10, 40);
        const b = randomInt(2, 8);
        const c = randomInt(2, 8);
        correctAnswer = a + (b * c);
        operands = [a, b, c];
        operators.push('+');
        expression = `${a} + ${b} × ${c}`;
        explanation = `Avval ko'paytirish: ${b} × ${c} = ${b * c}, keyin: ${a} + ${b * c} = ${correctAnswer}`;
      }
    } else {
      if (operator === '*') {
        const a = randomInt(11, 25);
        const b = randomInt(3, 9);
        correctAnswer = a * b;
        operands = [a, b];
        expression = `${a} × ${b}`;
        explanation = `${a} × ${b} = ${Math.floor(a/10)*10 * b} + ${a%10 * b} = ${correctAnswer}`;
      } else if (operator === '/') {
        const b = randomInt(4, 12);
        const result = randomInt(5, 15);
        const a = b * result;
        correctAnswer = result;
        operands = [a, b];
        expression = `${a} ÷ ${b}`;
        explanation = `${a} ÷ ${b} = ${correctAnswer}`;
      } else {
        const a = randomInt(50, 150);
        const b = randomInt(25, 120);
        if (operator === '+') {
          correctAnswer = a + b;
          operands = [a, b];
          expression = `${a} + ${b}`;
          explanation = `${a} + ${b} = ${correctAnswer}`;
        } else {
          const maxNum = Math.max(a, b);
          const minNum = Math.min(a, b);
          correctAnswer = maxNum - minNum;
          operands = [maxNum, minNum];
          expression = `${maxNum} - ${minNum}`;
          explanation = `${maxNum} - ${minNum} = ${correctAnswer}`;
        }
      }
    }
  } else if (difficulty === 'expert') {
    const multiType = randomInt(1, 4);
    if (multiType === 1) {
      // (a * b) + (c * d)
      const a = randomInt(3, 9);
      const b = randomInt(3, 9);
      const c = randomInt(3, 9);
      const d = randomInt(3, 9);
      correctAnswer = (a * b) + (c * d);
      operands = [a, b, c, d];
      expression = `${a} × ${b} + ${c} × ${d}`;
      explanation = `(${a} × ${b} = ${a*b}) + (${c} × ${d} = ${c*d}) = ${correctAnswer}`;
    } else if (multiType === 2) {
      // a^2 + b
      const a = randomInt(6, 16);
      const b = randomInt(10, 50);
      correctAnswer = (a * a) + b;
      operands = [a, b];
      expression = `${a}² + ${b}`;
      explanation = `${a}² (${a} × ${a} = ${a*a}) + ${b} = ${correctAnswer}`;
    } else if (multiType === 3) {
      // a * b - c * d
      const a = randomInt(5, 12);
      const b = randomInt(5, 12);
      const c = randomInt(2, 6);
      const d = randomInt(2, 6);
      correctAnswer = (a * b) - (c * d);
      operands = [a, b, c, d];
      expression = `${a} × ${b} - ${c} × ${d}`;
      explanation = `(${a * b}) - (${c * d}) = ${correctAnswer}`;
    } else {
      // (a + b) ÷ c
      const c = randomInt(3, 8);
      const quotient = randomInt(4, 15);
      const total = c * quotient;
      const a = randomInt(2, total - 2);
      const b = total - a;
      correctAnswer = quotient;
      operands = [a, b, c];
      expression = `(${a} + ${b}) ÷ ${c}`;
      explanation = `Avval: ${a} + ${b} = ${total}, so'ng: ${total} ÷ ${c} = ${correctAnswer}`;
    }
  } else {
    // Master level
    const type = randomInt(1, 3);
    if (type === 1) {
      const a = randomInt(12, 35);
      const b = randomInt(11, 25);
      correctAnswer = a * b;
      operands = [a, b];
      expression = `${a} × ${b}`;
      explanation = `${a} × ${b} = ${correctAnswer}`;
    } else if (type === 2) {
      const a = randomInt(7, 18);
      const b = randomInt(5, 15);
      const c = randomInt(10, 99);
      correctAnswer = (a * b) + c;
      operands = [a, b, c];
      expression = `${a} × ${b} + ${c}`;
      explanation = `${a * b} + ${c} = ${correctAnswer}`;
    } else {
      const a = randomInt(10, 20);
      const square = a * a;
      const b = randomInt(20, 100);
      correctAnswer = square - b;
      operands = [a, b];
      expression = `${a}² - ${b}`;
      explanation = `${a}² = ${square}, ${square} - ${b} = ${correctAnswer}`;
    }
  }

  // Generate 3 unique distractor options
  const optionSet = new Set<number>([correctAnswer]);
  const possibleDeltas = [-10, 10, -1, 1, -2, 2, -5, 5, -20, 20, -3, 3, -100, 100];
  
  let attempts = 0;
  while (optionSet.size < 4 && attempts < 40) {
    attempts++;
    const delta = possibleDeltas[randomInt(0, possibleDeltas.length - 1)];
    const candidate = correctAnswer + delta;
    if (candidate > 0 || (difficulty === 'master' && candidate !== correctAnswer)) {
      optionSet.add(candidate);
    }
  }

  // Fallback if not enough options
  while (optionSet.size < 4) {
    const fallback = correctAnswer + randomInt(-15, 15);
    if (fallback !== correctAnswer) {
      optionSet.add(fallback);
    }
  }

  const options = shuffleArray(Array.from(optionSet));

  const timeLimits: Record<Difficulty, number> = {
    easy: 15,
    medium: 12,
    hard: 10,
    expert: 8,
    master: 6,
  };

  return {
    id: `prob_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    expression,
    operands,
    operators,
    correctAnswer,
    options,
    explanation,
    level: levelNumber,
    timeLimit: timeLimits[difficulty],
  };
}

export const INITIAL_ADVENTURE_LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: "1-Bosqich: Boshlang'ich qo'shish",
    description: "1 dan 10 gacha bo'lgan sonlarni qo'shish mashqi",
    difficulty: 'easy',
    operations: ['add'],
    targetScore: 500,
    questionsCount: 8,
    timePerQuestion: 15,
    unlocked: true,
    stars: 0,
    highScore: 0,
  },
  {
    level: 2,
    title: "2-Bosqich: Oddiy ayirish",
    description: "1 dan 20 gacha bo'lgan sonlardan ayirish",
    difficulty: 'easy',
    operations: ['subtract'],
    targetScore: 600,
    questionsCount: 8,
    timePerQuestion: 15,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
  {
    level: 3,
    title: "3-Bosqich: Qo'shish va ayirish",
    description: "Qo'shish va ayirish amallari aralash holda",
    difficulty: 'easy',
    operations: ['add', 'subtract'],
    targetScore: 700,
    questionsCount: 10,
    timePerQuestion: 14,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
  {
    level: 4,
    title: "4-Bosqich: Karra jadvali (2-5)",
    description: "2 dan 5 gacha ko'paytirish amallari",
    difficulty: 'medium',
    operations: ['multiply'],
    targetScore: 800,
    questionsCount: 10,
    timePerQuestion: 12,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
  {
    level: 5,
    title: "5-Bosqich: To'liq karra jadvali",
    description: "6 dan 9 gacha barcha ko'paytirish amallari",
    difficulty: 'medium',
    operations: ['multiply'],
    targetScore: 900,
    questionsCount: 10,
    timePerQuestion: 12,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
  {
    level: 6,
    title: "6-Bosqich: Bo'lish asoslari",
    description: "Qoldiqsiz bo'lish amallarini bajarish",
    difficulty: 'medium',
    operations: ['divide'],
    targetScore: 1000,
    questionsCount: 10,
    timePerQuestion: 12,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
  {
    level: 7,
    title: "7-Bosqich: 4 ta asosiy amal",
    description: "+, -, ×, ÷ barcha amallar aralashuvi",
    difficulty: 'medium',
    operations: ['all'],
    targetScore: 1200,
    questionsCount: 12,
    timePerQuestion: 10,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
  {
    level: 8,
    title: "8-Bosqich: Qavsli ifodalar",
    description: "Amallar tartibi va qavslarni yechish",
    difficulty: 'hard',
    operations: ['all'],
    targetScore: 1400,
    questionsCount: 12,
    timePerQuestion: 10,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
  {
    level: 9,
    title: "9-Bosqich: Ikki xonali ko'paytirish",
    description: "Katta sonlar bilan tezkor hisob-kitob",
    difficulty: 'hard',
    operations: ['multiply'],
    targetScore: 1600,
    questionsCount: 12,
    timePerQuestion: 10,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
  {
    level: 10,
    title: "10-Bosqich: Kvadratlar va darajalar",
    description: "Sonlarning kvadratlari va murakkab ifodalar",
    difficulty: 'expert',
    operations: ['all'],
    targetScore: 1800,
    questionsCount: 12,
    timePerQuestion: 9,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
  {
    level: 11,
    title: "11-Bosqich: Ekspert mantiqiy hisob",
    description: "Ko'p bosqichli algebraik ifodalar",
    difficulty: 'expert',
    operations: ['all'],
    targetScore: 2200,
    questionsCount: 15,
    timePerQuestion: 8,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
  {
    level: 12,
    title: "12-Bosqich: Buyuk Matematik Master",
    description: "Chempionlar uchun eng yuqori darajadagi misollar",
    difficulty: 'master',
    operations: ['all'],
    targetScore: 2500,
    questionsCount: 15,
    timePerQuestion: 7,
    unlocked: false,
    stars: 0,
    highScore: 0,
  },
];

export function calculatePoints(
  difficulty: Difficulty,
  timeRemainingPercent: number,
  streak: number
): { base: number; timeBonus: number; streakBonus: number; total: number } {
  const baseScores: Record<Difficulty, number> = {
    easy: 100,
    medium: 150,
    hard: 220,
    expert: 300,
    master: 400,
  };

  const base = baseScores[difficulty];
  const timeBonus = Math.round((base * 0.5) * Math.max(0, timeRemainingPercent));
  const streakBonus = Math.min(streak * 25, base); // max streak bonus
  const total = base + timeBonus + streakBonus;

  return { base, timeBonus, streakBonus, total };
}

export function getRankTitle(totalScore: number): string {
  if (totalScore < 1000) return "Yosh Hisobchi 🌟";
  if (totalScore < 3000) return "Matematika Shogirdi 📐";
  if (totalScore < 6000) return "Hisob-kitob Ustasi 🧠";
  if (totalScore < 12000) return "Aqliy Chempion ⚡";
  if (totalScore < 20000) return "Katta Matematik 🏆";
  if (totalScore < 35000) return "Professor 🎓";
  return "Arximed Vorisi (Grandmaster) 👑";
}
