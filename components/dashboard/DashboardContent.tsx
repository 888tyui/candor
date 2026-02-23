"use client";

import { useState, useEffect, useRef } from "react";
import {
  ActivityIcon as Activity,
  ClockCountdownIcon as ClockCountdown,
  CurrencyDollarIcon as CurrencyDollar,
  PlayIcon as Play,
  PauseIcon as Pause,
  FunnelSimpleIcon as FunnelSimple,
  CaretRightIcon as CaretRight,
  CaretDownIcon as CaretDown,
  CheckCircleIcon as CheckCircle,
  XCircleIcon as XCircle,
  BroadcastIcon as Broadcast,
  TerminalIcon as Terminal,
} from "@phosphor-icons/react";
import EmptyState from "./EmptyState";

/* ─── Types ─── */
interface DemoEvent {
  id: string;
  timestamp: Date;
  direction: "request" | "response";
  method: string;
  toolName: string;
  latencyMs: number;
  costEstimate: number;
  status: "success" | "error";
  params?: string;
  result?: string;
  sessionId: string;
}

interface DemoSession {
  id: string;
  agentId: string;
  startedAt: Date;
  duration: number;
  eventCount: number;
  totalCost: number;
  errorCount: number;
}

/* ─── Generators ─── */
const TOOLS = [
  { name: "filesystem_read", method: "tools/call", avgLatency: 25 },
  { name: "filesystem_write", method: "tools/call", avgLatency: 42 },
  { name: "github_search", method: "tools/call", avgLatency: 380 },
  { name: "github_create_pr", method: "tools/call", avgLatency: 920 },
  { name: "web_search", method: "tools/call", avgLatency: 640 },
  { name: "code_analysis", method: "resources/read", avgLatency: 150 },
  { name: "terminal_exec", method: "tools/call", avgLatency: 1200 },
  { name: "database_query", method: "tools/call", avgLatency: 85 },
];

const AGENTS = ["claude-opus-4", "claude-sonnet-4", "cursor-agent", "custom-bot"];

let eventCounter = 0;

function generateEvent(sessionId: string): DemoEvent {
  const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
  const latency = Math.round(tool.avgLatency * (0.5 + Math.random()));
  const isError = Math.random() < 0.08;
  eventCounter++;
  return {
    id: `evt-${eventCounter.toString().padStart(4, "0")}`,
    timestamp: new Date(),
    direction: Math.random() > 0.5 ? "request" : "response",
    method: tool.method,
    toolName: tool.name,
    latencyMs: latency,
    costEstimate: parseFloat((latency * 0.00003 + Math.random() * 0.005).toFixed(4)),
    status: isError ? "error" : "success",
    params: `{ "path": "/src/${["index.ts", "utils.ts", "config.json", "README.md"][Math.floor(Math.random() * 4)]}" }`,
    result: isError ? `{ "error": "Permission denied" }` : `{ "content": "..." }`,
    sessionId,
  };
}

function generateSessions(): DemoSession[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `sess-${(i + 1).toString().padStart(3, "0")}`,
    agentId: AGENTS[Math.floor(Math.random() * AGENTS.length)],
    startedAt: new Date(Date.now() - Math.random() * 3600000),
    duration: Math.round(30 + Math.random() * 300),
    eventCount: Math.round(10 + Math.random() * 80),
    totalCost: parseFloat((Math.random() * 2.5).toFixed(2)),
    errorCount: Math.floor(Math.random() * 4),
  }));
}

/* ─── Tab config ─── */
type TabId = "timeline" | "sessions" | "costs";

const tabs: { id: TabId; label: string; icon: typeof Activity }[] = [
  { id: "timeline", label: "Live Timeline", icon: Activity },
  { id: "sessions", label: "Sessions", icon: ClockCountdown },
  { id: "costs", label: "Cost Dashboard", icon: CurrencyDollar },
];

