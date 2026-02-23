import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bookmark, ChevronRight } from "lucide-react";
import { fetchQuizQuestions, saveQuizResult, CATEGORIES, type QuizQuestion } from "@/lib/quiz-api";

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = Number(searchParams.get("category")) || 9;
  const difficulty = searchParams.get("difficulty") || "medium";
  const amount = Number(searchParams.get("amount")) || 10;

  const category = CATEGORIES.find((c) => c.id === categoryId);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{ question: string; selected: string; correct: string; isCorrect: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    fetchQuizQuestions(categoryId, difficulty, amount)
      .then(setQuestions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [categoryId, difficulty, amount]);

  useEffect(() => {
    if (loading || error || questions.length === 0) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [loading, error, questions]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleSubmit = useCallback(() => {
    if (!selectedAnswer || !currentQuestion) return;
    setSubmitted(true);
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    setAnswers((prev) => [
      ...prev,
      { question: currentQuestion.question, selected: selectedAnswer, correct: currentQuestion.correct_answer, isCorrect },
    ]);
  }, [selectedAnswer, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      const finalAnswers = [...answers];
      const result = {
        id: Date.now().toString(),
        category: category?.name || "Unknown",
        difficulty,
        totalQuestions: questions.length,
        correctAnswers: finalAnswers.filter((a) => a.isCorrect).length,
        timeTaken: timer,
        date: new Date().toISOString(),
        answers: finalAnswers,
      };
      saveQuizResult(result);
      navigate(`/results?id=${result.id}`);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    }
  }, [currentIndex, questions, answers, category, difficulty, timer, navigate]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion) return;
    setAnswers((prev) => [
      ...prev,
      { question: currentQuestion.question, selected: "Skipped", correct: currentQuestion.correct_answer, isCorrect: false },
    ]);
    handleNext();
  }, [currentQuestion, handleNext]);

  const mins = Math.floor(timer / 60).toString().padStart(2, "0");
  const secs = (timer % 60).toString().padStart(2, "0");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="quiz-card p-8 text-center max-w-sm w-full">
          <p className="text-destructive font-semibold mb-2">Oops!</p>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <button onClick={() => navigate("/home")} className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const answerLetters = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <button onClick={() => navigate("/home")} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h1 className="font-display font-bold text-foreground text-base">{category?.name}</h1>
        <Bookmark className="w-6 h-6 text-muted-foreground" />
      </header>

      {/* Progress */}
      <div className="px-5 mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground uppercase tracking-wider font-semibold">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-primary font-semibold">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Timer */}
      <div className="flex justify-center gap-3 mb-6">
        <div className="quiz-card px-5 py-2.5 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{mins}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Minutes</p>
        </div>
        <span className="text-2xl text-muted-foreground self-start mt-2">:</span>
        <div className="quiz-card px-5 py-2.5 text-center border-primary/30">
          <p className="text-2xl font-display font-bold text-foreground">{secs}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Seconds</p>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="quiz-card p-6 mb-6 bg-gradient-to-b from-secondary/50 to-card">
              <p className="text-lg font-display font-semibold text-foreground leading-relaxed text-center">
                {currentQuestion.question}
              </p>
            </div>

            {/* Answers */}
            <div className="space-y-3 mb-6">
              {currentQuestion.all_answers.map((answer, i) => {
                let borderClass = "border-border";
                if (submitted) {
                  if (answer === currentQuestion.correct_answer) borderClass = "border-success bg-success/10";
                  else if (answer === selectedAnswer) borderClass = "border-destructive bg-destructive/10";
                } else if (answer === selectedAnswer) {
                  borderClass = "border-primary glow-border";
                }

                return (
                  <button
                    key={answer}
                    onClick={() => !submitted && setSelectedAnswer(answer)}
                    disabled={submitted}
                    className={`quiz-card w-full p-4 flex items-center gap-3 text-left transition-all ${borderClass}`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {answerLetters[i]}
                    </span>
                    <span className="text-sm font-medium text-foreground">{answer}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="px-5 pb-8 pt-4 flex gap-3">
        <button
          onClick={handleSkip}
          className="quiz-card py-3.5 px-6 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="flex-1 gradient-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Answer <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <motion.button
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={handleNext}
            className="flex-1 gradient-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"} <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
