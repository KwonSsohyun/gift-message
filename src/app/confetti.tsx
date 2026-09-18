"use client";

import type { CSSProperties } from "react";
import styles from "./gift-message.module.css";

const COLORS = ["#FFE6A7", "#FF9EBE", "#A8DCD1", "#D9CBF5", "#E4658E", "#FFFFFF"];
const NOTE_CHARS = ["♪", "♫", "♬", "♩"];
const NOTE_LEFT = ["16%", "38%", "60%", "80%"];

export function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = [...COLORS, ...COLORS, ...COLORS];

  return (
    <>
      {pieces.map((color, i) => {
        const angle = (i / 18) * Math.PI * 2 + 0.2;
        const dist = 150 + (i % 4) * 58;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        return (
          <span
            key={i}
            className={styles.confettiPiece}
            style={
              {
                width: i % 2 ? 13 : 9,
                height: i % 2 ? 13 : 18,
                borderRadius: i % 2 ? "50%" : 3,
                background: color,
                animationDuration: `${950 + (i % 5) * 170}ms`,
                animationDelay: `${i * 18}ms`,
                "--tx": `${tx}px`,
                "--ty": `${ty}px`,
              } as CSSProperties
            }
          />
        );
      })}
    </>
  );
}

export function MusicNotes({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <>
      {NOTE_CHARS.map((note, i) => (
        <span
          key={i}
          className={styles.musicNote}
          style={{
            left: NOTE_LEFT[i],
            top: 110 + (i % 2) * 26,
            fontSize: 30 + (i % 3) * 8,
            animationDuration: `${1600 + i * 300}ms`,
            animationDelay: `${i * 380}ms`,
          }}
        >
          {note}
        </span>
      ))}
    </>
  );
}