/* ─── Main Component ─── */
export default function DashboardContent({
  mode,
  showDemoBadge = false,
}: {
  mode: "demo" | "live";
  showDemoBadge?: boolean;
}) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>("timeline");
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [sessions] = useState<DemoSession[]>(() =>
    mode === "demo" ? generateSessions() : []
  );
  const [isLive, setIsLive] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [filterTool, setFilterTool] = useState("");

  // Reset state when mode changes
  useEffect(() => {
    setEvents([]);
    setActiveTab("timeline");
    setExpandedEvent(null);
    setFilterTool("");
    setIsLive(true);
  }, [mode]);

  // Generate events in demo mode
  useEffect(() => {
    if (mode !== "demo" || !isLive) return;
    const interval = setInterval(() => {
      const session = sessions[Math.floor(Math.random() * sessions.length)];
      if (session) {
        const evt = generateEvent(session.id);
        setEvents((prev) => [evt, ...prev].slice(0, 50));
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [mode, isLive, sessions]);

  // Auto-scroll timeline
  useEffect(() => {
    if (isLive && timelineRef.current && activeTab === "timeline") {
      timelineRef.current.scrollTop = 0;
    }
  }, [events, isLive, activeTab]);

  const filteredEvents = filterTool
    ? events.filter((e) => e.toolName.includes(filterTool))
    : events;

  const totalCost = events.reduce((s, e) => s + e.costEstimate, 0);
  const errorCount = events.filter((e) => e.status === "error").length;

  return (
    <div>
      {/* Demo badge */}
      {showDemoBadge && (
        <div
          className="font-[family-name:var(--font-figtree)]"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 16px",
            marginBottom: 16,
            borderRadius: 10,
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.12)",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--accent-indigo)",
          }}
        >
          <Broadcast size={14} weight="bold" />
          <span>DEMO MODE — Connect your wallet above to access your real dashboard</span>
        </div>
      )}

      {/* Dashboard chrome */}
      <div
        style={{
          borderRadius: 16,
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          overflow: "hidden",
          boxShadow: "0 16px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.05)",
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "0 16px",
            gap: 0,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="font-[family-name:var(--font-figtree)]"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 20px",
                fontSize: 13,
                fontWeight: 500,
                color: activeTab === tab.id ? "var(--accent-indigo)" : "var(--text-muted)",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid var(--accent-indigo)"
                    : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <tab.icon size={16} weight={activeTab === tab.id ? "fill" : "regular"} />
              {tab.label}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Live indicator (demo mode only) */}
          {mode === "demo" && activeTab === "timeline" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: isLive ? "#22c55e" : "var(--text-muted)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isLive ? "#22c55e" : "var(--text-muted)",
                    animation: isLive ? "pulse 2s infinite" : "none",
                  }}
                />
                {isLive ? "LIVE" : "PAUSED"}
              </span>
              <button
                onClick={() => setIsLive(!isLive)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.15)",
                  color: "var(--accent-indigo)",
                  cursor: "pointer",
                }}
              >
                {isLive ? <Pause size={12} weight="bold" /> : <Play size={12} weight="bold" />}
              </button>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: 24,
            padding: "12px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            overflowX: "auto",
          }}
        >
          <Stat label="Events" value={events.length.toString()} color="var(--accent-cyan)" />
          <Stat
            label="Active Sessions"
            value={sessions.length.toString()}
            color="var(--accent-indigo)"
          />
          <Stat label="Est. Cost" value={`$${totalCost.toFixed(3)}`} color="var(--accent-violet)" />
          <Stat
            label="Errors"
            value={errorCount.toString()}
            color={errorCount > 0 ? "#ef4444" : "var(--text-muted)"}
          />
        </div>

        {/* Content */}
        <div style={{ minHeight: 420, maxHeight: 520, overflow: "hidden" }}>
          {activeTab === "timeline" && (
            mode === "live" && events.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No events yet"
                description="Connect an AI agent through the Candor proxy to start capturing MCP tool calls and responses."
                action={
                  <code
                    className="font-[family-name:var(--font-ibm-plex-mono)]"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 20px",
                      borderRadius: 10,
                      fontSize: 13,
                      background: "rgba(17,19,38,0.5)",
                      border: "1px solid rgba(99,102,241,0.1)",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>$</span>
                    <span style={{ color: "var(--text-secondary)" }}>candor start</span>
                  </code>
                }
              />
            ) : (
              <TimelineView
                ref={timelineRef}
                events={filteredEvents}
                expandedEvent={expandedEvent}
                onToggle={(id) => setExpandedEvent(expandedEvent === id ? null : id)}
                filterTool={filterTool}
                onFilterChange={setFilterTool}
              />
            )
          )}
          {activeTab === "sessions" && (
            mode === "live" && sessions.length === 0 ? (
              <EmptyState
                icon={ClockCountdown}
                title="No sessions recorded"
                description="Sessions appear here once your AI agents start making MCP tool calls through the Candor proxy."
              />
            ) : (
              <SessionsView sessions={sessions} />
            )
          )}
          {activeTab === "costs" && (
            mode === "live" && events.length === 0 ? (
              <EmptyState
                icon={CurrencyDollar}
                title="No cost data"
                description="Cost attribution begins automatically once events start flowing through the proxy."
                action={
                  <code
                    className="font-[family-name:var(--font-ibm-plex-mono)]"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 20px",
                      borderRadius: 10,
                      fontSize: 13,
                      background: "rgba(17,19,38,0.5)",
                      border: "1px solid rgba(99,102,241,0.1)",
                    }}
                  >
                    <Terminal size={14} color="var(--text-muted)" />
                    <span style={{ color: "var(--text-secondary)" }}>
                      npm install -g @candor/proxy
                    </span>
                  </code>
                }
              />
            ) : (
              <CostsView events={events} sessions={sessions} />
            )
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes event-enter {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── Stat chip ─── */
function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
      <span
        className="font-[family-name:var(--font-figtree)]"
        style={{ fontSize: 11, color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className="font-[family-name:var(--font-ibm-plex-mono)]"
        style={{ fontSize: 13, fontWeight: 600, color }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Timeline View ─── */
const TimelineView = ({
  ref,
  events,
  expandedEvent,
  onToggle,
  filterTool,
  onFilterChange,
}: {
  ref: React.Ref<HTMLDivElement>;
  events: DemoEvent[];
  expandedEvent: string | null;
  onToggle: (id: string) => void;
  filterTool: string;
  onFilterChange: (v: string) => void;
}) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <FunnelSimple size={14} color="var(--text-muted)" />
      <input
        type="text"
        placeholder="Filter by tool name..."
        value={filterTool}
        onChange={(e) => onFilterChange(e.target.value)}
        className="font-[family-name:var(--font-figtree)]"
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "var(--text-primary)",
          fontSize: 13,
        }}
      />
    </div>
    <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
      {events.length === 0 ? (
        <div
          className="font-[family-name:var(--font-figtree)]"
          style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}
        >
          Waiting for events...
        </div>
      ) : (
        events.map((evt) => (
          <div
            key={evt.id}
            style={{
              padding: "8px 20px",
              borderBottom: "1px solid rgba(99,102,241,0.04)",
              cursor: "pointer",
              transition: "background 0.15s",
              animation: "event-enter 0.3s ease-out",
            }}
            onClick={() => onToggle(evt.id)}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
              {expandedEvent === evt.id ? (
                <CaretDown size={10} color="var(--text-muted)" />
              ) : (
                <CaretRight size={10} color="var(--text-muted)" />
              )}
              {evt.status === "success" ? (
                <CheckCircle size={14} weight="fill" color="#22c55e" />
              ) : (
                <XCircle size={14} weight="fill" color="#ef4444" />
              )}
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ fontSize: 10, color: "var(--text-muted)", minWidth: 72 }}
              >
                {evt.timestamp.toLocaleTimeString()}
              </span>
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "rgba(99,102,241,0.08)",
                  color: "var(--accent-indigo)",
                }}
              >
                {evt.method}
              </span>
              <span
                className="font-[family-name:var(--font-figtree)]"
                style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 12 }}
              >
                {evt.toolName}
              </span>
              <span style={{ flex: 1 }} />
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  fontSize: 10,
                  color: evt.latencyMs > 500 ? "#f59e0b" : "var(--text-muted)",
                }}
              >
                {evt.latencyMs}ms
              </span>
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ fontSize: 10, color: "var(--text-muted)", minWidth: 56, textAlign: "right" }}
              >
                ${evt.costEstimate.toFixed(4)}
              </span>
            </div>
            {expandedEvent === evt.id && (
              <div
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  marginTop: 8,
                  marginLeft: 24,
                  padding: 12,
                  borderRadius: 8,
                  background: "rgba(6,7,15,0.6)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: 11,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)" }}>session: </span>
                  <span style={{ color: "var(--accent-cyan)" }}>{evt.sessionId}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>params: </span>
                  <span style={{ color: "var(--accent-violet)" }}>{evt.params}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>result: </span>
                  <span style={{ color: evt.status === "error" ? "#ef4444" : "#22c55e" }}>
                    {evt.result}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

