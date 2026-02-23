"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback } from "react";
import {
  WalletIcon as Wallet,
  SignOutIcon as SignOut,
} from "@phosphor-icons/react";

export default function WalletButton({ size = "default", onLogout }: { size?: "default" | "large"; onLogout?: () => void }) {
  const { connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = useCallback(() => {
    if (connected) {
      if (onLogout) {
        onLogout();
      } else {
        disconnect();
      }
    } else {
      setVisible(true);
    }
  }, [connected, disconnect, setVisible, onLogout]);

  const isLarge = size === "large";

  if (connected) {
    return (
      <button
        onClick={handleClick}
        className="font-[family-name:var(--font-figtree)]"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: isLarge ? "12px 24px" : "8px 16px",
          fontSize: isLarge ? 14 : 13,
          fontWeight: 500,
          color: "var(--text-secondary)",
          background: "transparent",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
          e.currentTarget.style.borderColor = "rgba(var(--accent-indigo-rgb), 0.3)";
          e.currentTarget.style.background = "rgba(var(--accent-indigo-rgb), 0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-secondary)";
          e.currentTarget.style.borderColor = "var(--border-subtle)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <SignOut size={isLarge ? 16 : 14} weight="bold" />
        <span>Disconnect</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      className="btn-primary font-[family-name:var(--font-figtree)]"
      style={{
        padding: isLarge ? "14px 32px" : "10px 20px",
        fontSize: isLarge ? 15 : 13,
        opacity: connecting ? 0.7 : 1,
      }}
    >
      <Wallet size={isLarge ? 18 : 16} weight="bold" />
      <span>{connecting ? "Connecting..." : "Connect Wallet"}</span>
    </button>
  );
}
