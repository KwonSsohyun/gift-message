"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./gift-message.module.css";

type CatSpec = {
  width: number;
  height: number;
  delayMs: number;
  reverse?: boolean;
  position: CSSProperties;
};

// Positions/sizes/delays match the original dc.html prototype's 8-cat layout.
const CATS: CatSpec[] = [
  { width: 300, height: 336, delayMs: 0, position: { left: "45%", top: 0, width: "10%" } },
  { width: 300, height: 336, delayMs: 60, reverse: true, position: { left: "23%", top: "4%", width: "11%" } },
  { width: 300, height: 336, delayMs: 120, position: { right: "23%", top: "4%", width: "11%" } },
  { width: 300, height: 336, delayMs: 180, reverse: true, position: { left: "1%", top: "30%", width: "13%" } },
  { width: 300, height: 336, delayMs: 240, position: { right: "1%", top: "30%", width: "13%" } },
  { width: 420, height: 470, delayMs: 300, position: { left: "8%", bottom: 0, width: "16%" } },
  { width: 420, height: 470, delayMs: 360, reverse: true, position: { right: "8%", bottom: 0, width: "16%" } },
  { width: 420, height: 470, delayMs: 200, position: { left: "41%", bottom: 0, width: "18%" } },
];

const SPRITE_W = 420;
const SPRITE_H = 470;

/**
 * Renders the 8 dancing cats using one shared video (green-screen keyed into
 * an offscreen canvas each frame, then blitted to every visible cat canvas).
 */
export function DancingCats() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const targets = Array.from(wrap.querySelectorAll("canvas"));
    if (!targets.length) return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const video = Object.assign(document.createElement("video"), {
      src: `${basePath}/message/cat-dance.mp4`,
      loop: true,
      muted: true,
      playsInline: true,
      autoplay: true,
    });
    video.play().catch(() => {});

    const off = document.createElement("canvas");
    off.width = SPRITE_W;
    off.height = SPRITE_H;
    const ctx = off.getContext("2d", { willReadFrequently: true });

    let crop: { sx: number; sy: number; sw: number; sh: number } | null = null;
    let raf = 0;

    const findCrop = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const cw = 120;
      const ch = Math.max(1, Math.round(vh * (120 / vw)));
      const probe = document.createElement("canvas");
      probe.width = cw;
      probe.height = ch;
      const pctx = probe.getContext("2d", { willReadFrequently: true });
      if (!pctx) return null;
      pctx.drawImage(video, 0, 0, cw, ch);
      const q = pctx.getImageData(0, 0, cw, ch).data;
      let x0 = cw;
      let y0 = ch;
      let x1 = -1;
      let y1 = -1;
      for (let j = 0; j < ch; j++) {
        for (let i = 0; i < cw; i++) {
          const k = (j * cw + i) * 4;
          if (q[k + 1] - Math.max(q[k], q[k + 2]) > 40) continue;
          if (i < x0) x0 = i;
          if (i > x1) x1 = i;
          if (j < y0) y0 = j;
          if (j > y1) y1 = j;
        }
      }
      if (x1 < 0) return null;
      const scale = vw / cw;
      const pad = 6;
      const sx = Math.max(0, (x0 - pad) * scale);
      const sy = Math.max(0, (y0 - pad) * scale);
      const sw = Math.min(vw - sx, (x1 - x0 + 1 + pad * 2) * scale);
      const sh = Math.min(vh - sy, (y1 - y0 + 1 + pad * 2) * scale);
      return sw > 8 && sh > 8 ? { sx, sy, sw, sh } : null;
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!ctx || !video.videoWidth || video.readyState < 2) return;
      if (!crop) {
        crop = findCrop() ?? { sx: 0, sy: 0, sw: video.videoWidth, sh: video.videoHeight };
      }
      const scale = Math.min(SPRITE_W / crop.sw, SPRITE_H / crop.sh);
      const w = crop.sw * scale;
      const h = crop.sh * scale;
      ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);
      ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, (SPRITE_W - w) / 2, SPRITE_H - h, w, h);

      const frame = ctx.getImageData(0, 0, SPRITE_W, SPRITE_H);
      const p = frame.data;
      for (let i = 0; i < p.length; i += 4) {
        if (!p[i + 3]) continue;
        const r = p[i];
        const g = p[i + 1];
        const b = p[i + 2];
        const spill = g - Math.max(r, b);
        if (spill > 48) {
          p[i + 3] = 0;
          continue;
        }
        if (spill > 22) {
          p[i + 3] = Math.round((255 * (48 - spill)) / 26);
          const avg = (r + b) / 2;
          if (g > avg) p[i + 1] = Math.round(avg + (g - avg) * 0.3);
        }
      }
      ctx.putImageData(frame, 0, 0);

      targets.forEach((t) => {
        const canvas = t as HTMLCanvasElement;
        const tc = canvas.getContext("2d");
        if (!tc) return;
        tc.clearRect(0, 0, canvas.width, canvas.height);
        tc.drawImage(off, 0, 0, SPRITE_W, SPRITE_H, 0, 0, canvas.width, canvas.height);
      });
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      video.pause();
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
      {CATS.map((cat, i) => (
        <canvas
          key={i}
          width={cat.width}
          height={cat.height}
          className={styles.catCanvas}
          style={{
            ...cat.position,
            aspectRatio: "15 / 17",
            animationDelay: `${cat.delayMs}ms`,
            animationDirection: cat.reverse ? "reverse" : "normal",
          }}
        />
      ))}
    </div>
  );
}