/* ─── Sessions View ─── */
function SessionsView({ sessions }: { sessions: DemoSession[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        className="font-[family-name:var(--font-figtree)]"
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
            {["Session", "Agent", "Started", "Duration", "Events", "Cost", "Errors"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "12px 16px",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr
              key={s.id}
              style={{
                borderBottom: "1px solid rgba(99,102,241,0.04)",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "12px 16px" }}>
                <span
                  className="font-[family-name:var(--font-ibm-plex-mono)]"
                  style={{ color: "var(--accent-cyan)", fontSize: 12 }}
                >
                  {s.id}
                </span>
              </td>
              <td style={{ padding: "12px 16px", color: "var(--text-primary)" }}>{s.agentId}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: 12 }}>
                {s.startedAt.toLocaleTimeString()}
              </td>
              <td
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: 12 }}
              >
                {s.duration}s
              </td>
              <td
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: 12 }}
              >
                {s.eventCount}
              </td>
              <td
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ padding: "12px 16px", color: "var(--accent-violet)", fontSize: 12 }}
              >
                ${s.totalCost.toFixed(2)}
              </td>
              <td style={{ padding: "12px 16px" }}>
                <span
                  className="font-[family-name:var(--font-ibm-plex-mono)]"
                  style={{ fontSize: 11, color: s.errorCount > 0 ? "#ef4444" : "#22c55e" }}
                >
                  {s.errorCount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Costs View ─── */
function CostsView({ events, sessions }: { events: DemoEvent[]; sessions: DemoSession[] }) {
  const costByTool: Record<string, number> = {};
  events.forEach((e) => {
    costByTool[e.toolName] = (costByTool[e.toolName] || 0) + e.costEstimate;
  });
  const sortedTools = Object.entries(costByTool).sort((a, b) => b[1] - a[1]);
  const maxCost = sortedTools[0]?.[1] || 1;
  const totalCost = events.reduce((s, e) => s + e.costEstimate, 0);

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <CostCard label="Total Estimated" value={`$${totalCost.toFixed(3)}`} color="var(--accent-violet)" />
        <CostCard
          label="Avg per Session"
          value={`$${sessions.length ? (totalCost / sessions.length).toFixed(3) : "0.000"}`}
          color="var(--accent-indigo)"
        />
        <CostCard label="Active Sessions" value={sessions.length.toString()} color="var(--accent-cyan)" />
        <CostCard label="Total Events" value={events.length.toString()} color="var(--accent-blue)" />
      </div>

      <h3
        className="font-[family-name:var(--font-bricolage)]"
        style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}
      >
        Cost by Tool
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sortedTools.length === 0 ? (
          <span
            className="font-[family-name:var(--font-figtree)]"
            style={{ color: "var(--text-muted)", fontSize: 13 }}
          >
            Collecting data...
          </span>
        ) : (
          sortedTools.map(([tool, cost]) => (
            <div key={tool} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ width: 140, fontSize: 12, color: "var(--text-secondary)", textAlign: "right", flexShrink: 0 }}
              >
                {tool}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 20,
                  borderRadius: 4,
                  background: "rgba(99,102,241,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(4, (cost / maxCost) * 100)}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: "linear-gradient(90deg, var(--accent-indigo), var(--accent-violet))",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ fontSize: 11, color: "var(--accent-violet)", minWidth: 60 }}
              >
                ${cost.toFixed(4)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CostCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <span
        className="font-[family-name:var(--font-figtree)]"
        style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}
      >
        {label}
      </span>
      <span
        className="font-[family-name:var(--font-ibm-plex-mono)]"
        style={{ fontSize: 22, fontWeight: 700, color }}
      >
        {value}
      </span>
    </div>
  );
}
