"use client";

import { useEffect, useMemo, useState } from "react";

export default function DailyQuiz({ isLoggedIn }) {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [beanometer, setBeanometer] = useState(null);
  const [error, setError] = useState("");
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceFact, setPracticeFact] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const hasAnswered = Boolean(answer);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    setLoading(true);
    fetch("/api/quiz/daily")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (!active) return;
        setQuestion(data.question);
        setAnswer(data.answer);
        setBeanometer(data.beanometer);
        setPracticeMode(false);
        setPracticeFact("");
        if (data.answer) {
          setSelectedIndex(data.answer.selectedIndex);
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load today’s quiz.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const options = useMemo(() => question?.options || [], [question]);
  const beanPercent = useMemo(() => {
    const count = beanometer?.totalBeans || 0;
    return Math.min(100, count);
  }, [beanometer]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (selectedIndex == null || hasAnswered) return;
    setLoading(true);
    setError("");
    try {
      if (practiceMode) {
        const res = await fetch("/api/quiz/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question?.id, selectedIndex }),
        });
        if (!res.ok) {
          setError("Could not submit your answer.");
          return;
        }
        const data = await res.json();
        const isCorrect = Boolean(data.correct);
        setAnswer({ selectedIndex, correct: isCorrect });
        setPracticeFact(data.fact || "");
        const message = isCorrect
          ? "Good beaning, no beans added to your beanometer as this is just a practice question, have a beany day."
          : "Zero beans for you.";
        setAnnouncement(message);
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.95;
          utterance.pitch = 1.05;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      } else {
        const res = await fetch("/api/quiz/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedIndex }),
        });
        if (!res.ok) {
          setError("Could not submit your answer.");
          return;
        }
        const data = await res.json();
        const isCorrect = Boolean(data.answer?.correct);
        setAnswer(data.answer);
        setBeanometer(data.beanometer);
        const message = isCorrect
          ? "Good beaning, one bean added to your beanometer, have a beany day."
          : "Zero beans for you.";
        setAnnouncement(message);
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.95;
          utterance.pitch = 1.05;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleNewQuestion() {
    if (!isLoggedIn) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quiz/random");
      if (!res.ok) {
        setError("Could not load a new question.");
        return;
      }
      const data = await res.json();
      setQuestion(data.question);
      setAnswer(null);
      setSelectedIndex(null);
      setPracticeMode(true);
      setPracticeFact("");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) return null;

  return (
    <>
      {announcement ? (
        <div className="announcement-overlay" role="status" aria-live="polite">
          <div className="announcement-card">
            <p>{announcement}</p>
            <button
              className="button secondary"
              type="button"
              onClick={() => setAnnouncement("")}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
      <aside className="beanometer">
      <div className="card beanometer-card">
        <span className="pill">Daily Quiz</span>
        <h3>Today’s coffee fact</h3>
        {loading && !question ? <p className="muted">Loading quiz…</p> : null}
        {error ? <p className="error">{error}</p> : null}
        {question ? (
          <form className="quiz-form" onSubmit={handleSubmit}>
            <p className="quiz-question">{question.text}</p>
            <div className="quiz-options">
              {options.map((option, index) => (
                <label
                  key={option}
                  className={
                    selectedIndex === index ? "quiz-option selected" : "quiz-option"
                  }
                >
                  <input
                    type="radio"
                    name="quiz-option"
                    value={index}
                    checked={selectedIndex === index}
                    onChange={() => setSelectedIndex(index)}
                    disabled={hasAnswered}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <button className="button" type="submit" disabled={hasAnswered || selectedIndex == null}>
              {hasAnswered ? "Answered" : "Submit answer"}
            </button>
            {hasAnswered ? (
              <button className="button secondary" type="button" onClick={handleNewQuestion}>
                New question
              </button>
            ) : null}
            {hasAnswered ? (
              <p className={answer.correct ? "success" : "error"}>
                {answer.correct
                  ? practiceMode
                    ? "Correct! Practice round — no beans added."
                    : "Good beaning, one bean added to your beanometer, have a beany day."
                  : "Zero beans for you."}
              </p>
            ) : null}
            {hasAnswered ? (
              <p className="muted">{practiceMode ? practiceFact : question.fact}</p>
            ) : null}
          </form>
        ) : null}
      </div>
      <div className="card beanometer-card">
        <span className="pill">Beanometer</span>
        <h3>Community beans</h3>
        <div className="beanometer-thermo">
          <div className="thermo-tube">
            <div
              className="thermo-fill"
              style={{ height: `${beanPercent}%` }}
            >
              <span className="thermo-count">
                {beanometer?.totalBeans ?? 0}
              </span>
            </div>
          </div>
          <div className="thermo-meta">
            <div className="beanometer-count">
              <span className="bean-count">{beanometer?.totalBeans ?? 0}</span>
              <span className="muted">total beans earned</span>
            </div>
          </div>
        </div>
        <div className="beanometer-leaderboard">
          <h4>Leaderboard</h4>
          {beanometer?.leaderboard?.length ? (
            <ol>
              {beanometer.leaderboard.map((entry) => (
                <li key={entry.user_id}>
                  <span>{entry.label}</span>
                  <strong>{entry.beans_count}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">No scores yet.</p>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
