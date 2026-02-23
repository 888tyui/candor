"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ActivityIcon as Activity,
  ClockCountdownIcon as ClockCountdown,
  CurrencyDollarIcon as CurrencyDollar,
  CheckCircleIcon as CheckCircle,
  XCircleIcon as XCircle,
  CaretRightIcon as CaretRight,
  CaretDownIcon as CaretDown,
} from "@phosphor-icons/react";

/* ─── Data ─── */
const TOOLS = [
  { name: "filesystem_read", method: "tools/call", avgMs: 25, avgCost: 0.001 },
  { name: "filesystem_write", method: "tools/call", avgMs: 42, avgCost: 0.002 },
  { name: "web_search", method: "tools/call", avgMs: 640, avgCost: 0.028 },
  { name: "github_create_pr", method: "tools/call", avgMs: 920, avgCost: 0.034 },
  { name: "github_search", method: "tools/call", avgMs: 380, avgCost: 0.012 },
  { name: "code_analysis", method: "resources/read", avgMs: 150, avgCost: 0.006 },
  { name: "terminal_exec", method: "tools/call", avgMs: 1200, avgCost: 0.019 },
  { name: "database_query", method: "tools/call", avgMs: 85, avgCost: 0.004 },
];

const AGENTS = ["claude-opus-4", "claude-sonnet-4", "cursor-agent", "custom-bot"];

interface MockEvent {
  id: number;
  status: "ok" | "err";
  time: string;
  method: string;
  tool: string;
  latencyMs: number;
  latency: string;
  cost: number;
  costStr: string;
  sessionId: string;
  params?: string;
  result?: string;
}

interface MockSession {
  id: string;
  agent: string;
  started: string;
  duration: string;
  events: number;
  cost: string;
  errors: number;
}

let counter = 0;

function generateEvent(): MockEvent {
  const t = TOOLS[Math.floor(Math.random() * TOOLS.length)];
  const isError = Math.random() < 0.08;
  const latMs = Math.round(t.avgMs * (0.5 + Math.random()));
  const cost = t.avgCost * (0.7 + Math.random() * 0.6);
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const params = JSON.stringify({ path: `/src/${t.name}.ts`, query: t.name });
  const result = isError ? '{"error":"timeout"}' : `{"status":"ok","bytes":${Math.floor(Math.random() * 5000)}}`;
  return {
    id: counter++,
    status: isError ? "err" : "ok",
    time,
    method: t.method,
    tool: t.name,
    latencyMs: latMs,
    latency: latMs >= 1000 ? `${(latMs / 1000).toFixed(1)}s` : `${latMs}ms`,
    cost,
    costStr: `$${cost.toFixed(4)}`,
    sessionId: `sess-${String(Math.floor(Math.random() * 6) + 1).padStart(3, "0")}`,
    params,
    result,
  };
}

const SESSIONS: MockSession[] = [
  { id: "sess-001", agent: "claude-opus-4", started: "12:36:59", duration: "132s", events: 84, cost: "$2.29", errors: 0 },
  { id: "sess-002", agent: "claude-sonnet-4", started: "12:08:24", duration: "64s", events: 53, cost: "$0.11", errors: 3 },
  { id: "sess-003", agent: "cursor-agent", started: "12:25:42", duration: "242s", events: 62, cost: "$0.21", errors: 2 },
  { id: "sess-004", agent: "custom-bot", started: "12:12:11", duration: "150s", events: 60, cost: "$1.46", errors: 1 },
  { id: "sess-005", agent: "claude-opus-4", started: "12:41:57", duration: "211s", events: 38, cost: "$1.01", errors: 2 },
];

const MAX_VISIBLE = 7;

type TabKey = "timeline" | "sessions" | "costs";

