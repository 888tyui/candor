"use client";

import {
  PlayCircleIcon as PlayCircle,
  WalletIcon as Wallet,
  RocketLaunchIcon as RocketLaunch,
} from "@phosphor-icons/react";
import WalletButton from "./WalletButton";

const steps = [
  {
    icon: PlayCircle,
    step: "01",
    title: "Explore the Demo",
    description:
      "See live-generated events, sessions, and cost data streaming in real time.",
    color: "#06b6d4",
  },
  {
    icon: Wallet,
    step: "02",
    title: "Connect Your Wallet",
    description:
      "Connect your Solana wallet to authenticate and access your personal dashboard.",
    color: "#6366f1",
  },
  {
    icon: RocketLaunch,
    step: "03",
    title: "Start Observing",
    description:
      "Configure the proxy, point your agents through Candor, and watch the data flow.",
    color: "#8b5cf6",
  },
];

export default function OnboardingGuide() {
  return (
    <div
      style={{
        marginBottom: 32,
        padding: "40px 32px",
        borderRadius: 20,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow:
          "0 16px 64px rgba(0,0,0,0.2), 0 0 0 1px rgba(99,102,241,0.04)",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <span
          className="font-[family-name:var(--font-figtree)]"
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--accent-indigo)",
            marginBottom: 12,
          }}
        >
          Getting Started
        </span>
        <h2
          className="font-[family-name:var(--font-bricolage)]"
          style={{
            fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
            fontWeight: 700,
            lineHeight: 1.2,
            color: "var(--text-primary)",
            marginBottom: 12,
          }}
        >
          Welcome to{" "}
          <span className="gradient-text-accent">Candor</span>
        </h2>
        <p
          className="font-[family-name:var(--font-figtree)]"
          style={{
            maxWidth: 480,
            margin: "0 auto",
            fontSize: 15,
            lineHeight: 1.7,
            color: "var(--text-secondary)",
          }}
        >
          Try the interactive demo, or connect your Solana wallet to
          access your personal dashboard.
        </p>
      </div>

      {/* Steps */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 24,
          marginBottom: 36,
        }}
      >
        {steps.map((s) => (
          <div
            key={s.step}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "20px 12px",
              borderRadius: 16,
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${s.color}10`,
                border: `1px solid ${s.color}25`,
                marginBottom: 14,
                position: "relative",
              }}
            >
              <s.icon size={22} weight="duotone" color={s.color} />
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  fontSize: 9,
                  fontWeight: 600,
                  color: s.color,
                  background: "var(--bg-card)",
                  border: `1px solid ${s.color}30`,
                  borderRadius: 5,
                  padding: "1px 5px",
                }}
              >
                {s.step}
              </span>
            </div>
            <h3
              className="font-[family-name:var(--font-bricolage)]"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 6,
              }}
            >
              {s.title}
            </h3>
            <p
              className="font-[family-name:var(--font-figtree)]"
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: "var(--text-secondary)",
              }}
            >
              {s.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center" }}>
        <WalletButton size="large" />
      </div>
    </div>
  );
}
