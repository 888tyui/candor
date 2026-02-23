"use client";

import { useEffect, useRef } from "react";
import { ArrowDownIcon as ArrowDown, ArrowUpRightIcon as ArrowUpRight, GithubLogoIcon as GithubLogo } from "@phosphor-icons/react";
import PrismVisual from "./PrismVisual";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const mx = (clientX / innerWidth - 0.5) * 2;  // -1 to 1
      const my = (clientY / innerHeight - 0.5) * 2;

      // Set CSS custom properties for multi-layer parallax
      hero.style.setProperty("--mx", String(mx));
      hero.style.setProperty("--my", String(my));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ background: "var(--bg-deep)", minHeight: "100dvh" }}
    >
      {/* Background layers */}
      <div className="grid-bg" aria-hidden="true" />
      <div className="glow-orb glow-orb-1" aria-hidden="true" />
      <div className="glow-orb glow-orb-2" aria-hidden="true" />
      <div className="glow-orb glow-orb-3" aria-hidden="true" />

      {/* Particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`particle particle-${i + 1}`} aria-hidden="true" />
      ))}

      {/* Floating Event Cards — xl only, edges */}
      <EventCard
        className="hidden xl:block"
        style={{ top: "18%", right: "4%", animation: "float-card-1 16s ease-in-out infinite" }}
        method="tools/call"
        tool="filesystem_read"
        latency="23ms"
        color="var(--accent-cyan)"
      />
      <EventCard
        className="hidden xl:block"
        style={{ top: "58%", right: "3%", animation: "float-card-2 14s ease-in-out infinite 2s" }}
        method="resources/read"
        tool="github_repository"
        latency="142ms"
        color="var(--accent-violet)"
      />
      <EventCard
        className="hidden xl:block"
        style={{ top: "55%", left: "3%", animation: "float-card-3 18s ease-in-out infinite 4s" }}
        method="tools/call"
        tool="web_search"
        latency="891ms"
        color="var(--accent-blue)"
      />

      {/* ─── Main Content ─── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{ minHeight: "100dvh", padding: "140px 24px 100px" }}
      >
        {/* Badge */}
        <div
          className="anim-fade-up inline-flex items-center gap-2.5 rounded-full font-[family-name:var(--font-figtree)]"
          style={{
            animationDelay: "0.2s",
            padding: "8px 20px",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            background: "rgba(99, 102, 241, 0.06)",
            border: "1px solid rgba(99, 102, 241, 0.12)",
            color: "var(--accent-indigo)",
            marginBottom: 40,
          }}
        >
          <span
            className="animate-pulse"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent-indigo)",
              display: "inline-block",
            }}
          />
          Observability for AI Agents
        </div>

        {/* Headline */}
        <h1
          className="anim-fade-up font-[family-name:var(--font-bricolage)]"
          style={{
            animationDelay: "0.4s",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
            marginBottom: 8,
          }}
        >
          <span style={{ color: "var(--text-primary)", display: "block" }}>
            See everything
          </span>
          <span className="gradient-text-accent" style={{ display: "block" }}>
            your AI agents do.
          </span>
        </h1>

        {/* Prism Visual */}
        <div
          data-prism
          className="anim-scale-in"
          style={{
            animationDelay: "0.6s",
            transition: "transform 0.15s ease-out",
            margin: "12px 0",
          }}
        >
          <PrismVisual />
        </div>

        {/* Subtitle */}
        <p
          className="anim-fade-up font-[family-name:var(--font-figtree)]"
          style={{
            animationDelay: "0.8s",
            maxWidth: 520,
            fontSize: "clamp(1rem, 1.1vw, 1.15rem)",
            lineHeight: 1.7,
            color: "var(--text-secondary)",
            marginBottom: 36,
          }}
        >
          A transparent proxy that intercepts every MCP tool call, resource read,
          and response — streaming it all to a real-time dashboard.{" "}
          <span className="gradient-text-accent" style={{ fontWeight: 600 }}>
            Sentry for AI agents.
          </span>
        </p>

        {/* CTAs */}
        <div
          className="anim-fade-up"
          style={{
            animationDelay: "1s",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <a href="/dashboard" className="btn-primary">
            <span>Get Started</span>
            <ArrowUpRight size={16} weight="bold" />
          </a>
          <a
            href="https://github.com/candor-io/candor"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            <GithubLogo size={18} weight="bold" />
            <span>View on GitHub</span>
          </a>
        </div>

        {/* Install command */}
        <div
          className="anim-fade-up"
          style={{ animationDelay: "1.2s" }}
        >
          <code
            className="font-[family-name:var(--font-ibm-plex-mono)]"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 20px",
              borderRadius: 12,
              fontSize: 14,
              background: "rgba(17, 19, 38, 0.5)",
              border: "1px solid rgba(99, 102, 241, 0.1)",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>$</span>
            <span style={{ color: "var(--text-secondary)" }}>
              npm install -g @candor/proxy
            </span>
          </code>
        </div>
      </div>

      {/* Scroll indicator — absolute bottom */}
      <div
        className="anim-fade-in"
        style={{
          animationDelay: "1.6s",
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span
          className="font-[family-name:var(--font-figtree)]"
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "var(--text-muted)",
          }}
        >
          Explore
        </span>
        <ArrowDown
          size={14}
          weight="bold"
          className="scroll-indicator"
          style={{ color: "var(--text-muted)" }}
        />
      </div>

      {/* Bottom line */}
      <div className="hero-line" style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} />
    </section>
  );
}

function EventCard({
  className = "",
  style,
  method,
  tool,
  latency,
  color,
}: {
  className?: string;
  style?: React.CSSProperties;
  method: string;
  tool: string;
  latency: string;
  color: string;
}) {
  return (
    <div className={`event-card ${className}`} style={style} aria-hidden="true">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
        <span style={{ color, fontSize: 10 }}>{method}</span>
      </div>
      <span style={{ color: "var(--text-primary)", fontSize: 12 }}>{tool}</span>
      <span style={{ color: "var(--text-muted)", fontSize: 10, marginLeft: 12 }}>
        {latency}
      </span>
    </div>
  );
}