export default function DashboardPreview() {
  const [tab, setTab] = useState<TabKey>("timeline");
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const seed: MockEvent[] = [];
    for (let i = 0; i < 5; i++) seed.push(generateEvent());
    setEvents(seed);
    setTotalEvents(5);
    setTotalCost(seed.reduce((sum, e) => sum + e.cost, 0));
    setErrorCount(seed.filter((e) => e.status === "err").length);

    const interval = setInterval(() => {
      const evt = generateEvent();
      setEvents((prev) => [evt, ...prev].slice(0, MAX_VISIBLE));
      setTotalEvents((n) => n + 1);
      setTotalCost((c) => c + evt.cost);
      if (evt.status === "err") setErrorCount((n) => n + 1);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  /* ─── Cost data for the bar chart ─── */
  const costByTool: Record<string, number> = {};
  for (const e of events) {
    costByTool[e.tool] = (costByTool[e.tool] || 0) + e.cost;
  }
  const sortedCosts = Object.entries(costByTool).sort((a, b) => b[1] - a[1]);
  const maxCost = sortedCosts[0]?.[1] || 1;

  const tabs: { key: TabKey; label: string; icon: typeof Activity }[] = [
    { key: "timeline", label: "Live Timeline", icon: Activity },
    { key: "sessions", label: "Sessions", icon: ClockCountdown },
    { key: "costs", label: "Cost Dashboard", icon: CurrencyDollar },
  ];

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(var(--white-rgb), 0.02) inset, 0 0 120px rgba(var(--accent-indigo-rgb), 0.04)",
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 14px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(var(--white-rgb), 0.01)",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(var(--white-rgb), 0.08)" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(var(--white-rgb), 0.08)" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(var(--white-rgb), 0.08)" }} />
        <span
          className="font-[family-name:var(--font-ibm-plex-mono)]"
          style={{ marginLeft: 8, fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.01em" }}
        >
          candor dashboard
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--status-success)", animation: "pulse 2s infinite" }} />
          <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 9, fontWeight: 600, color: "var(--status-success)", letterSpacing: "0.06em" }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Interactive tab bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 14px",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="font-[family-name:var(--font-figtree)]"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "9px 12px",
              fontSize: 11,
              fontWeight: t.key === tab ? 600 : 400,
              color: t.key === tab ? "var(--accent-indigo)" : "var(--text-muted)",
              borderBottom: t.key === tab ? "2px solid var(--accent-indigo)" : "2px solid transparent",
              marginBottom: -1,
              background: "none",
              border: "none",
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              borderBottomColor: t.key === tab ? "var(--accent-indigo)" : "transparent",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            <t.icon size={12} weight={t.key === tab ? "bold" : "regular"} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "8px 14px",
          borderBottom: "1px solid rgba(var(--white-rgb), 0.03)",
        }}
      >
        {[
          { label: "Events", value: String(totalEvents), color: "var(--accent-indigo)" },
          { label: "Sessions", value: "6", color: "var(--accent-cyan)" },
          { label: "Est. Cost", value: `$${totalCost.toFixed(3)}`, color: "var(--status-success)" },
          { label: "Errors", value: String(errorCount), color: errorCount > 0 ? "var(--status-error)" : "var(--text-muted)" },
        ].map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.label}</span>
            <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 11, fontWeight: 600, color: s.color }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* ─── Tab content ─── */}
      <div style={{ minHeight: 260 }}>
        {/* Timeline */}
        {tab === "timeline" && (
          <div style={{ padding: "2px 0" }}>
            {events.map((evt) => (
              <div key={evt.id}>
                <button
                  onClick={() => toggleExpand(evt.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "14px 14px 62px 72px 1fr auto auto",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    width: "100%",
                    background: expandedId === evt.id ? "rgba(var(--accent-indigo-rgb), 0.04)" : "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(var(--white-rgb), 0.02)",
                    cursor: "pointer",
                    transition: "background 0.12s",
                    textAlign: "left",
                  }}
                >
                  {expandedId === evt.id ? (
                    <CaretDown size={10} color="var(--text-muted)" />
                  ) : (
                    <CaretRight size={10} color="var(--text-muted)" />
                  )}
                  {evt.status === "ok" ? (
                    <CheckCircle size={12} weight="fill" color="var(--status-success)" />
                  ) : (
                    <XCircle size={12} weight="fill" color="var(--status-error)" />
                  )}
                  <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {evt.time}
                  </span>
                  <span
                    className="font-[family-name:var(--font-ibm-plex-mono)]"
                    style={{
                      fontSize: 9,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: evt.method === "resources/read" ? "rgba(var(--accent-violet-rgb), 0.1)" : "rgba(var(--accent-cyan-rgb), 0.1)",
                      color: evt.method === "resources/read" ? "var(--accent-violet)" : "var(--accent-cyan)",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {evt.method}
                  </span>
                  <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>
                    {evt.tool}
                  </span>
                  <span
                    className="font-[family-name:var(--font-ibm-plex-mono)]"
                    style={{
                      fontSize: 10,
                      color: evt.latency.includes("s") || evt.latencyMs > 500 ? "var(--status-warning)" : "var(--text-muted)",
                      textAlign: "right",
                    }}
                  >
                    {evt.latency}
                  </span>
                  <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "right", minWidth: 48 }}>
                    {evt.costStr}
                  </span>
                </button>

                {/* Expanded detail */}
                {expandedId === evt.id && (
                  <div
                    style={{
                      padding: "8px 14px 10px 44px",
                      background: "rgba(var(--accent-indigo-rgb), 0.02)",
                      borderBottom: "1px solid rgba(var(--white-rgb), 0.03)",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 400 }}>
                      <div>
                        <span className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 10, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Session</span>
                        <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--accent-indigo)" }}>{evt.sessionId}</span>
                      </div>
                      <div>
                        <span className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 10, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Status</span>
                        <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: evt.status === "ok" ? "var(--status-success)" : "var(--status-error)" }}>
                          {evt.status === "ok" ? "success" : "error"}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 10, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Params</span>
                      <code className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 9, color: "var(--text-secondary)", lineHeight: 1.5, wordBreak: "break-all" }}>
                        {evt.params}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sessions */}
        {tab === "sessions" && (
          <div style={{ padding: "2px 0" }}>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr 0.8fr 0.7fr 0.6fr 0.6fr 0.5fr",
                gap: 6,
                padding: "8px 14px",
                borderBottom: "1px solid rgba(var(--white-rgb), 0.04)",
              }}
            >
              {["Session", "Agent", "Started", "Duration", "Events", "Cost", "Errors"].map((h) => (
                <span key={h} className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 9, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {h}
                </span>
              ))}
            </div>
            {SESSIONS.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.2fr 0.8fr 0.7fr 0.6fr 0.6fr 0.5fr",
                  gap: 6,
                  padding: "7px 14px",
                  borderBottom: "1px solid rgba(var(--white-rgb), 0.02)",
                }}
              >
                <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--accent-indigo)" }}>{s.id}</span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, fontWeight: 500, color: "var(--text-primary)" }}>{s.agent}</span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.started}</span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.duration}</span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-secondary)" }}>{s.events}</span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, fontWeight: 600, color: "var(--status-success)" }}>{s.cost}</span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: s.errors > 0 ? "var(--status-error)" : "var(--text-muted)" }}>{s.errors}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cost Dashboard */}
        {tab === "costs" && (
          <div style={{ padding: "14px" }}>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { label: "Total Estimated", value: `$${totalCost.toFixed(3)}` },
                { label: "Avg per Session", value: `$${(totalCost / 6).toFixed(3)}` },
                { label: "Total Events", value: String(totalEvents) },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "var(--bg-card)",
                    border: "1px solid rgba(var(--white-rgb), 0.03)",
                  }}
                >
                  <span className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 9, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>{c.label}</span>
                  <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-indigo)" }}>{c.value}</span>
                </div>
              ))}
            </div>
            {/* Bar chart */}
            <span className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: 10 }}>
              Cost by Tool
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sortedCosts.map(([tool, cost]) => (
                <div key={tool} style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", alignItems: "center", gap: 8 }}>
                  <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "right" }}>{tool}</span>
                  <div style={{ height: 14, borderRadius: 3, overflow: "hidden", background: "rgba(var(--white-rgb), 0.03)" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(cost / maxCost) * 100}%`,
                        borderRadius: 3,
                        background: "linear-gradient(90deg, var(--accent-indigo), var(--accent-violet))",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-secondary)", minWidth: 48, textAlign: "right" }}>
                    ${cost.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
