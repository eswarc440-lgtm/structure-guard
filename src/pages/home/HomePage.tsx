import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Boxes, Map, Sparkles, Activity, ShieldAlert, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { cn } from "@/lib/utils";

import bridgeArch from "@/assets/infra/bridge-arch.jpg.asset.json";
import bridgeCable from "@/assets/infra/bridge-cable.jpg.asset.json";
import roadHighway from "@/assets/infra/road-highway.jpg.asset.json";
import roadGhat from "@/assets/infra/road-ghat.jpg.asset.json";
import damSpillway from "@/assets/infra/dam-spillway.jpg.asset.json";
import damMist from "@/assets/infra/dam-mist.jpg.asset.json";
import civicBuilding from "@/assets/infra/civic-building.jpg.asset.json";
import barrage from "@/assets/infra/barrage.jpg.asset.json";

type Floater = {
  src: string;
  alt: string;
  className: string;
  rotate: number;
  opacity: number;
  blur?: boolean;
  axis: "y" | "x" | "r";
  duration: number;
  delay: number;
};

const floaters: Floater[] = [
  {
    src: bridgeArch.url,
    alt: "Steel arch rail bridge over a river",
    className: "left-[2%] top-[10%] w-40 sm:w-52 lg:w-72",
    rotate: -4,
    opacity: 0.85,
    axis: "y",
    duration: 13,
    delay: 0,
  },
  {
    src: civicBuilding.url,
    alt: "Government civic building",
    className: "right-[3%] top-[8%] w-36 sm:w-48 lg:w-64",
    rotate: 5,
    opacity: 0.8,
    axis: "x",
    duration: 16,
    delay: 1.2,
  },
  {
    src: roadHighway.url,
    alt: "Highway bypass corridor",
    className: "hidden sm:block left-[4%] top-[46%] w-44 lg:w-64",
    rotate: 3,
    opacity: 0.7,
    axis: "r",
    duration: 18,
    delay: 0.6,
  },
  {
    src: bridgeCable.url,
    alt: "Cable-stayed bridge pylon",
    className: "hidden sm:block right-[5%] top-[44%] w-40 lg:w-60",
    rotate: -6,
    opacity: 0.75,
    axis: "y",
    duration: 15,
    delay: 1.8,
  },
  {
    src: damSpillway.url,
    alt: "Dam spillway releasing water",
    className: "hidden lg:block left-[10%] bottom-[6%] w-56",
    rotate: 4,
    opacity: 0.55,
    blur: true,
    axis: "x",
    duration: 20,
    delay: 0.3,
  },
  {
    src: damMist.url,
    alt: "Reservoir dam at dawn",
    className: "hidden lg:block right-[11%] bottom-[8%] w-52",
    rotate: -3,
    opacity: 0.5,
    blur: true,
    axis: "y",
    duration: 22,
    delay: 2.4,
  },
  {
    src: roadGhat.url,
    alt: "Aerial view of a winding ghat road",
    className: "hidden xl:block left-[26%] bottom-[2%] w-36",
    rotate: -8,
    opacity: 0.45,
    blur: true,
    axis: "r",
    duration: 24,
    delay: 1,
  },
  {
    src: barrage.url,
    alt: "Barrage across a wide river",
    className: "hidden xl:block right-[27%] top-[3%] w-36",
    rotate: 7,
    opacity: 0.45,
    blur: true,
    axis: "x",
    duration: 21,
    delay: 1.6,
  },
];

function motionFor(f: Floater, reduce: boolean | null) {
  if (reduce) return {};
  const common = {
    transition: { duration: f.duration, delay: f.delay, repeat: Infinity, ease: "easeInOut" as const },
  };
  if (f.axis === "y") return { animate: { y: [0, -18, 0] }, ...common };
  if (f.axis === "x") return { animate: { x: [0, 16, 0] }, ...common };
  return { animate: { rotate: [f.rotate, f.rotate + 2.5, f.rotate] }, ...common };
}

