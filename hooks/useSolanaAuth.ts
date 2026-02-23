"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface AuthState {
  token: string | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  isRestoringSession: boolean;
  error: string | null;
}

const STORAGE_KEY = "candor_auth_token";
const STORAGE_WALLET_KEY = "candor_auth_wallet";

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable
  }
}

export function useSolanaAuth() {
  const { publicKey, signMessage, connected, disconnect: walletDisconnect } = useWallet();
  const [state, setState] = useState<AuthState>({
    token: null,
    walletAddress: null,
    isAuthenticated: false,
    isAuthenticating: false,
    isRestoringSession: true, // Start true to prevent flash
    error: null,
  });
  const authAttempted = useRef(false);
  const prevWalletRef = useRef<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const controller = new AbortController();
    const token = safeGetItem(STORAGE_KEY);
    const wallet = safeGetItem(STORAGE_WALLET_KEY);

    if (token && wallet) {
      fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
        .then((res) => {
          if (res.ok) {
            setState({
              token,
              walletAddress: wallet,
              isAuthenticated: true,
              isAuthenticating: false,
              isRestoringSession: false,
              error: null,
            });
          } else {
            safeRemoveItem(STORAGE_KEY);
            safeRemoveItem(STORAGE_WALLET_KEY);
            setState((s) => ({ ...s, isRestoringSession: false }));
          }
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          safeRemoveItem(STORAGE_KEY);
          safeRemoveItem(STORAGE_WALLET_KEY);
          setState((s) => ({ ...s, isRestoringSession: false }));
        });
    } else {
      setState((s) => ({ ...s, isRestoringSession: false }));
    }

    return () => controller.abort();
  }, []);

  // Detect wallet account switch
  useEffect(() => {
    if (!publicKey) {
      prevWalletRef.current = null;
      return;
    }

    const currentWallet = publicKey.toBase58();

    if (prevWalletRef.current && prevWalletRef.current !== currentWallet) {
      // Wallet changed — clear old session and re-authenticate
      safeRemoveItem(STORAGE_KEY);
      safeRemoveItem(STORAGE_WALLET_KEY);
      setState({
        token: null,
        walletAddress: null,
        isAuthenticated: false,
        isAuthenticating: false,
        isRestoringSession: false,
        error: null,
      });
      authAttempted.current = false;
    }

    prevWalletRef.current = currentWallet;
  }, [publicKey]);

  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setState((s) => ({ ...s, error: "Wallet not connected or does not support signing" }));
      return;
    }

    setState((s) => ({ ...s, isAuthenticating: true, error: null }));

    try {
      // Step 1: Get nonce
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceRes.json();

      // Step 2: Construct SIWS message
      const domain = window.location.host;
      const wallet = publicKey.toBase58();
      const now = new Date().toISOString();
      const message = [
        `${domain} wants you to sign in with your Solana account:`,
        wallet,
        "",
        "Sign in to Candor",
        "",
        `URI: https://${domain}`,
        `Version: 1`,
        `Nonce: ${nonce}`,
        `Issued At: ${now}`,
      ].join("\n");

      // Step 3: Sign message
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);

      // Convert to array for JSON serialization
      const signatureArray = Array.from(signatureBytes);

      // Step 4: Verify with server
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          signature: signatureArray,
          publicKey: wallet,
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json();
        throw new Error(errData.error || "Verification failed");
      }

      const { token } = await verifyRes.json();

      // Store token
      safeSetItem(STORAGE_KEY, token);
      safeSetItem(STORAGE_WALLET_KEY, wallet);

      setState({
        token,
        walletAddress: wallet,
        isAuthenticated: true,
        isAuthenticating: false,
        isRestoringSession: false,
        error: null,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Authentication failed";
      setState((s) => ({
        ...s,
        isAuthenticating: false,
        error: errorMsg,
      }));
    }
  }, [publicKey, signMessage]);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (connected && publicKey && !state.isAuthenticated && !state.isAuthenticating && !authAttempted.current) {
      const storedWallet = safeGetItem(STORAGE_WALLET_KEY);
      const storedToken = safeGetItem(STORAGE_KEY);

      // Only auto-authenticate if no stored session or wallet changed
      if (!storedToken || storedWallet !== publicKey.toBase58()) {
        authAttempted.current = true;
        authenticate();
      }
    }
    if (!connected) {
      authAttempted.current = false;
    }
  }, [connected, publicKey, state.isAuthenticated, state.isAuthenticating, authenticate]);

  const logout = useCallback(async () => {
    const token = safeGetItem(STORAGE_KEY);
    if (token) {
      try {
        await fetch("/api/auth/session", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Best effort
      }
    }

    safeRemoveItem(STORAGE_KEY);
    safeRemoveItem(STORAGE_WALLET_KEY);
    setState({
      token: null,
      walletAddress: null,
      isAuthenticated: false,
      isAuthenticating: false,
      isRestoringSession: false,
      error: null,
    });
    walletDisconnect();
  }, [walletDisconnect]);

  return {
    ...state,
    authenticate,
    logout,
  };
}
