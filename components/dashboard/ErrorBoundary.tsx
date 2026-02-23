"use client";

import { Component, type ReactNode } from "react";
import { ArrowClockwiseIcon as ArrowClockwise, WarningCircleIcon as WarningCircle } from "@phosphor-icons/react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[DashboardErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100dvh - 64px)",
            padding: 32,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <WarningCircle
              size={48}
              weight="duotone"
              color="var(--status-error)"
              style={{ marginBottom: 16 }}
            />
            <h2
              className="font-[family-name:var(--font-bricolage)]"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              Something went wrong
            </h2>
            <p
              className="font-[family-name:var(--font-figtree)]"
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              The dashboard encountered an unexpected error. Try refreshing the page.
            </p>
            {this.state.error && (
              <pre
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  fontSize: 11,
                  color: "var(--status-error)",
                  background: "rgba(var(--status-error-rgb), 0.06)",
                  border: "1px solid rgba(var(--status-error-rgb), 0.15)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  textAlign: "left",
                  overflow: "auto",
                  maxHeight: 120,
                  marginBottom: 20,
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="font-[family-name:var(--font-figtree)]"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 10,
                border: "1px solid rgba(var(--accent-indigo-rgb), 0.3)",
                background: "rgba(var(--accent-indigo-rgb), 0.1)",
                color: "var(--accent-indigo)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <ArrowClockwise size={16} weight="bold" />
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