function FloatingImages() {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {floaters.map((f) => (
        <motion.div
          key={f.src}
          className={cn("pointer-events-auto absolute", f.className)}
          style={{ rotate: f.rotate, opacity: f.opacity }}
          {...motionFor(f, reduce)}
        >
          <img
            src={f.src}
            alt={f.alt}
            loading="lazy"
            decoding="async"
            className={cn(
              "aspect-[4/3] w-full rounded-xl border border-foreground/8 object-cover shadow-[0_18px_50px_-24px_rgba(15,32,64,0.55)] transition-all duration-500 hover:scale-[1.04] hover:opacity-100 hover:shadow-[0_26px_70px_-26px_rgba(15,32,64,0.65)]",
              f.blur && "blur-[2px] hover:blur-0",
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}

const cards = [
  {
    icon: HardHat,
    title: "INFRASTRUCTURE",
    to: "/infrastructure" as const,
    cta: "Enter Infrastructure",
    description:
      "Monitor, manage, and inspect infrastructure assets, structural conditions, GIS information, and digital twins.",
    chips: [
      { icon: Boxes, label: "Assets" },
      { icon: Map, label: "GIS" },
      { icon: Boxes, label: "Digital Twin" },
    ],
    image: bridgeCable.url,
  },
  {
    icon: Sparkles,
    title: "AI INTELLIGENCE",
    to: "/ai" as const,
    cta: "Enter AI Intelligence",
    description:
      "Access AI-powered predictions, risk analysis, analytics, and model performance for infrastructure monitoring.",
    chips: [
      { icon: Activity, label: "Predictions" },
      { icon: ShieldAlert, label: "Risk" },
      { icon: Sparkles, label: "Analytics" },
    ],
    image: damSpillway.url,
  },
];

export function HomePage() {
  const reduce = useReducedMotion();
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <DashboardLayout bare>
      <main className="relative min-h-[calc(100svh-4rem)] w-full overflow-hidden">
        {/* Layer 1 — texture + gradient */}
        <div
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,var(--color-primary)/8,transparent_60%)]"
          aria-hidden="true"
        />
        <div className="grid-lines absolute inset-0 opacity-[0.05]" aria-hidden="true" />

        {/* Layer 2 — floating imagery */}
        <FloatingImages />

        {/* Layer 3 — readability veil */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_45%,var(--color-background)_45%,transparent_100%)]"
          aria-hidden="true"
        />

        {/* Layer 4/5 — content */}
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:py-24">
          <motion.p {...fade(0.05)} className="eyebrow text-primary">
            Welcome to SIMRAS
          </motion.p>
          <motion.h1
            {...fade(0.14)}
            className="text-hero mt-4 max-w-3xl text-[2rem] text-balance sm:text-5xl lg:text-6xl"
          >
            Structural Infrastructure Monitoring System
          </motion.h1>
          <motion.p
            {...fade(0.24)}
            className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Monitor infrastructure health, assess structural risks, and leverage AI-powered intelligence to support
            safer infrastructure decisions.
          </motion.p>

          <motion.div {...fade(0.34)} className="mt-12 grid w-full gap-6 md:grid-cols-2">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card/80 p-7 text-left shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_28px_70px_-32px_rgba(15,32,64,0.55)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="grid size-12 place-items-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                  <card.icon className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-6 font-display text-xl font-extrabold tracking-[0.08em]">{card.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {card.chips.map((chip) => (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
                    >
                      <chip.icon className="size-3.5" aria-hidden="true" />
                      {chip.label}
                    </span>
                  ))}
                </div>

                <div className="relative mt-6 h-24 overflow-hidden rounded-xl border">
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" aria-hidden="true" />
                </div>

                <span className="mt-6">
                  <Button asChild={false} className="pointer-events-none min-h-10 w-full sm:w-auto">
                    <span className="inline-flex items-center gap-2">
                      {card.cta}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Button>
                </span>
              </Link>
            ))}
          </motion.div>
        </div>
      </main>
    </DashboardLayout>
  );
}
