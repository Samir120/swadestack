import React from 'react';

/**
 * Dark-mode-only ambient background wash.
 *
 * The glows used to be solid `rounded-full` divs with `blur-[120px]`. That forced
 * Chrome to allocate an offscreen surface per glow, sized to the element plus the
 * blur margin — ~1200px square at DPR 1, ~3600px square at DPR 3 — and re-rasterize
 * it on every route change. On mobile that dominated first paint (3-4.5x the raster
 * time of light mode, which pays nothing because the layer is `display: none`).
 *
 * A radial-gradient paints the same falloff as a plain gradient fill: no filter
 * pass, no offscreen surface. To match what the blur produced, each box is grown
 * by 3σ (360px) on every side — the blur spilled that far outside its element —
 * and the stops trace the Gaussian profile of a blurred disc: full alpha at the
 * centre, half alpha at the original circle's edge, ~0 by 2σ past it.
 */

type GlowVariant = 'default' | 'soft';
type Wash = 'surface-850' | 'surface-950';

interface AmbientBackgroundProps {
  /** Glow palette. 'default' = indigo + deep blue, 'soft' = faint indigo + cyan. */
  variant?: GlowVariant;
  /** Mid-stop of the top-of-page gradient wash. */
  wash?: Wash;
}

const SPILL = 360; // 3σ for the original blur-[120px]

/** Stops approximating a disc of radius `r0` blurred with σ=120, over a box of radius r0+SPILL. */
const glowStops = (rgb: string, alpha: number, r0: number): string => {
  const R = r0 + SPILL;
  const pct = (r: number) => Math.round((r / R) * 100);
  const a = (f: number) => +(alpha * f).toFixed(4);
  return [
    `rgba(${rgb},${a(1)}) 0%`,
    `rgba(${rgb},${a(0.84)}) ${pct(r0 - 120)}%`,
    `rgba(${rgb},${a(0.5)}) ${pct(r0)}%`,
    `rgba(${rgb},${a(0.16)}) ${pct(r0 + 120)}%`,
    `rgba(${rgb},${a(0.02)}) ${pct(r0 + 240)}%`,
    `rgba(${rgb},0) 100%`,
  ].join(', ');
};

const PALETTE: Record<GlowVariant, { top: [string, number]; bottom: [string, number] }> = {
  // primary-600 #4f46e5 @ 10%, blue-900 #1e3a8a @ 20%
  default: { top: ['79,70,229', 0.1], bottom: ['30,58,138', 0.2] },
  // primary-600 #4f46e5 @ 5%, accent-500 #06b6d4 @ 3%
  soft: { top: ['79,70,229', 0.05], bottom: ['6,182,212', 0.03] },
};

const WASH: Record<Wash, string> = {
  'surface-850': 'from-surface-900 via-surface-850 to-surface-950',
  'surface-950': 'from-surface-900 via-surface-950 to-surface-950',
};

const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'default',
  wash = 'surface-850',
}) => {
  const { top, bottom } = PALETTE[variant];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden hidden dark:block">
      <div
        className={`absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${WASH[wash]}`}
      />
      {/* was: w-[500px] h-[500px] bg-primary-600/{10,5} rounded-full blur-[120px] */}
      <div
        className="absolute rounded-full"
        style={{
          top: `calc(20% - ${SPILL}px)`,
          right: `calc(-10% - ${SPILL}px)`,
          width: 500 + SPILL * 2,
          height: 500 + SPILL * 2,
          backgroundImage: `radial-gradient(closest-side, ${glowStops(top[0], top[1], 250)})`,
        }}
      />
      {/* was: w-[600px] h-[600px] bg-{blue-900/20,accent-500/3} rounded-full blur-[120px] */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: `calc(10% - ${SPILL}px)`,
          left: `calc(-10% - ${SPILL}px)`,
          width: 600 + SPILL * 2,
          height: 600 + SPILL * 2,
          backgroundImage: `radial-gradient(closest-side, ${glowStops(bottom[0], bottom[1], 300)})`,
        }}
      />
    </div>
  );
};

export default AmbientBackground;
