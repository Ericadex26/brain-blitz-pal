export interface QuizCategory {
  id: number;
  name: string;
  icon: string;
}

export interface QuizQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_answers: string[];
}

export interface QuizResult {
  id: string;
  category: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  date: string;
  answers: { question: string; selected: string; correct: string; isCorrect: boolean }[];
}

export const CATEGORIES: QuizCategory[] = [
  { id: 9, name: "General Knowledge", icon: "🧠" },
  { id: 17, name: "Science & Nature", icon: "🔬" },
  { id: 23, name: "History", icon: "📜" },
  { id: 11, name: "Entertainment: Film", icon: "🎬" },
  { id: 18, name: "Computers", icon: "💻" },
  { id: 22, name: "Geography", icon: "🌍" },
  { id: 21, name: "Sports", icon: "⚽" },
  { id: 12, name: "Entertainment: Music", icon: "🎵" },
  { id: 19, name: "Mathematics", icon: "📐" },
  { id: 15, name: "Video Games", icon: "🎮" },
  { id: 20, name: "Mythology", icon: "⚡" },
  { id: 24, name: "Politics", icon: "🏛️" },
];

function decodeHTML(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function fetchQuizQuestions(
  categoryId: number,
  difficulty: string,
  amount: number
): Promise<QuizQuestion[]> {
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch questions");
  const data = await response.json();
  if (data.response_code !== 0) throw new Error("No questions available for this selection");
  
  return data.results.map((q: any) => ({
    ...q,
    question: decodeHTML(q.question),
    correct_answer: decodeHTML(q.correct_answer),
    incorrect_answers: q.incorrect_answers.map(decodeHTML),
    all_answers: shuffleArray([
      decodeHTML(q.correct_answer),
      ...q.incorrect_answers.map(decodeHTML),
    ]),
  }));
}

const HISTORY_KEY = "quizmaster_history";

export function getQuizHistory(): QuizResult[] {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveQuizResult(result: QuizResult): void {
  const history = getQuizHistory();
  history.unshift(result);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function getStats() {
  const history = getQuizHistory();
  if (history.length === 0) return { totalQuizzes: 0, avgScore: 0, bestScore: 0, totalPoints: 0 };
  const scores = history.map((h) => Math.round((h.correctAnswers / h.totalQuestions) * 100));
  return {
    totalQuizzes: history.length,
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    bestScore: Math.max(...scores),
    totalPoints: history.reduce((a, h) => a + h.correctAnswers * 50, 0),
  };
}
