"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import styles from "./gift-message.module.css";
import { DancingCats } from "./dancing-cats";
import { Confetti, MusicNotes } from "./confetti";
import { createJazzPlayer, type JazzPlayer } from "./jazz";

type Step = "form" | "share" | "gift";
type Phase = "box" | "burst" | "text";

const PANEL_OUTER: CSSProperties = {
  width: "100%",
  maxWidth: 760,
  background: "#C9CCD4",
  border: "3px solid #2A2A2A",
  borderRadius: 4,
  padding: 5,
  boxShadow: "6px 6px 0 rgba(0,0,0,0.35)",
};

function CatBanner({
  message,
  showCaret,
  imageSize = 78,
  fontSize = 26,
  padding = "22px 26px",
}: {
  message: string;
  showCaret?: boolean;
  imageSize?: number;
  fontSize?: number;
  padding?: string;
}) {
  return (
    <div style={PANEL_OUTER}>
      <div
        style={{
          background: "linear-gradient(#FDFDFD 0%, #EDEDF0 55%, #DCDCE2 100%)",
          border: "2px solid #6E6E78",
          padding,
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/message/dancing-cat.png`}
          alt="고양이"
          width={imageSize}
          height={Math.round(imageSize * (87 / 78))}
          style={{ flex: "none", width: imageSize, height: Math.round(imageSize * (87 / 78)) }}
        />
        <div className={styles.pixelFont} style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize, color: "#1C1C1C", letterSpacing: -0.5, lineHeight: 1.45 }}>
            {message}
          </span>
        </div>
        {showCaret && (
          <span className={styles.caret} style={{ alignSelf: "flex-end", fontSize: 22, color: "#3A3A3A" }}>
            ▼
          </span>
        )}
      </div>
    </div>
  );
}

function GiftBoxGraphic({ lidFlying }: { lidFlying?: boolean }) {
  return (
    <div
      style={{
        width: 148,
        height: 122,
        background: "#E4658E",
        borderRadius: 14,
        boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 22, marginLeft: -11, background: "#FFE6A7" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 22, marginTop: -11, background: "#FFE6A7" }} />
      <div
        className={lidFlying ? styles.giftLid : undefined}
        style={{
          position: "absolute",
          left: "50%",
          top: -28,
          marginLeft: -44,
          width: 88,
          height: 36,
          border: "10px solid #FFE6A7",
          borderRadius: "44px 44px 6px 6px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function SkyBackground({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        boxSizing: "border-box",
        overflow: "hidden",
        background: "linear-gradient(#2E77C4 0%, #5C9FD8 34%, #93C6EC 56%, #C6E1F5 63%, #DCEAF6 66%)",
      }}
    >
      <div className={styles.cloud} style={{ left: "4%", top: "9%", width: 250, height: 52, filter: "blur(11px)", animationDuration: "34s", animationDirection: "alternate" }} />
      <div className={styles.cloud} style={{ left: "50%", top: "5%", width: 320, height: 60, background: "rgba(255,255,255,0.75)", filter: "blur(13px)", animationDuration: "46s", animationDirection: "alternate-reverse" }} />
      <div className={styles.cloud} style={{ left: "22%", top: "24%", width: 200, height: 34, background: "rgba(255,255,255,0.6)", filter: "blur(10px)", animationDuration: "58s", animationDirection: "alternate" }} />
      <div className={styles.cloud} style={{ left: "70%", top: "20%", width: 170, height: 30, background: "rgba(255,255,255,0.5)", filter: "blur(9px)", animationDuration: "52s", animationDirection: "alternate-reverse" }} />

      <div style={{ position: "absolute", left: "-14%", right: "-14%", bottom: "-26%", height: "74%", borderRadius: "50% 50% 0 0 / 44% 44% 0 0", background: "linear-gradient(#8DC24A 0%, #6BAB34 36%, #4C8D22 74%, #3B7419 100%)" }} />
      <div style={{ position: "absolute", left: "-24%", right: "38%", bottom: "-32%", height: "60%", borderRadius: "50% 50% 0 0 / 52% 52% 0 0", background: "linear-gradient(#9BCD55 0%, #6FAF36 100%)", opacity: 0.92 }} />
      <div style={{ position: "absolute", left: "46%", right: "-26%", bottom: "-30%", height: "52%", borderRadius: "50% 50% 0 0 / 50% 50% 0 0", background: "linear-gradient(#85BC44 0%, #5FA02C 100%)", opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "18%", background: "linear-gradient(rgba(38,92,20,0) 0%, rgba(28,70,14,0.6) 100%)" }} />

      {children}
    </div>
  );
}

export default function GiftMessagePage() {
  const [step, setStep] = useState<Step>("form");
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("");
  const [phase, setPhase] = useState<Phase>("box");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const timersRef = useRef<number[]>([]);
  const [jazz] = useState<JazzPlayer>(() => createJazzPlayer());

  useEffect(() => {
    // The shared message link only exists in the URL hash, which isn't
    // knowable during server render — this has to run client-side on mount.
    const match = /[#&?]g=([^&]+)/.exec(window.location.hash || "");
    if (!match) return;
    try {
      const msg = decodeURIComponent(atob(decodeURIComponent(match[1])));
      if (msg) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL hash, not derivable at render time
        setSaved(msg);
        setStep("gift");
        setPhase("box");
      }
    } catch {
      // ignore malformed hash payloads
    }
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      jazz.stop();
    };
  }, [jazz]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const base = window.location.origin + window.location.pathname;
    const newLink = `${base}#g=${btoa(encodeURIComponent(trimmed))}`;
    setSaved(trimmed);
    setLink(newLink);
    setCopied(false);
    setStep("share");
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(link);
    } finally {
      setCopied(true);
    }
  };

  const handleOpenGift = () => {
    setPhase("burst");
    const id = window.setTimeout(() => setPhase("text"), 320);
    timersRef.current.push(id);
    jazz.start();
  };

  const burstOn = phase !== "box";

  return (
    <SkyBackground>
      <title>선물 메시지 보내기</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&family=DotGothic16&family=Gowun+Dodum&display=swap"
        rel="stylesheet"
      />
      <link href="https://cdn.jsdelivr.net/npm/galmuri/dist/galmuri.css" rel="stylesheet" />

      {step === "form" && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: "100vh",
            boxSizing: "border-box",
            padding: "4vh 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
          }}
        >
          <CatBanner message="상대방에게 적을 메시지를 적어라 . . ." showCaret />

          <div style={PANEL_OUTER}>
            <div style={{ background: "linear-gradient(#FDFDFD 0%, #EFEFF2 100%)", border: "2px solid #6E6E78", padding: "22px 26px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 14, border: "2px solid #4A4A52", background: "#fff" }}>
                <span className={styles.pixelFont} style={{ fontWeight: 700, fontSize: 20, color: "#1C1C1C" }}>
                  ▶ 입력하기
                </span>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                  }}
                  className={styles.pixelFont}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "2px inset #9A9AA2",
                    background: "#FAFAFC",
                    padding: "14px 16px",
                    fontSize: 19,
                    color: "#1C1C1C",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={handleSave}
                  className={`${styles.pixelFont} ${styles.confirmButton}`}
                  style={{
                    alignSelf: "flex-end",
                    fontWeight: 700,
                    fontSize: 19,
                    color: "#1C1C1C",
                    background: "linear-gradient(#FDFDFD, #DCDCE2)",
                    border: "2px outset #9A9AA2",
                    padding: "10px 28px",
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "share" && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: "100vh",
            boxSizing: "border-box",
            padding: "4vh 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
          }}
        >
          <CatBanner message="이 링크를 상대방에게 보내라 . . ." fontSize={24} />

          <div style={PANEL_OUTER}>
            <div
              style={{
                background: "linear-gradient(#FDFDFD 0%, #EFEFF2 100%)",
                border: "2px solid #6E6E78",
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                className={styles.pixelFont}
                style={{
                  border: "2px inset #9A9AA2",
                  background: "#FAFAFC",
                  padding: "14px 16px",
                  fontSize: 15,
                  color: "#1C1C1C",
                  wordBreak: "break-all",
                }}
              >
                {link}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`${styles.pixelFont} ${styles.confirmButton}`}
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#1C1C1C",
                    background: "linear-gradient(#FDFDFD, #DCDCE2)",
                    border: "2px outset #9A9AA2",
                    padding: "10px 24px",
                  }}
                >
                  {copied ? "복사됐다" : "링크 복사"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("box");
                    setStep("gift");
                  }}
                  className={`${styles.pixelFont} ${styles.confirmButton}`}
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#1C1C1C",
                    background: "linear-gradient(#FDFDFD, #DCDCE2)",
                    border: "2px outset #9A9AA2",
                    padding: "10px 24px",
                  }}
                >
                  상대방 화면 미리보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "gift" && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100vh",
            boxSizing: "border-box",
            padding: "2vh 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            overflow: "hidden",
          }}
        >
          <CatBanner message="친구가 선물을 보냈습니다." showCaret imageSize={64} fontSize={24} padding="18px 24px" />

          <div style={{ position: "relative", width: "100%", maxWidth: 860, flex: 1, minHeight: 0 }}>
            <DancingCats />

            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0 }}>
                <Confetti active={burstOn} />
              </div>

              {phase === "box" && (
                <div
                  onClick={handleOpenGift}
                  style={{ position: "relative", zIndex: 2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
                >
                  <div style={{ background: "#C9CCD4", border: "3px solid #2A2A2A", padding: 3, boxShadow: "4px 4px 0 rgba(0,0,0,0.3)" }}>
                    <div
                      className={styles.pixelFont}
                      style={{
                        background: "linear-gradient(#FDFDFD, #EDEDF0)",
                        border: "2px solid #6E6E78",
                        padding: "8px 18px",
                        fontSize: 16,
                        color: "#1C1C1C",
                        whiteSpace: "nowrap",
                      }}
                    >
                      클릭해서 열어보기
                    </div>
                  </div>
                  <div className={styles.giftBox} style={{ marginTop: 44 }}>
                    <GiftBoxGraphic />
                  </div>
                </div>
              )}

              {phase === "burst" && (
                <div className={styles.giftBoxFading} style={{ position: "relative", zIndex: 2 }}>
                  <GiftBoxGraphic lidFlying />
                </div>
              )}

              {burstOn && (
                <div
                  className={styles.burstGlow}
                  style={{
                    position: "absolute",
                    zIndex: 1,
                    width: 300,
                    height: 300,
                    borderRadius: 999,
                    background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,230,167,0.5) 45%, rgba(255,230,167,0) 70%)",
                  }}
                />
              )}

              {phase === "text" && (
                <div
                  className={styles.savedMessage}
                  style={{
                    position: "relative",
                    zIndex: 3,
                    width: "min(460px, 66%)",
                    background: "#C9CCD4",
                    border: "3px solid #2A2A2A",
                    borderRadius: 4,
                    padding: 5,
                    boxShadow: "6px 6px 0 rgba(0,0,0,0.35)",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(#FDFDFD 0%, #EDEDF0 55%, #DCDCE2 100%)",
                      border: "2px solid #6E6E78",
                      padding: "22px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className={styles.pixelFont}
                      style={{ fontWeight: 700, fontSize: 30, color: "#1C1C1C", lineHeight: 1.45, textWrap: "pretty" }}
                    >
                      {saved}
                    </span>
                  </div>
                </div>
              )}

              <MusicNotes active={burstOn} />
            </div>
          </div>
        </div>
      )}
    </SkyBackground>
  );
}
