import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Trophy, CheckCircle2, XCircle, Clock, RotateCcw, Eye } from "lucide-react";
import { getQuizHistory } from "@/lib/quiz-api";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resultId = searchParams.get("id");
  const [showReview, setShowReview] = useState(false);

  const result = useMemo(() => {
    return getQuizHistory().find((r) => r.id === resultId);
  }, [resultId]);

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="quiz-card p-8 text-center">
          <p className="text-muted-foreground mb-4">Result not found</p>
          <button onClick={() => navigate("/home")} className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const scorePercent = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const mins = Math.floor(result.timeTaken / 60).toString().padStart(2, "0");
  const secs = (result.timeTaken % 60).toString().padStart(2, "0");
  const wrong = result.totalQuestions - result.correctAnswers;

  const getMessage = () => {
    if (scorePercent >= 90) return "Outstanding!";
    if (scorePercent >= 70) return "Great Job!";
    if (scorePercent >= 50) return "Good Effort!";
    return "Keep Practicing!";
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <button onClick={() => navigate("/home")} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h1 className="font-display font-bold text-foreground">Quiz Results</h1>
        <div className="w-6" />
      </header>

      {!showReview ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5">
          <div className="flex justify-center mb-4 mt-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-foreground text-center mb-1">{getMessage()}</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            You've completed the "{result.category}" Quiz
          </p>

          <div className="flex justify-center mb-8">
            <div className="relative score-circle">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
                <motion.circle
                  cx="100" cy="100" r={radius} fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span className="text-4xl font-display font-bold text-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                  {scorePercent}%
                </motion.span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Final Score</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="quiz-card p-4 text-center">
              <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Correct</p>
              <p className="text-xl font-bold text-foreground">{result.correctAnswers}</p>
            </div>
            <div className="quiz-card p-4 text-center">
              <XCircle className="w-5 h-5 text-destructive mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Wrong</p>
              <p className="text-xl font-bold text-foreground">{wrong}</p>
            </div>
            <div className="quiz-card p-4 text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Time</p>
              <p className="text-xl font-bold text-foreground">{mins}:{secs}</p>
            </div>
          </div>

          <button onClick={() => setShowReview(true)} className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mb-3">
            <Eye className="w-4 h-4" /> Review Answers
          </button>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="flex-1 quiz-card py-3.5 text-center font-semibold text-sm text-primary flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button onClick={() => navigate("/home")} className="flex-1 quiz-card py-3.5 text-center font-semibold text-sm text-foreground">
              Home
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5">
          <button onClick={() => setShowReview(false)} className="text-primary text-sm font-semibold mb-4 flex items-center gap-1">
            ← Back to Summary
          </button>
          <div className="space-y-3">
            {result.answers.map((a, i) => (
              <div key={i} className={`quiz-card p-4 border-l-4 ${a.isCorrect ? "border-l-success" : "border-l-destructive"}`}>
                <p className="text-sm font-semibold text-foreground mb-2">{i + 1}. {a.question}</p>
                {!a.isCorrect && <p className="text-xs text-destructive mb-1">Your answer: {a.selected}</p>}
                <p className="text-xs text-success">Correct: {a.correct}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Results;
