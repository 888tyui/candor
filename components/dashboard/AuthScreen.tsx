"use client";

import {
  ShieldCheckIcon as ShieldCheck,
  SpinnerIcon as Spinner,
  WarningCircleIcon as WarningCircle,
  ArrowClockwiseIcon as ArrowClockwise,
} from "@phosphor-icons/react";

export default function AuthScreen({
  isAuthenticating,
  error,
  onRetry,
}: {
  isAuthenticating: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100dvh - 64px)",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {isAuthenticating ? (
        <>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(var(--accent-indigo-rgb), 0.08)",
              border: "1px solid rgba(var(--accent-indigo-rgb), 0.15)",
              marginBottom: 24,
            }}
          >
            <ShieldCheck size={28} weight="duotone" color="var(--accent-indigo)" className="animate-pulse" />
          </div>
          <h2
            className="font-[family-name:var(--font-bricolage)]"
            style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}
          >
            Verify your wallet
          </h2>
          <p
            className="font-[family-name:var(--font-figtree)]"
            style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 360, lineHeight: 1.7 }}
          >
            Please sign the message in your wallet to authenticate.
            This proves ownership without sharing your private key.
          </p>
        </>
      ) : error ? (
        <>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(var(--status-error-rgb), 0.08)",
              border: "1px solid rgba(var(--status-error-rgb), 0.15)",
              marginBottom: 24,
            }}
          >
            <WarningCircle size={28} weight="duotone" color="var(--status-error)" />
          </div>
          <h2
            className="font-[family-name:var(--font-bricolage)]"
            style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}
          >
            Authentication failed
          </h2>
          <p
            className="font-[family-name:var(--font-figtree)]"
            style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 360, lineHeight: 1.7, marginBottom: 20 }}
          >
            {error}
          </p>
          <button
            onClick={onRetry}
            className="btn-primary font-[family-name:var(--font-figtree)]"
            style={{ padding: "10px 24px", fontSize: 13 }}
          >
            <ArrowClockwise size={14} weight="bold" />
            <span>Try Again</span>
          </button>
        </>
      ) : null}
    </div>
  );
}
