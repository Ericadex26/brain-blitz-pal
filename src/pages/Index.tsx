import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Brain, Trophy, TrendingUp, ChevronRight, Zap } from "lucide-react";
import { CATEGORIES, getQuizHistory, getStats } from "@/lib/quiz-api";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const history = getQuizHistory();
  const stats = getStats();

  const filtered = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground">Dex Quiz</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="quiz-card px-3 py-1.5 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{stats.totalPoints}</span>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-5 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search quizzes, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Daily Challenge Banner */}
      <div className="px-5 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-hero rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-3 left-4">
            <span className="bg-success text-success-foreground text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Live Now
            </span>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-display font-bold text-primary-foreground mb-1">Daily Challenge</h2>
            <p className="text-primary-foreground/80 text-sm mb-1">Test your knowledge today!</p>
            <div className="flex items-center gap-1.5 mb-4">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-warning text-sm font-medium">Win 50 bonus points</span>
            </div>
            <button
              onClick={() => navigate("/quiz-setup?category=9&difficulty=medium&amount=10")}
              className="bg-white/95 text-background font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white transition-colors"
            >
              Start Now
            </button>
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="px-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-foreground">Categories</h2>
          <span className="text-primary text-sm font-medium">{filtered.length} topics</span>
        </div>
        {filtered.length === 0 ? (
          <div className="quiz-card p-8 text-center">
            <p className="text-muted-foreground">No topics match "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/quiz-setup?category=${cat.id}`)}
                className="quiz-card-hover p-4 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl mb-3">
                  {cat.icon}
                </div>
                <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">Quiz</p>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {stats.totalQuizzes > 0 && (
        <div className="px-5 mb-8">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Your Stats</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="quiz-card p-4 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{stats.avgScore}%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Score</p>
            </div>
            <div className="quiz-card p-4 text-center">
              <Trophy className="w-5 h-5 text-warning mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{stats.bestScore}%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Best</p>
            </div>
            <div className="quiz-card p-4 text-center">
              <Brain className="w-5 h-5 text-success mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{stats.totalQuizzes}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Quizzes</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {history.length > 0 && (
        <div className="px-5">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="quiz-card flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-foreground text-sm">{h.category}</p>
                  <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${Math.round((h.correctAnswers / h.totalQuestions) * 100) >= 70 ? "text-success" : "text-destructive"}`}>
                    {Math.round((h.correctAnswers / h.totalQuestions) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">+{h.correctAnswers * 50} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
