"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type HeroCardConfig = {
  code: string;
  name: string;
  image: string;
  alt: string;
  className: string;
  chipClassName: string;
  sizes: string;
  /** amplitude da flutuação idle (px) */
  idleAmp: number;
  /** velocidade da flutuação idle (rad/ms) */
  idleSpeed: number;
  /** desfase da onda idle */
  idlePhase: number;
  /** amplitude da rotação idle (deg) */
  idleRotAmp: number;
  /** translateY por px de scroll (px/px) — profundidade/parallax */
  scrollY: number;
  /** rotação por px de scroll (deg/px) */
  scrollRot: number;
};

const CARDS: HeroCardConfig[] = [
  {
    code: "DE20100",
    name: "Caixa do elevador",
    image: "/catalog/colheitadeira/de20100.png",
    alt: "Caixa do elevador para colheitadeira",
    className:
      "absolute left-[2%] top-[9%] h-[60%] w-[59%] border border-line bg-surface/70 p-2 shadow-2xl shadow-black/40 sm:p-4",
    chipClassName: "bottom-3 left-3 sm:bottom-5 sm:left-5",
    sizes: "(max-width: 767px) 55vw, 30vw",
    idleAmp: 6,
    idleSpeed: 0.0009,
    idlePhase: 0,
    idleRotAmp: 0.5,
    scrollY: 0.05,
    scrollRot: 0.004,
  },
  {
    code: "DE21086",
    name: "Caixa de acionamento",
    image: "/catalog/colheitadeira/de21086.png",
    alt: "Caixa de acionamento da navalha para colheitadeira",
    className:
      "absolute right-[1%] top-[5%] h-[42%] w-[38%] border border-line bg-surface/80 p-2 shadow-xl shadow-black/30 sm:p-3",
    chipClassName: "bottom-2 left-2 sm:bottom-3 sm:left-3",
    sizes: "(max-width: 767px) 36vw, 22vw",
    idleAmp: 9,
    idleSpeed: 0.0012,
    idlePhase: 1.7,
    idleRotAmp: 0.8,
    scrollY: 0.12,
    scrollRot: -0.018,
  },
  {
    code: "AN207684",
    name: "Barra da suspensão",
    image: "/catalog/pulverizador/an207684.png",
    alt: "Barra da suspensão para pulverizador",
    className:
      "absolute bottom-[2%] right-[7%] h-[50%] w-[53%] border border-line bg-surface/90 p-2 shadow-2xl shadow-black/50 sm:p-4",
    chipClassName: "bottom-2 left-2 sm:bottom-4 sm:left-4",
    sizes: "(max-width: 767px) 50vw, 28vw",
    idleAmp: 7,
    idleSpeed: 0.00105,
    idlePhase: 3.3,
    idleRotAmp: 0.6,
    scrollY: 0.08,
    scrollRot: 0.01,
  },
];

export default function HeroShowcase() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = 0;
    let visible = false;

    const applyFrame = (time: number) => {
      const scroll = window.scrollY;
      cardRefs.current.forEach((element, index) => {
        if (!element) return;
        const config = CARDS[index];
        const idleY =
          Math.sin(time * config.idleSpeed + config.idlePhase) *
          config.idleAmp;
        const idleRot =
          Math.sin(time * config.idleSpeed * 0.7 + config.idlePhase) *
          config.idleRotAmp;
        const y = idleY + scroll * config.scrollY;
        const rot = idleRot + scroll * config.scrollRot;
        element.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(3)}deg)`;
      });
    };

    const tick = (time: number) => {
      applyFrame(time);
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafId !== 0 || !visible || motionQuery.matches) return;
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (rafId === 0) return;
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const clearTransforms = () => {
      cardRefs.current.forEach((element) => {
        if (element) element.style.transform = "";
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 }
    );
    observer.observe(container);

    const onMotionChange = () => {
      if (motionQuery.matches) {
        stop();
        clearTransforms();
      } else {
        start();
      }
    };
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      stop();
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      clearTransforms();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[1.05] w-full max-w-[580px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-[14%] rounded-full bg-accent/10 blur-3xl"
      />
      {CARDS.map((card, index) => (
        <div
          key={card.code}
          ref={(element) => {
            cardRefs.current[index] = element;
          }}
          className={`${card.className} will-change-transform`}
        >
          <div className="product-stage relative h-full w-full">
            <Image
              src={card.image}
              alt={card.alt}
              fill
              priority
              sizes={card.sizes}
              className="object-contain p-3 drop-shadow-2xl"
            />
          </div>
          <span
            className={`absolute ${card.chipClassName} border border-line bg-bg/85 px-2.5 py-1.5 backdrop-blur`}
          >
            <span className="block font-display text-sm font-semibold uppercase leading-tight text-fg">
              {card.name}
            </span>
            <span className="block font-mono text-sm font-bold leading-tight text-accent md:text-base">
              {card.code}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
