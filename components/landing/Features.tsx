"use client";

import { useEffect, useRef } from "react";
import {
  ShieldCheckIcon as ShieldCheck,
  ActivityIcon as Activity,
  ClockCountdownIcon as ClockCountdown,
  CurrencyDollarIcon as CurrencyDollar,
  BellIcon as Bell,
} from "@phosphor-icons/react";

const features = [
  {
    icon: ShieldCheck,
    title: "MCP Proxy Interceptor",
    description:
      "Zero-config transparent proxy. Point your MCP client through localhost:3100 — every JSON-RPC message is captured without touching your agent code.",
    color: "var(--accent-cyan)",
    colorRgb: "var(--accent-cyan-rgb)",
    gradient: "from-cyan-500/10 to-transparent",
  },
  {
    icon: Activity,
    title: "Live Event Timeline",
    description:
      "Real-time WebSocket feed of every tool call, resource read, and response. Filter by agent, tool, status, or time range as events stream in.",
    color: "var(--accent-indigo)",
    colorRgb: "var(--accent-indigo-rgb)",
    gradient: "from-indigo-500/10 to-transparent",
  },
  {
    icon: ClockCountdown,
    title: "Session Explorer",
    description:
      "Browse historical agent sessions with full event chains. Expand any request/response payload. See aggregate stats per session at a glance.",
    color: "var(--accent-violet)",
    colorRgb: "var(--accent-violet-rgb)",
    gradient: "from-violet-500/10 to-transparent",
  },
  {
    icon: CurrencyDollar,
    title: "Cost Attribution",
    description:
      "Track estimated costs per session, per tool, and per time period. Set monthly budget alerts. Configurable rate tables for any LLM provider.",
    color: "var(--accent-blue)",
    colorRgb: "var(--accent-blue-rgb)",
    gradient: "from-blue-500/10 to-transparent",
  },
  {
    icon: Bell,
    title: "Alert Rules",
    description:
      "Define custom rules: latency thresholds, cost limits, tool allowlists. Alerts surface in the dashboard and optionally fire webhooks.",
    color: "var(--accent-purple)",
    colorRgb: "var(--accent-purple-rgb)",
    gradient: "from-purple-500/10 to-transparent",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    const cards = sectionRef.current?.querySelectorAll("[data-reveal]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{ background: "var(--bg-deep)", padding: "120px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Section header */}
        <div
          data-reveal
          className="reveal-item"
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <span
            className="font-[family-name:var(--font-figtree)]"
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent-indigo)",
              marginBottom: 16,
            }}
          >
            Core Features
          </span>
          <h2
            className="font-[family-name:var(--font-bricolage)]"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
            Everything you need to
            <br />
            <span className="gradient-text-accent">understand your agents.</span>
          </h2>
          <p
            className="font-[family-name:var(--font-figtree)]"
            style={{
              maxWidth: 480,
              margin: "0 auto",
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--text-secondary)",
            }}
          >
            From real-time interception to cost tracking, Candor gives you
            complete visibility into every agentic workflow.
          </p>
        </div>

        {/* Feature cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {features.map((feature, i) => (
            <div
              key={feature.title}
              data-reveal
              className="reveal-item interactive-card"
              style={{
                transitionDelay: `${i * 80}ms`,
                padding: 32,
                borderRadius: 16,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = `rgba(${feature.colorRgb}, 0.2)`;
                el.style.boxShadow = `0 12px 40px rgba(${feature.colorRgb}, 0.07), inset 0 1px 0 rgba(${feature.colorRgb}, 0.08)`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--border-subtle)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `rgba(${feature.colorRgb}, 0.07)`,
                  border: `1px solid rgba(${feature.colorRgb}, 0.12)`,
                  marginBottom: 20,
                }}
              >
                <feature.icon size={24} weight="duotone" color={feature.color} />
              </div>

              {/* Title */}
              <h3
                className="font-[family-name:var(--font-bricolage)]"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 10,
                  letterSpacing: "-0.01em",
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
