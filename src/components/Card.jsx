import React from "react";

export default function Card({ card, onClick, disabled }) {
  const visible = card.open || card.matched;

  return (
    <button
      type="button"
      className={`card ${visible ? "open" : ""} ${card.matched ? "matched" : ""}`}
      onClick={() => onClick(card.id)}
      disabled={disabled || visible}
      aria-label={visible ? `Card ${card.symbol}` : "Hidden memory card"}
    >
      <span className="card-inner">
        <span className="card-face card-back">?</span>
        <span className="card-face card-front">{card.symbol}</span>
      </span>
    </button>
  );
}
