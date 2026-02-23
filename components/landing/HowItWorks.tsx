"use client";

import { useEffect, useRef } from "react";
import {
  DownloadSimpleIcon as DownloadSimple,
  PlugsIcon as Plugs,
  PlayIcon as Play,
  ChartLineUpIcon as ChartLineUp,
  ArrowRightIcon as ArrowRight,
} from "@phosphor-icons/react";

const steps = [
  {
    icon: DownloadSimple,
    step: "01",
    title: "Install",
    command: "npm install -g @candor/proxy",
    description: "One command to install. Zero dependencies on your agent codebase.",
    color: "var(--accent-cyan)",
    colorRgb: "var(--accent-cyan-rgb)",
  },
  {
    icon: Plugs,
    step: "02",
    title: "Configure",
    command: "Route MCP through localhost:3100",
    description: "Swap one line in your MCP client config. Candor becomes the transparent middle layer.",
    color: "var(--accent-indigo)",
    colorRgb: "var(--accent-indigo-rgb)",
  },
  {
    icon: Play,
    step: "03",
    title: "Start",
    command: "candor start",
    description: "The proxy launches alongside the dashboard. Your agents work exactly as before.",
    color: "var(--accent-violet)",
    colorRgb: "var(--accent-violet-rgb)",
  },
  {
    icon: ChartLineUp,
    step: "04",
    title: "Observe",
    command: "Open localhost:3200",
    description: "Watch every tool call, resource read, and response stream in real time.",
    color: "var(--accent-purple)",
    colorRgb: "var(--accent-purple-rgb)",
  },
];

export default function HowItWorks() {
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const items = sectionRef.current?.querySelectorAll("[data-reveal]");
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      style={{
        background: "var(--bg-surface)",
        padding: "120px 24px",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Section header */}
        <div
          data-reveal
          className="reveal-item"
          style={{ textAlign: "center", marginBottom: 80 }}
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
            How it works
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
            Up and running
            <br />
            <span className="gradient-text-accent">in under a minute.</span>
          </h2>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 0,
            position: "relative",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.step}
              data-reveal
              className="reveal-item"
              style={{
                transitionDelay: `${i * 120}ms`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "0 16px",
                position: "relative",
              }}
            >
              {/* Connector arrow (between steps, not after last) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block"
                  style={{
                    position: "absolute",
                    top: 28,
                    right: -12,
                    color: "var(--text-muted)",
                    opacity: 0.4,
                  }}
                >
                  <ArrowRight size={16} weight="bold" />
                </div>
              )}

              {/* Step number + icon */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `rgba(${step.colorRgb}, 0.06)`,
                  border: `1px solid rgba(${step.colorRgb}, 0.15)`,
                  marginBottom: 20,
                  position: "relative",
                }}
              >
                <step.icon size={26} weight="duotone" color={step.color} />
                <span
                  className="font-[family-name:var(--font-ibm-plex-mono)]"
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    fontSize: 10,
                    fontWeight: 600,
                    color: step.color,
                    background: "var(--bg-surface)",
                    border: `1px solid rgba(${step.colorRgb}, 0.19)`,
                    borderRadius: 6,
                    padding: "2px 6px",
                  }}
                >
                  {step.step}
                </span>
              </div>

              {/* Title */}
              <h3
                className="font-[family-name:var(--font-bricolage)]"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                {step.title}
              </h3>

              {/* Command */}
              <code
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  color: step.color,
                  background: `rgba(${step.colorRgb}, 0.03)`,
                  border: `1px solid rgba(${step.colorRgb}, 0.08)`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  marginBottom: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {step.command}
              </code>

              {/* Description */}
              <p
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  maxWidth: 220,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
