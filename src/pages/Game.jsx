import React, { useCallback, useEffect, useState } from "react";
import useGame from "../hooks/useGame";
import useTimer from "../hooks/useTimer";
import { makeDeck } from "../utils/game";
import Card from "../components/Card";
import Stats from "../components/Stats";

export default function Game() {
  const { level, setLevel, settings, player, record } = useGame();

  // Game state
  const [deck, setDeck] = useState(() => makeDeck(level));
  const [pick, setPick] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(settings.lives);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Reset the complete game
  const reset = useCallback(() => {
    setDeck(makeDeck(level));
    setPick([]);
    setMoves(0);
    setScore(0);
    setLives(settings.lives);
    setPaused(false);
    setOver(false);

    // This forces the timer to restart
    setResetKey((key) => key + 1);
  }, [level, settings.lives]);

  // Reset the game whenever difficulty or lives setting changes
  useEffect(() => {
    reset();
  }, [reset]);

  // Finish the game
  const finish = useCallback(
    (finalScore = score) => {
      if (over) return;

      setOver(true);
      setPaused(false);

      record({
        player,
        level,
        score: finalScore,
        moves,
        date: new Date().toISOString(),
      });
    },
    [over, record, player, level, score, moves]
  );

  // Timer
  const time = useTimer(
    settings.time,
    !paused && !over,
    finish,
    resetKey
  );

  // Check whether all cards have been matched
  useEffect(() => {
    if (deck.length && deck.every((card) => card.matched)) {
      finish(score);
    }
  }, [deck, finish, score]);

  // Card click
  function click(id) {
    // Don't allow clicks when:
    // - game is paused
    // - game is over
    // - two cards are already selected
    if (paused || over || pick.length === 2) return;

    const card = deck.find((item) => item.id === id);

    // Don't allow clicking invalid, matched or already-open cards
    if (!card || card.matched || card.open) return;

    const next = [...pick, card];

    // Open selected card
    setDeck((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, open: true }
          : item
      )
    );

    setPick(next);

    // Wait for second card
    if (next.length !== 2) return;

    // Increase moves
    setMoves((value) => value + 1);

    // Check for match
    if (next[0].symbol === next[1].symbol) {
      setDeck((current) =>
        current.map((item) =>
          item.symbol === card.symbol
            ? {
                ...item,
                matched: true,
                open: true,
              }
            : item
        )
      );

      // Add score
      setScore((value) => value + 100 + time);

      // Clear selected cards
      setPick([]);

      return;
    }

    // Wrong match
    const nextLives = lives - 1;
    const nextScore = Math.max(0, score - 25);

    setLives(nextLives);
    setScore(nextScore);

    // Close cards after short delay
    setTimeout(() => {
      setDeck((current) =>
        current.map((item) =>
          item.id === next[0].id ||
          item.id === next[1].id
            ? {
                ...item,
                open: false,
              }
            : item
        )
      );

      setPick([]);

      // Game over when lives reach zero
      if (nextLives <= 0) {
        finish(nextScore);
      }
    }, 550);
  }

  // Change difficulty
  function handleLevelChange(event) {
    setLevel(event.target.value);
  }

  return (
    <main className="page game-page">

      {/* ================= HEADER ================= */}

      <section className="game-header">
        <div>
          <p className="eyebrow">MEMORY CHALLENGE</p>

          <h1>Memory Match</h1>

          <p className="game-subtitle">
            Welcome,{" "}
            <strong>{player || "Player"}</strong>.
            Match every pair before your lives run out.
          </p>
        </div>

        <div className="game-actions">

          {/* Difficulty */}
          <label className="select-wrap">
            <span>Difficulty</span>

            <select
              value={level}
              onChange={handleLevelChange}
              disabled={over}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>

          {/* Pause / Resume */}
          <button
            className="secondary-btn"
            onClick={() =>
              setPaused((value) => !value)
            }
            disabled={over}
          >
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>

          {/* Restart */}
          <button
            className="restart-btn"
            onClick={reset}
            type="button"
          >
            ↻ Restart
          </button>
        </div>
      </section>

      {/* ================= STATS ================= */}

      <Stats
        score={score}
        moves={moves}
        lives={lives}
        time={time}
        matched={
          deck.filter((card) => card.matched).length / 2
        }
        total={deck.length / 2}
      />

      {/* ================= GAME PANEL ================= */}

      <section className="game-panel">

        <div className="board-title-row">

          <div>
            <h2>
              {paused
                ? "Game Paused"
                : over
                ? "Round Complete"
                : "Find the matching pairs"}
            </h2>

            <p>
              {paused
                ? "Take a break. Resume whenever you are ready."
                : "Click two cards to reveal them. Try to remember their positions."}
            </p>
          </div>

          <span className="difficulty-badge">
            {level}
          </span>
        </div>

        {/* Game Board */}
        <div
          className={`board ${
            paused ? "paused" : ""
          } level-${level.toLowerCase()}`}
        >
          {deck.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={click}
              disabled={
                pick.length === 2 ||
                paused ||
                over
              }
            />
          ))}
        </div>

        {/* Pause Message */}
        {paused && (
          <div className="pause-note">
            ⏸ Game paused
          </div>
        )}
      </section>

      {/* ================= RESULT MODAL ================= */}

      {over && (
        <div
          className="result"
          role="dialog"
          aria-modal="true"
        >
          <div className="result-card">

            <div className="result-icon">
              {deck.every(
                (card) => card.matched
              )
                ? "🏆"
                : "💪"}
            </div>

            <p className="eyebrow">
              ROUND FINISHED
            </p>

            <h2>
              {deck.every(
                (card) => card.matched
              )
                ? "You Won!"
                : "Game Over"}
            </h2>

            <p className="result-message">
              {deck.every(
                (card) => card.matched
              )
                ? "Excellent memory! You matched every pair."
                : "Almost there. Restart and try to beat your score."}
            </p>

            <div className="result-score">
              {score}
              <span>points</span>
            </div>

            <div className="result-actions">

              {/* Play Again */}
              <button
                className="primary"
                onClick={reset}
                type="button"
              >
                Play Again
              </button>

              {/* Change Difficulty */}
              <button
                className="secondary-btn"
                onClick={() => {
                  const nextLevel =
                    level === "Easy"
                      ? "Medium"
                      : level === "Medium"
                      ? "Hard"
                      : "Easy";

                  setLevel(nextLevel);
                }}
                type="button"
              >
                Change Difficulty
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}
