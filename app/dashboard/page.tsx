"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import {
  ArrowLeftIcon as ArrowLeft,
} from "@phosphor-icons/react";
import DashboardContent from "@/components/dashboard/DashboardContent";
import OnboardingGuide from "@/components/dashboard/OnboardingGuide";
import LiveDashboard from "@/components/dashboard/LiveDashboard";
import WalletButton from "@/components/dashboard/WalletButton";

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();

  /* ─── Connected: full app layout ─── */
  if (connected && publicKey) {
    return (
      <div style={{ background: "var(--bg-deep)", minHeight: "100dvh" }}>
        {/* Top bar */}
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
              height: 64,
              padding: "0 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <Image src="/mascot.png" alt="Candor" width={32} height={32} style={{ borderRadius: 8 }} />
                <span
                  className="font-[family-name:var(--font-bricolage)]"
                  style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}
                >
                  Candor
                </span>
              </a>
              <div style={{ width: 1, height: 24, background: "var(--border-subtle)" }} />
              <span
                className="font-[family-name:var(--font-figtree)]"
                style={{ fontSize: 13, color: "var(--text-muted)" }}
              >
                Dashboard
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.15)",
                }}
              >
                <span className="glow-pulse-green" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                <span
                  className="font-[family-name:var(--font-ibm-plex-mono)]"
                  style={{ fontSize: 12, color: "var(--text-secondary)" }}
                >
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
              </div>
              <WalletButton />
            </div>
          </div>
        </header>

        <LiveDashboard walletAddress={publicKey.toBase58()} />
      </div>
    );
  }

  /* ─── Not connected: onboarding + demo ─── */
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
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <Image src="/mascot.png" alt="Candor" width={32} height={32} style={{ borderRadius: 8 }} />
              <span
                className="font-[family-name:var(--font-bricolage)]"
                style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}
              >
                Candor
              </span>
            </a>
            <div style={{ width: 1, height: 24, background: "var(--border-subtle)" }} />
            <a
              href="/"
              className="font-[family-name:var(--font-figtree)]"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <ArrowLeft size={14} />
              Back to Home
            </a>
          </div>
          <WalletButton />
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>
        <OnboardingGuide />
        <DashboardContent mode="demo" showDemoBadge />
      </main>
    </div>
  );
}
