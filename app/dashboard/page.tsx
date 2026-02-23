"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRightIcon as ArrowUpRight,
  BroadcastIcon as Broadcast,
  ShieldCheckIcon as ShieldCheck,
  ChartLineUpIcon as ChartLineUp,
  PlugIcon as Plug,
  RocketLaunchIcon as RocketLaunch,
  CodeIcon as Code,
  ActivityIcon as Activity,
} from "@phosphor-icons/react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import DashboardPreview from "@/components/dashboard/DashboardPreview";
import LiveDashboard from "@/components/dashboard/LiveDashboard";
import DashboardErrorBoundary from "@/components/dashboard/ErrorBoundary";
import WalletButton from "@/components/dashboard/WalletButton";
import AuthScreen from "@/components/dashboard/AuthScreen";
import { useSolanaAuth } from "@/hooks/useSolanaAuth";

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { isAuthenticated, isAuthenticating, isRestoringSession, error: authError, token, walletAddress, authenticate, logout } = useSolanaAuth();

  /* ─── Restoring session: show loading ─── */
  if (isRestoringSession) {
    return (
      <div
        style={{
          background: "var(--bg-deep)",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Activity size={32} weight="duotone" color="var(--accent-indigo)" style={{ marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite" }} />
          <p className="font-[family-name:var(--font-figtree)]" style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Restoring session...
          </p>
        </div>
      </div>
    );
  }

  /* ─── Connected + Authenticating: show auth screen ─── */
  if (connected && publicKey && !isAuthenticated) {
    return (
      <div style={{ background: "var(--bg-deep)", minHeight: "100dvh" }}>
        <header
          className="nav-glass"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 64,
              padding: "8px 16px",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <Image src="/mascot.png" alt="Candor" width={32} height={32} style={{ borderRadius: 8 }} />
                <span className="font-[family-name:var(--font-bricolage)]" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                  Candor
                </span>
              </Link>
            </div>
            <WalletButton onLogout={logout} />
          </div>
        </header>
        <AuthScreen isAuthenticating={isAuthenticating} error={authError} onRetry={authenticate} />
      </div>
    );
  }

  /* ─── Connected + Authenticated: full app layout ─── */
  if (connected && publicKey && isAuthenticated) {
    return (
      <div style={{ background: "var(--bg-deep)", minHeight: "100dvh" }}>
        <header
          className="nav-glass"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 64,
              padding: "8px 16px",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <Image src="/mascot.png" alt="Candor" width={32} height={32} style={{ borderRadius: 8 }} />
                <span
                  className="font-[family-name:var(--font-bricolage)] hidden sm:inline"
                  style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}
                >
                  Candor
                </span>
              </Link>
              <div className="hidden sm:block" style={{ width: 1, height: 24, background: "var(--border-subtle)" }} />
              <span
                className="font-[family-name:var(--font-figtree)] hidden sm:inline"
                style={{ fontSize: 13, color: "var(--text-muted)" }}
              >
                Dashboard
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  borderRadius: 10,
                  background: "rgba(var(--status-success-rgb), 0.06)",
                  border: "1px solid rgba(var(--status-success-rgb), 0.15)",
                }}
              >
                <span className="glow-pulse-green" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--status-success)" }} />
                <span
                  className="font-[family-name:var(--font-ibm-plex-mono)]"
                  style={{ fontSize: 11, color: "var(--text-secondary)" }}
                >
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
              </div>
              <WalletButton onLogout={logout} />
            </div>
          </div>
        </header>

        <DashboardErrorBoundary>
          <LiveDashboard walletAddress={walletAddress || publicKey.toBase58()} authToken={token} onSessionExpired={logout} />
        </DashboardErrorBoundary>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     NOT CONNECTED — Full onboarding page
     ═══════════════════════════════════════════════════════ */

  return (
    <div style={{ background: "var(--bg-deep)", minHeight: "100dvh" }}>
      <Navbar />

      {/* ─── Hero: Split layout (full viewport) ─── */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: "calc(100dvh - 64px)",
          display: "flex",
          alignItems: "center",
          padding: "60px 24px",
        }}
      >
        {/* Background effects */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-10%",
            left: "25%",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(var(--accent-indigo-rgb), 0.06) 0%, transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(var(--accent-violet-rgb), 0.05) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div
          className="dash-preview-layout"
          style={{
            position: "relative",
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* LEFT — Text + CTA */}
          <div className="dash-preview-cta">
            {/* Badge */}
            <div
              className="anim-fade-up"
              style={{ animationDelay: "0.15s", marginBottom: 28 }}
            >
              <span
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 18px",
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  background: "rgba(var(--accent-indigo-rgb), 0.06)",
                  border: "1px solid rgba(var(--accent-indigo-rgb), 0.12)",
                  color: "var(--accent-indigo)",
                }}
              >
                <span
                  className="animate-pulse"
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-indigo)", display: "inline-block" }}
                />
                Dashboard
              </span>
            </div>

            {/* Headline */}
            <h1
              className="anim-fade-up font-[family-name:var(--font-bricolage)]"
              style={{
                animationDelay: "0.3s",
                fontSize: "clamp(2.2rem, 3.4vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
                color: "var(--text-primary)",
                marginBottom: 20,
              }}
            >
              Your AI agent<br />
              <span className="gradient-text-accent">command center.</span>
            </h1>

            {/* Subtitle */}
            <p
              className="anim-fade-up font-[family-name:var(--font-figtree)]"
              style={{
                animationDelay: "0.4s",
                fontSize: "clamp(0.95rem, 1.05vw, 1.05rem)",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                maxWidth: 420,
                marginBottom: 40,
              }}
            >
              Monitor every MCP tool call, track costs per session, and debug
              agent behavior — all streaming in real time.
            </p>

            {/* CTA row */}
            <div
              className="anim-fade-up"
              style={{
                animationDelay: "0.5s",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              <WalletButton size="large" />
              <Link href="/docs" className="btn-ghost">
                <span>Read the Docs</span>
                <ArrowUpRight size={15} weight="bold" />
              </Link>
            </div>

            {/* Install command */}
            <div className="anim-fade-up" style={{ animationDelay: "0.6s" }}>
              <code
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 20px",
                  borderRadius: 12,
                  fontSize: 14,
                  background: "rgba(17,19,38,0.5)",
                  border: "1px solid rgba(var(--accent-indigo-rgb), 0.1)",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>$</span>
                <span style={{ color: "var(--text-secondary)" }}>npm i -g @candor/proxy</span>
              </code>
            </div>
          </div>

          {/* RIGHT — Live animated dashboard preview */}
          <div
            className="anim-fade-up dash-preview-visual"
            style={{ animationDelay: "0.35s" }}
          >
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ─── How it works: 3 steps ─── */}
      <section style={{ position: "relative" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(var(--accent-indigo-rgb), 0.12), transparent)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 24px 80px" }}>
          <div
            className="anim-fade-up"
            style={{ animationDelay: "0.1s", textAlign: "center", marginBottom: 48 }}
          >
            <span
              className="font-[family-name:var(--font-figtree)]"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Get Started in 3 Steps
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                icon: Code,
                step: "01",
                title: "Install the proxy",
                desc: "One command to install Candor globally. Zero config required — just point your agent through the proxy.",
                color: "var(--accent-cyan)",
                colorRgb: "var(--accent-cyan-rgb)",
                delay: "0.2s",
              },
              {
                icon: Plug,
                step: "02",
                title: "Connect your wallet",
                desc: "Authenticate with Phantom, Solflare, or any Solana wallet to unlock your personal dashboard.",
                color: "var(--accent-indigo)",
                colorRgb: "var(--accent-indigo-rgb)",
                delay: "0.3s",
              },
              {
                icon: RocketLaunch,
                step: "03",
                title: "Start observing",
                desc: "Every tool call, resource read, and response streams to your dashboard in real time.",
                color: "var(--accent-violet)",
                colorRgb: "var(--accent-violet-rgb)",
                delay: "0.4s",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="anim-fade-up interactive-card"
                style={{
                  animationDelay: s.delay,
                  padding: "32px 28px",
                  borderRadius: 16,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span
                  className="font-[family-name:var(--font-bricolage)]"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: -12,
                    right: 16,
                    fontSize: 72,
                    fontWeight: 800,
                    color: `rgba(${s.colorRgb}, 0.024)`,
                    lineHeight: 1,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {s.step}
                </span>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `rgba(${s.colorRgb}, 0.05)`,
                      border: `1px solid rgba(${s.colorRgb}, 0.125)`,
                      marginBottom: 18,
                    }}
                  >
                    <s.icon size={22} weight="duotone" color={s.color} />
                  </div>
                  <h3
                    className="font-[family-name:var(--font-bricolage)]"
                    style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="font-[family-name:var(--font-figtree)]"
                    style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text-secondary)" }}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature highlights ─── */}
      <section style={{ position: "relative" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(var(--accent-indigo-rgb), 0.08), transparent)" }} />
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "64px 24px 72px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {[
            { icon: Broadcast, label: "Real-time streaming", desc: "Events appear the moment they happen", color: "var(--accent-cyan)" },
            { icon: ChartLineUp, label: "Cost tracking", desc: "Per-tool and per-session cost breakdowns", color: "var(--accent-violet)" },
            { icon: ShieldCheck, label: "< 5ms overhead", desc: "Transparent proxy, zero latency impact", color: "var(--status-success)" },
            { icon: Activity, label: "Error detection", desc: "Spot failures and anomalies instantly", color: "var(--status-error)" },
          ].map((f) => (
            <div
              key={f.label}
              className="anim-fade-up"
              style={{
                padding: "24px 22px",
                borderRadius: 14,
                background: "rgba(var(--white-rgb), 0.015)",
                border: "1px solid rgba(var(--white-rgb), 0.04)",
              }}
            >
              <f.icon size={20} weight="duotone" color={f.color} style={{ marginBottom: 12 }} />
              <div
                className="font-[family-name:var(--font-figtree)]"
                style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}
              >
                {f.label}
              </div>
              <div
                className="font-[family-name:var(--font-figtree)]"
                style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
