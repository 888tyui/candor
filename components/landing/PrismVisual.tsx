"use client";

export default function PrismVisual() {
  /* ─── 3D Isometric Prism Geometry ─── */
  const apex = [220, 48];
  const bL = [95, 302];      // bottom-left
  const bR = [345, 302];     // bottom-right
  const dx = 40, dy = 20;    // isometric depth offset
  const aB = [apex[0] + dx, apex[1] + dy];     // apex-back
  const bRB = [bR[0] + dx, bR[1] + dy];        // bottom-right-back
  const bLB = [bL[0] + dx, bL[1] + dy];        // bottom-left-back

  const entryX = 145, entryY = 190;
  const exitX = 312, exitY = 218;

  // Parallax helper: each layer uses CSS var(--mx/--my) * strength
  const px = (strength: number) => ({
    transform: `translate(calc(var(--mx, 0) * ${strength}px), calc(var(--my, 0) * ${strength}px))`,
    transition: "transform 0.12s ease-out",
  });

  return (
    <div
      data-prism
      className="relative w-[300px] h-[270px] sm:w-[380px] sm:h-[340px] lg:w-[460px] lg:h-[400px]"
      aria-hidden="true"
      style={{ "--mx": "0", "--my": "0" } as React.CSSProperties}
    >
      {/* ═══ LAYER 0: Deep ambient glow (moves slowest) ═══ */}
      <div className="absolute inset-0" style={px(3)}>
        <div
          className="absolute"
          style={{
            top: "50%", left: "48%",
            width: "200%", height: "200%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(ellipse at 45% 48%, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.12) 25%, rgba(6,182,212,0.05) 45%, transparent 65%)",
            filter: "blur(70px)",
            pointerEvents: "none",
            animation: "prism-glow-pulse 5s ease-in-out infinite",
          }}
        />
      </div>

      {/* ═══ LAYER 1: Rainbow caustic on "ground" (slow) ═══ */}
      <div className="absolute inset-0" style={px(4)}>
        <div
          className="absolute"
          style={{
            bottom: "-5%", left: "15%", width: "80%", height: "30%",
            background: "linear-gradient(90deg, rgba(239,68,68,0.06), rgba(249,115,22,0.05), rgba(234,179,8,0.05), rgba(34,197,94,0.06), rgba(6,182,212,0.06), rgba(59,130,246,0.07), rgba(168,85,247,0.06))",
            filter: "blur(35px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ═══ LAYER 2: Main prism SVG (medium parallax) ═══ */}
      <div className="absolute inset-0" style={px(6)}>
        <svg
          viewBox="0 0 460 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full"
          style={{ filter: "drop-shadow(0 8px 80px rgba(99,102,241,0.18))" }}
        >
          <defs>
            {/* ─── FACE GRADIENTS ─── */}
            <linearGradient id="gFront" x1="0" y1="0" x2="0.3" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.16" />
              <stop offset="25%" stopColor="#a5b4fc" stopOpacity="0.09" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#312e81" stopOpacity="0.07" />
            </linearGradient>
            <linearGradient id="gRight" x1="0" y1="0" x2="1" y2="0.6" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="gBottom" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0.03" />
            </linearGradient>

            {/* ─── SPECULAR / GLASS SHEEN ─── */}
            <linearGradient id="gSpecular" x1="0.8" y1="0" x2="0.2" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="20%" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="80%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            {/* Diagonal glass reflection band */}
            <linearGradient id="gReflectBand" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="42%" stopColor="#ffffff" stopOpacity="0.07" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="58%" stopColor="#ffffff" stopOpacity="0.07" />
              <stop offset="65%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* ─── EDGE GRADIENTS ─── */}
            <linearGradient id="eLeft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="eRight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="eBase" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="eBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
            </linearGradient>

            {/* ─── LIGHT BEAM ─── */}
            <linearGradient id="lIn" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#e0e7ff" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="lInternal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#c7d2fe" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>

            {/* ─── SPECTRUM GRADIENTS (richer, longer fade) ─── */}
            {[
              ["sR", "#ef4444", "0.9", "0.5"],
              ["sO", "#f97316", "0.85", "0.45"],
              ["sY", "#facc15", "0.8", "0.4"],
              ["sG", "#22c55e", "0.8", "0.4"],
              ["sC", "#06b6d4", "0.8", "0.4"],
              ["sB", "#3b82f6", "0.85", "0.45"],
              ["sV", "#a855f7", "0.9", "0.5"],
            ].map(([id, c, o1, o2]) => (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={c} stopOpacity={o1} />
                <stop offset="30%" stopColor={c} stopOpacity={o2} />
                <stop offset="70%" stopColor={c} stopOpacity="0.12" />
                <stop offset="100%" stopColor={c} stopOpacity="0" />
              </linearGradient>
            ))}

            {/* ─── FILTERS ─── */}
            <filter id="g1"><feGaussianBlur stdDeviation="1" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="g2"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="g4"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="g8"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="g12"><feGaussianBlur stdDeviation="12" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>

            <clipPath id="frontClip">
              <polygon points={`${apex[0]},${apex[1]} ${bR[0]},${bR[1]} ${bL[0]},${bL[1]}`} />
            </clipPath>
          </defs>

          {/* ━━━ INCOMING BEAM ━━━ */}
          <g>
            {/* Ultra-wide ambient glow */}
            <line x1="0" y1={entryY} x2={entryX + 4} y2={entryY}
              stroke="white" strokeWidth="20" opacity="0.015" filter="url(#g12)" />
            {/* Soft glow */}
            <line x1="10" y1={entryY} x2={entryX + 4} y2={entryY}
              stroke="white" strokeWidth="8" opacity="0.04" filter="url(#g4)" />
            {/* Main beam */}
            <line x1="0" y1={entryY} x2={entryX + 4} y2={entryY}
              stroke="url(#lIn)" strokeWidth="3" filter="url(#g2)">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
            </line>
            {/* Bright core */}
            <line x1="50" y1={entryY} x2={entryX + 2} y2={entryY}
              stroke="white" strokeWidth="1" opacity="0.45">
              <animate attributeName="opacity" values="0.3;0.55;0.3" dur="4s" repeatCount="indefinite" />
            </line>
            {/* Entry flare (multi-layer) */}
            <circle cx={entryX} cy={entryY} r="18" fill="white" opacity="0.04" filter="url(#g12)" />
            <circle cx={entryX} cy={entryY} r="8" fill="white" opacity="0.08" filter="url(#g8)" />
            <circle cx={entryX} cy={entryY} r="3" fill="white" opacity="0.5" filter="url(#g2)">
              <animate attributeName="r" values="2.5;4;2.5" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0.6;0.35" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* ━━━ INTERNAL LIGHT PATH ━━━ */}
          <g clipPath="url(#frontClip)">
            {/* Wide internal glow */}
            <line x1={entryX} y1={entryY} x2={exitX} y2={exitY}
              stroke="white" strokeWidth="24" opacity="0.02" filter="url(#g8)" />
            {/* Internal beam */}
            <line x1={entryX} y1={entryY} x2={exitX} y2={exitY}
              stroke="url(#lInternal)" strokeWidth="3.5" filter="url(#g2)">
              <animate attributeName="opacity" values="0.5;0.85;0.5" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1={entryX} y1={entryY} x2={exitX} y2={exitY}
              stroke="white" strokeWidth="0.8" opacity="0.2" />
            {/* Rainbow dispersion inside glass */}
            {[
              ["#ef4444", -3], ["#f97316", -1.5], ["#facc15", 0],
              ["#22c55e", 1.5], ["#3b82f6", 3], ["#a855f7", 4.5],
            ].map(([c, offset], i) => (
              <line key={i}
                x1={entryX + 25} y1={entryY + Number(offset) * 0.3}
                x2={exitX - 5} y2={exitY + Number(offset)}
                stroke={c as string} strokeWidth="0.5" opacity="0.15" />
            ))}
          </g>

          {/* ━━━ 3D PRISM BODY ━━━ */}
          {/* Bottom face */}
          <polygon
            points={`${bL[0]},${bL[1]} ${bR[0]},${bR[1]} ${bRB[0]},${bRB[1]} ${bLB[0]},${bLB[1]}`}
            fill="url(#gBottom)" stroke="rgba(99,102,241,0.1)" strokeWidth="0.5"
          />
          {/* Right face */}
          <polygon
            points={`${apex[0]},${apex[1]} ${bR[0]},${bR[1]} ${bRB[0]},${bRB[1]} ${aB[0]},${aB[1]}`}
            fill="url(#gRight)" stroke="rgba(99,102,241,0.06)" strokeWidth="0.5"
          />
          {/* Front face — main */}
          <polygon
            points={`${apex[0]},${apex[1]} ${bR[0]},${bR[1]} ${bL[0]},${bL[1]}`}
            fill="url(#gFront)"
          />
          {/* Glass specular overlay */}
          <polygon
            points={`${apex[0]},${apex[1]} ${bR[0]},${bR[1]} ${bL[0]},${bL[1]}`}
            fill="url(#gSpecular)"
          />
          {/* Diagonal reflection band (like real glass) */}
          <polygon
            points={`${apex[0]},${apex[1]} ${bR[0]},${bR[1]} ${bL[0]},${bL[1]}`}
            fill="url(#gReflectBand)"
          />

          {/* Additional specular highlight — bright ellipse top-left */}
          <g clipPath="url(#frontClip)">
            <ellipse cx="175" cy="130" rx="40" ry="70" fill="white" opacity="0.035"
              transform="rotate(-20 175 130)" />
            <ellipse cx="172" cy="125" rx="18" ry="45" fill="white" opacity="0.025"
              transform="rotate(-20 172 125)" />
          </g>

          {/* ─── EDGES ─── */}
          <g filter="url(#g1)">
            <line x1={apex[0]} y1={apex[1]} x2={bL[0]} y2={bL[1]}
              stroke="url(#eLeft)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1={apex[0]} y1={apex[1]} x2={bR[0]} y2={bR[1]}
              stroke="url(#eRight)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1={bL[0]} y1={bL[1]} x2={bR[0]} y2={bR[1]}
              stroke="url(#eBase)" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          {/* Bright outer glow on left edge (main lit edge) */}
          <line x1={apex[0]} y1={apex[1]} x2={bL[0]} y2={bL[1]}
            stroke="rgba(199,210,254,0.15)" strokeWidth="6" filter="url(#g4)" />

          {/* Back edges */}
          <line x1={apex[0]} y1={apex[1]} x2={aB[0]} y2={aB[1]}
            stroke="url(#eBack)" strokeWidth="0.8" opacity="0.6" />
          <line x1={aB[0]} y1={aB[1]} x2={bRB[0]} y2={bRB[1]}
            stroke="url(#eBack)" strokeWidth="0.7" opacity="0.4" />
          <line x1={bR[0]} y1={bR[1]} x2={bRB[0]} y2={bRB[1]}
            stroke="rgba(99,102,241,0.22)" strokeWidth="0.7" />
          <line x1={bL[0]} y1={bL[1]} x2={bLB[0]} y2={bLB[1]}
            stroke="rgba(99,102,241,0.12)" strokeWidth="0.5" />
          <line x1={bLB[0]} y1={bLB[1]} x2={bRB[0]} y2={bRB[1]}
            stroke="rgba(99,102,241,0.08)" strokeWidth="0.5" />

          {/* ─── VERTEX FLARES ─── */}
          <circle cx={apex[0]} cy={apex[1]} r="12" fill="#a78bfa" opacity="0.08" filter="url(#g12)" />
          <circle cx={apex[0]} cy={apex[1]} r="4" fill="#e0e7ff" opacity="0.6" filter="url(#g4)">
            <animate attributeName="r" values="3;5;3" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx={apex[0]} cy={apex[1]} r="1.5" fill="white" opacity="0.8" />

          <circle cx={bL[0]} cy={bL[1]} r="6" fill="#06b6d4" opacity="0.06" filter="url(#g8)" />
          <circle cx={bL[0]} cy={bL[1]} r="2" fill="#06b6d4" opacity="0.45" filter="url(#g2)">
            <animate attributeName="opacity" values="0.25;0.55;0.25" dur="5s" repeatCount="indefinite" />
          </circle>

          <circle cx={bR[0]} cy={bR[1]} r="6" fill="#6366f1" opacity="0.05" filter="url(#g8)" />
          <circle cx={bR[0]} cy={bR[1]} r="2" fill="#6366f1" opacity="0.4" filter="url(#g2)">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="5s" begin="1s" repeatCount="indefinite" />
          </circle>

          {/* ━━━ EXIT FLARE (dramatic) ━━━ */}
          <circle cx={exitX} cy={exitY} r="25" fill="white" opacity="0.025" filter="url(#g12)" />
          <circle cx={exitX} cy={exitY} r="12" fill="white" opacity="0.06" filter="url(#g8)" />
          <circle cx={exitX} cy={exitY} r="5" fill="white" opacity="0.2" filter="url(#g4)">
            <animate attributeName="r" values="4;7;4" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.3;0.15" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={exitX} cy={exitY} r="2" fill="white" opacity="0.55" filter="url(#g1)" />

          {/* ━━━ SPECTRUM BEAMS ━━━ */}
          {/* Wide soft rainbow halo — all from single exit point */}
          <g opacity="0.35">
            {[
              { y2: 100, c: "#ef4444" },
              { y2: 200, c: "#22c55e" },
              { y2: 300, c: "#a855f7" },
            ].map((b, i) => (
              <line key={`halo-${i}`} x1={exitX} y1={exitY} x2="460" y2={b.y2}
                stroke={b.c} strokeWidth="10" opacity="0.08" filter="url(#g12)" />
            ))}
          </g>

          {/* Main beams — all converge at single exit point */}
          <g filter="url(#g2)">
            {[
              { id: "sR", y2: 100, w: 2.8, d: "0s" },
              { id: "sO", y2: 132, w: 2.4, d: "0.2s" },
              { id: "sY", y2: 164, w: 2.2, d: "0.4s" },
              { id: "sG", y2: 196, w: 2.2, d: "0.6s" },
              { id: "sC", y2: 228, w: 2.2, d: "0.8s" },
              { id: "sB", y2: 262, w: 2.4, d: "1.0s" },
              { id: "sV", y2: 298, w: 2.8, d: "1.2s" },
            ].map((b) => (
              <line key={b.id} x1={exitX} y1={exitY} x2="460" y2={b.y2}
                stroke={`url(#${b.id})`} strokeWidth={b.w} strokeLinecap="round">
                <animate attributeName="opacity" values="0.55;0.95;0.55"
                  dur="5s" begin={b.d} repeatCount="indefinite" />
              </line>
            ))}
          </g>

          {/* Bright thin cores — all from single exit point */}
          <g opacity="0.4">
            {[
              { y2: 100, c: "#ef4444" },
              { y2: 132, c: "#f97316" },
              { y2: 164, c: "#facc15" },
              { y2: 196, c: "#22c55e" },
              { y2: 228, c: "#06b6d4" },
              { y2: 262, c: "#3b82f6" },
              { y2: 298, c: "#a855f7" },
            ].map((b, i) => (
              <line key={i} x1={exitX + 6} y1={exitY} x2="445" y2={b.y2}
                stroke={b.c} strokeWidth="0.6" />
            ))}
          </g>

          {/* ━━━ BEAM PARTICLES ━━━ */}
          {[
            { y2: 100, c: "#ef4444", dur: "2.8s", begin: "0s" },
            { y2: 164, c: "#facc15", dur: "3.2s", begin: "1s" },
            { y2: 228, c: "#06b6d4", dur: "3s",   begin: "0.5s" },
            { y2: 298, c: "#a855f7", dur: "3.4s", begin: "1.5s" },
            { y2: 196, c: "#22c55e", dur: "3.6s", begin: "2s" },
          ].map((p, i) => (
            <circle key={`bp-${i}`} r="1.8" fill={p.c} filter="url(#g2)">
              <animateMotion path={`M${exitX},${exitY} L460,${p.y2}`}
                dur={p.dur} begin={p.begin} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.85;0.85;0"
                dur={p.dur} begin={p.begin} repeatCount="indefinite" />
            </circle>
          ))}

          {/* Incoming beam particle */}
          <circle r="2" fill="white" filter="url(#g2)">
            <animateMotion path={`M0,${entryY} L${entryX},${entryY}`}
              dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.75;0.75;0"
              dur="2.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      {/* ═══ LAYER 3: Orbiting dots (fastest parallax) ═══ */}
      <div className="absolute inset-0" style={px(10)}>
        <svg viewBox="0 0 460 400" fill="none" className="w-full h-full">
          {[
            { r: 2, fill: "#818cf8", dur: "20s", begin: "0s",   op: "0.12;0.55;0.12" },
            { r: 1.5, fill: "#a78bfa", dur: "20s", begin: "-7s",  op: "0.08;0.4;0.08" },
            { r: 1.3, fill: "#06b6d4", dur: "20s", begin: "-14s", op: "0.08;0.45;0.08" },
          ].map((d, i) => (
            <circle key={i} r={d.r} fill={d.fill}>
              <animateMotion
                path="M220,175 C310,95 395,190 315,290 C250,350 100,315 88,210 C76,125 135,75 220,175"
                dur={d.dur} begin={d.begin} repeatCount="indefinite"
              />
              <animate attributeName="opacity" values={d.op}
                dur={d.dur} begin={d.begin} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>

      {/* ═══ LAYER 4: Sparkles (fastest, most parallax) ═══ */}
      <div className="absolute inset-0" style={px(14)}>
        <svg viewBox="0 0 460 400" fill="none" className="w-full h-full">
          {[
            { cx: 185, cy: 115, d: "0s" },
            { cx: 275, cy: 255, d: "1.5s" },
            { cx: 140, cy: 265, d: "3s" },
            { cx: 320, cy: 155, d: "0.8s" },
            { cx: 250, cy: 85,  d: "2.2s" },
            { cx: 115, cy: 195, d: "4s" },
          ].map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r="1" fill="#c7d2fe">
              <animate attributeName="opacity" values="0;0.6;0" dur="3.5s"
                begin={s.d} repeatCount="indefinite" />
              <animate attributeName="r" values="0.4;1.8;0.4" dur="3.5s"
                begin={s.d} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}
