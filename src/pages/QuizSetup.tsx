import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Gauge, Hash, Layers } from "lucide-react";
import { CATEGORIES } from "@/lib/quiz-api";

const difficulties = [
  { value: "easy", label: "Easy", color: "text-success" },
  { value: "medium", label: "Medium", color: "text-warning" },
  { value: "hard", label: "Hard", color: "text-destructive" },
];

const amounts = [5, 10, 15, 20];

const QuizSetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedCategory = Number(searchParams.get("category")) || CATEGORIES[0].id;

  const [categoryId, setCategoryId] = useState(preselectedCategory);
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "medium");
  const [amount, setAmount] = useState(Number(searchParams.get("amount")) || 10);

  const category = CATEGORIES.find((c) => c.id === categoryId);

  const handleStart = () => {
    navigate(`/quiz?category=${categoryId}&difficulty=${difficulty}&amount=${amount}`);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-6 pb-8">
      <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Quiz Setup</h1>
        <p className="text-muted-foreground text-sm mb-8">Configure your quiz before starting</p>

        {/* Category Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold text-foreground">Category</label>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`quiz-card p-3 text-left transition-all ${
                  categoryId === cat.id ? "border-primary glow-border" : "hover:border-border/80"
                }`}
              >
                <span className="text-lg mr-2">{cat.icon}</span>
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold text-foreground">Difficulty</label>
          </div>
          <div className="flex gap-3">
            {difficulties.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`quiz-card flex-1 py-3 text-center transition-all ${
                  difficulty === d.value ? "border-primary glow-border" : ""
                }`}
              >
                <span className={`text-sm font-semibold ${d.color}`}>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Number of Questions */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold text-foreground">Questions</label>
          </div>
          <div className="flex gap-3">
            {amounts.map((n) => (
              <button
                key={n}
                onClick={() => setAmount(n)}
                className={`quiz-card flex-1 py-3 text-center transition-all ${
                  amount === n ? "border-primary glow-border" : ""
                }`}
              >
                <span className="text-sm font-bold text-foreground">{n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="w-full gradient-primary text-primary-foreground font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 animate-pulse-glow"
        >
          Start Quiz
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default QuizSetup;
