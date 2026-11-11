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

/** período de uma volta completa da órbita (ms) */
const ORBIT_PERIOD_MS = 12_000;
const ORBIT_OMEGA = (Math.PI * 2) / ORBIT_PERIOD_MS;
/** raio horizontal da órbita como fração da largura do palco */
const ORBIT_RX_RATIO = 0.1;
/** raio vertical da órbita como fração da altura do palco */
const ORBIT_RY_RATIO = 0.08;
/** profundidade: quem está "na frente" cresce, quem está "atrás" encolhe */
const ORBIT_SCALE_MID = 0.99;
const ORBIT_SCALE_AMP = 0.05; // escala varia entre 0.94 e 1.04
/** scroll: a partir de ~1.5x a altura do hero a órbita amortece até 30% do raio */
const ORBIT_DAMP_START = 1.5;
const ORBIT_DAMP_END = 1.9;
const ORBIT_DAMP_MIN = 0.3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function HeroShowcase() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = 0;
    let visible = false;
    let stageW = container.clientWidth;
    let stageH = container.clientHeight;
    let heroH = container.closest("section")?.offsetHeight ?? stageH;

    const measure = () => {
      stageW = container.clientWidth;
      stageH = container.clientHeight;
      heroH = container.closest("section")?.offsetHeight ?? stageH;
    };

    const applyFrame = (time: number) => {
      const scroll = window.scrollY;
      const theta = time * ORBIT_OMEGA;
      // amortecimento da órbita ao sair de cena (volta ~30% do raio)
      const dampT =
        heroH > 0
          ? clamp(
              (scroll / heroH - ORBIT_DAMP_START) /
                (ORBIT_DAMP_END - ORBIT_DAMP_START),
              0,
              1
            )
          : 0;
      const orbitDamp = 1 - (1 - ORBIT_DAMP_MIN) * dampT;
      const orbitRX = stageW * ORBIT_RX_RATIO * orbitDamp;
      const orbitRY = stageH * ORBIT_RY_RATIO * orbitDamp;

      const depths = new Array<number>(CARDS.length).fill(0);
      cardRefs.current.forEach((element, index) => {
        if (!element) return;
        const config = CARDS[index];
        // fases 0 / 120 / 240 graus — as peças trocam de lugar na elipse
        const angle = theta + (index * Math.PI * 2) / CARDS.length;
        const orbitX = Math.cos(angle) * orbitRX;
        const orbitY = Math.sin(angle) * orbitRY;
        // -1 = fundo (menor, atrás), +1 = frente (maior, na frente)
        const depth = Math.sin(angle);
        depths[index] = depth;
        const idleY =
          Math.sin(time * config.idleSpeed + config.idlePhase) *
          config.idleAmp;
        const idleRot =
          Math.sin(time * config.idleSpeed * 0.7 + config.idlePhase) *
          config.idleRotAmp;
        const x = orbitX;
        const y = idleY + orbitY + scroll * config.scrollY;
        const rot = idleRot + scroll * config.scrollRot;
        const scale = ORBIT_SCALE_MID + ORBIT_SCALE_AMP * depth * orbitDamp;
        element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(3)}deg) scale(${scale.toFixed(3)})`;
        const depthNorm = (depth * orbitDamp + 1) / 2;
        element.style.opacity = (0.9 + 0.1 * depthNorm).toFixed(3);
      });

      // z-index por profundidade: quem está atrás passa por trás das outras
      const order = depths
        .map((depth, index) => ({ depth, index }))
        .sort((a, b) => a.depth - b.depth);
      order.forEach(({ index }, rank) => {
        const element = cardRefs.current[index];
        if (!element) return;
        const z = String(rank + 1);
        if (element.style.zIndex !== z) element.style.zIndex = z;
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
        if (!element) return;
        element.style.transform = "";
        element.style.zIndex = "";
        element.style.opacity = "";
      });
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);

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
      resizeObserver.disconnect();
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
