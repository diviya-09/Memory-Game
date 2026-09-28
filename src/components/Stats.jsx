import React from "react";

export default function Stats({ score, moves, lives, time, matched, total }) {
  const items = [
    ["⭐", score, "Score"],
    ["🎯", moves, "Moves"],
    ["❤️", lives, "Lives"],
    ["⏱️", `${time}s`, "Time"],
    ["🧩", `${matched}/${total}`, "Pairs"],
  ];

  return (
    <div className="stats">
      {items.map(([icon, value, label]) => (
        <div className="stat-card" key={label}>
          <span className="stat-icon">{icon}</span>
          <strong>{value}</strong>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}
