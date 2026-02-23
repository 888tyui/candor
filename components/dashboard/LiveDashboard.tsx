"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  HouseIcon as House,
  ListIcon as List,
  ActivityIcon as Activity,
  ClockCountdownIcon as ClockCountdown,
  CurrencyDollarIcon as CurrencyDollar,
  GearSixIcon as GearSix,
  BellSimpleIcon as BellSimple,
  CopyIcon as Copy,
  CheckIcon as Check,
  CircleIcon as Circle,
  PlugsConnectedIcon as PlugsConnected,
  WifiHighIcon as WifiHigh,
  WifiSlashIcon as WifiSlash,
  ArrowClockwiseIcon as ArrowClockwise,
  TerminalWindowIcon as TerminalWindow,
  ShieldCheckIcon as ShieldCheck,
  RocketLaunchIcon as RocketLaunch,
  ChartLineUpIcon as ChartLineUp,
  FunnelSimpleIcon as FunnelSimple,
  CaretRightIcon as CaretRight,
  CaretDownIcon as CaretDown,
  CheckCircleIcon as CheckCircle,
  XCircleIcon as XCircle,
  PlayIcon as Play,
  PauseIcon as Pause,
  LightningIcon as Lightning,
  ClockIcon as Clock,
  WarningIcon as Warning,
  ArrowUpRightIcon as ArrowUpRight,
  KeyIcon as Key,
  EyeIcon as Eye,
  EyeSlashIcon as EyeSlash,
  TrashIcon as Trash,
} from "@phosphor-icons/react";

/* ─── Types ─── */
interface LiveEvent {
  id: string;
  timestamp: Date;
  method: string;
  toolName: string;
  latencyMs: number;
  costEstimate: number;
  status: "success" | "error";
  sessionId: string;
  params?: string;
  result?: string;
}

interface LiveSession {
  id: string;
  agentId: string;
  startedAt: Date;
  duration: number;
  eventCount: number;
  totalCost: number;
  errorCount: number;
}

type PageId = "overview" | "timeline" | "sessions" | "costs" | "alerts" | "settings";

const sidebarItems: { id: PageId; label: string; icon: typeof House }[] = [
  { id: "overview", label: "Overview", icon: House },
  { id: "timeline", label: "Timeline", icon: Activity },
  { id: "sessions", label: "Sessions", icon: ClockCountdown },
  { id: "costs", label: "Costs", icon: CurrencyDollar },
  { id: "alerts", label: "Alerts", icon: BellSimple },
  { id: "settings", label: "Settings", icon: GearSix },
];

/* ─── Main ─── */
export default function LiveDashboard({ walletAddress, authToken, onSessionExpired }: { walletAddress: string; authToken?: string | null; onSessionExpired?: () => void }) {
  const [activePage, setActivePage] = useState<PageId>("overview");
  const [proxyConnected, setProxyConnected] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [stats, setStats] = useState<{ totalEvents: number; totalCost: number; activeSessions: number; errorRate: number } | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3101";
  const proxyHealthUrl = process.env.NEXT_PUBLIC_PROXY_URL
    ? `${process.env.NEXT_PUBLIC_PROXY_URL}/health`
    : "/api/proxy-health";

  /** Authenticated fetch that handles 401 globally */
  const authFetch = useCallback(async (url: string) => {
    if (!authToken) return null;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 401) {
      onSessionExpired?.();
      return null;
    }
    if (!res.ok) return null;
    return res.json();
  }, [authToken, onSessionExpired]);

  // Check proxy connection by pinging health endpoint
  useEffect(() => {
    const checkProxy = async () => {
      try {
        const res = await fetch(proxyHealthUrl, { signal: AbortSignal.timeout(3000) });
        setProxyConnected(res.ok);
      } catch {
        setProxyConnected(false);
      }
    };
    checkProxy();
    const interval = setInterval(checkProxy, 10000);
    return () => clearInterval(interval);
  }, [proxyHealthUrl]);

  // Fetch initial data from API
  useEffect(() => {
    if (!authToken) return;
    const controller = new AbortController();

    setDataError(null);

    Promise.all([
      authFetch("/api/stats?period=24h"),
      authFetch("/api/sessions?pageSize=20"),
      authFetch("/api/events?pageSize=50"),
      authFetch("/api/alerts?acknowledged=false&pageSize=1"),
    ])
      .then(([statsData, sessionsData, eventsData, alertsData]) => {
        if (controller.signal.aborted) return;

        if (statsData) setStats(statsData);

        if (sessionsData?.data) {
          setSessions(sessionsData.data.map((s: Record<string, unknown>) => ({
            id: s.id as string,
            agentId: (s.agentId as string) || "unknown",
            startedAt: new Date(s.startedAt as string),
            duration: s.endedAt ? Math.round((new Date(s.endedAt as string).getTime() - new Date(s.startedAt as string).getTime()) / 1000) : 0,
            eventCount: (s._count as Record<string, number>)?.events || 0,
            totalCost: (s.totalCostEstimate as number) || 0,
            errorCount: 0,
          })));
        }

        if (eventsData?.data) {
          setEvents(eventsData.data.map((e: Record<string, unknown>) => ({
            id: e.id as string,
            timestamp: new Date(e.timestamp as string),
            method: (e.method as string) || "unknown",
            toolName: (e.toolName as string) || "unknown",
            latencyMs: (e.latencyMs as number) || 0,
            costEstimate: (e.costEstimate as number) || 0,
            status: e.error ? "error" : "success",
            sessionId: e.sessionId as string,
            params: e.params ? JSON.stringify(e.params) : undefined,
            result: e.result ? JSON.stringify(e.result) : e.error ? JSON.stringify(e.error) : undefined,
          })));
        }

        if (alertsData) setAlertCount(alertsData.total || 0);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setDataError(err instanceof Error ? err.message : "Failed to load data");
      });

    return () => controller.abort();
  }, [authToken, authFetch]);

  // WebSocket for real-time events
  useEffect(() => {
    if (!wsUrl) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let reconnectAttempts = 0;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          setWsConnected(true);
          reconnectAttempts = 0;
          ws?.send(JSON.stringify({ type: "subscribe", payload: { userId: walletAddress } }));
        };
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === "event" && msg.payload) {
              const p = msg.payload;
              const newEvent: LiveEvent = {
                id: p.id,
                timestamp: new Date(p.timestamp),
                method: p.method || "unknown",
                toolName: p.toolName || "unknown",
                latencyMs: p.latencyMs || 0,
                costEstimate: p.costEstimate || 0,
                status: p.error ? "error" as const : "success" as const,
                sessionId: p.sessionId,
                params: p.params ? JSON.stringify(p.params) : undefined,
                result: p.result ? JSON.stringify(p.result) : p.error ? JSON.stringify(p.error) : undefined,
              };
              setEvents((prev) => [newEvent, ...prev].slice(0, 500));
            }
            if (msg.type === "alert") {
              setAlertCount((c) => c + 1);
            }
          } catch {
            // Malformed WS message — ignore
          }
        };
        ws.onclose = () => {
          setWsConnected(false);
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectAttempts++;
          reconnectTimer = setTimeout(connect, delay);
        };
        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        setWsConnected(false);
      }
    };

    connect();
    return () => {
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [wsUrl, walletAddress]);

  return (
    <div style={{ display: "flex", minHeight: "calc(100dvh - 64px)", position: "relative" }}>
      {/* Mobile sidebar toggle */}
      <button
        className="lg:!hidden flex items-center justify-center"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 60,
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(var(--accent-indigo-rgb), 0.9), rgba(var(--accent-violet-rgb), 0.9))",
          border: "1px solid rgba(var(--accent-violet-rgb), 0.3)",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(var(--accent-indigo-rgb), 0.3)",
        }}
        aria-label="Toggle sidebar"
      >
        <List size={20} weight="bold" />
      </button>

      {/* Mobile sidebar overlay */}
      <div
        className="lg:!hidden"
        style={{
          position: "fixed",
          inset: 0,
          top: 64,
          zIndex: 45,
          background: "rgba(var(--bg-deep-rgb), 0.6)",
          backdropFilter: "blur(4px)",
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`dash-sidebar${sidebarOpen ? " open" : ""}`}
        role="navigation"
        aria-label="Dashboard navigation"
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
            aria-current={activePage === item.id ? "page" : undefined}
            className={`sidebar-item font-[family-name:var(--font-figtree)]${activePage === item.id ? " active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: activePage === item.id ? 500 : 400,
              color: activePage === item.id ? "var(--text-primary)" : "var(--text-secondary)",
              background: activePage === item.id ? "rgba(var(--accent-indigo-rgb), 0.08)" : "transparent",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              if (activePage !== item.id) {
                e.currentTarget.style.background = "rgba(var(--accent-indigo-rgb), 0.04)";
                e.currentTarget.style.color = "var(--text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (activePage !== item.id) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }
            }}
          >
            <item.icon
              size={18}
              weight={activePage === item.id ? "fill" : "regular"}
              color={activePage === item.id ? "var(--accent-indigo)" : "currentColor"}
            />
            {item.label}
            {item.id === "alerts" && alertCount > 0 && (
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 6,
                  background: "rgba(var(--status-error-rgb), 0.12)",
                  color: "var(--status-error)",
                }}
              >
                {alertCount}
              </span>
            )}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Connection status */}
        <div role="status" aria-label="Connection status" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: proxyConnected ? "rgba(var(--status-success-rgb), 0.06)" : "rgba(var(--status-error-rgb), 0.06)",
              border: `1px solid ${proxyConnected ? "rgba(var(--status-success-rgb), 0.15)" : "rgba(var(--status-error-rgb), 0.15)"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {proxyConnected ? (
                <PlugsConnected size={13} weight="bold" color="var(--status-success)" />
              ) : (
                <WifiSlash size={13} weight="bold" color="var(--status-error)" />
              )}
              <span
                className="font-[family-name:var(--font-figtree)]"
                style={{ fontSize: 11, fontWeight: 500, color: proxyConnected ? "var(--status-success)" : "var(--status-error)" }}
              >
                {proxyConnected ? "Proxy" : "Proxy Offline"}
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: wsConnected ? "rgba(var(--status-success-rgb), 0.06)" : "rgba(var(--status-error-rgb), 0.06)",
              border: `1px solid ${wsConnected ? "rgba(var(--status-success-rgb), 0.15)" : "rgba(var(--status-error-rgb), 0.15)"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {wsConnected ? (
                <WifiHigh size={13} weight="bold" color="var(--status-success)" />
              ) : (
                <WifiSlash size={13} weight="bold" color="var(--status-error)" />
              )}
              <span
                className="font-[family-name:var(--font-figtree)]"
                style={{ fontSize: 11, fontWeight: 500, color: wsConnected ? "var(--status-success)" : "var(--status-error)" }}
              >
                {wsConnected ? "Live" : "Reconnecting..."}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main role="main" aria-label="Dashboard content" style={{ flex: 1, overflow: "auto", padding: "24px 16px" }} className="lg:!px-8">
        {dataError && (
          <div
            role="alert"
            className="font-[family-name:var(--font-figtree)]"
            style={{
              padding: "12px 16px",
              marginBottom: 16,
              borderRadius: 10,
              background: "rgba(var(--status-error-rgb), 0.08)",
              border: "1px solid rgba(var(--status-error-rgb), 0.2)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "var(--status-error)",
            }}
          >
            <Warning size={16} weight="bold" />
            <span>Failed to load data. Check your connection and try refreshing.</span>
          </div>
        )}
        <div key={activePage} className="page-enter">
        {activePage === "overview" && (
          <OverviewPage
            walletAddress={walletAddress}
            proxyConnected={proxyConnected}
            events={events}
            sessions={sessions}
          />
        )}
        {activePage === "timeline" && <TimelinePage events={events} />}
        {activePage === "sessions" && <SessionsPage sessions={sessions} />}
        {activePage === "costs" && <CostsPage events={events} sessions={sessions} />}
        {activePage === "alerts" && <AlertsPage authToken={authToken} />}
        {activePage === "settings" && <SettingsPage walletAddress={walletAddress} />}
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   OVERVIEW PAGE
   ═══════════════════════════════════════════ */
function OverviewPage({
  walletAddress,
  proxyConnected,
  events,
  sessions,
}: {
  walletAddress: string;
  proxyConnected: boolean;
  events: LiveEvent[];
  sessions: LiveSession[];
}) {
  return (
    <div>
      <PageHeader title="Overview" subtitle="Your Candor dashboard at a glance." />

      {/* Status cards row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatusCard
          icon={PlugsConnected}
          label="Proxy Status"
          value={proxyConnected ? "Connected" : "Offline"}
          color={proxyConnected ? "var(--status-success)" : "var(--status-error)"}
        />
        <StatusCard icon={Activity} label="Total Events" value={events.length.toString()} color="var(--accent-cyan)" />
        <StatusCard icon={ClockCountdown} label="Active Sessions" value={sessions.length.toString()} color="var(--accent-indigo)" />
        <StatusCard
          icon={CurrencyDollar}
          label="Est. Cost (Today)"
          value={`$${events.reduce((s, e) => s + e.costEstimate, 0).toFixed(3)}`}
          color="var(--accent-violet)"
        />
      </div>

      {/* Quick Setup + Recent Activity side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 28 }}>
        {/* Quick Setup */}
        <Card>
          <CardHeader icon={RocketLaunch} title="Quick Setup" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SetupStep
              number="1"
              title="Install the Proxy"
              done={true}
              command="npm install -g @candor/proxy"
            />
            <SetupStep
              number="2"
              title="Configure your MCP client"
              done={false}
              description="Point your MCP client through the Candor proxy on localhost:3100."
            />
            <SetupStep
              number="3"
              title="Start the proxy"
              done={false}
              command="candor start"
            />
          </div>
        </Card>

        {/* Proxy Configuration */}
        <Card>
          <CardHeader icon={TerminalWindow} title="Proxy Configuration" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ConfigBlock
              label="Proxy Endpoint"
              value="http://localhost:3100"
            />
            <ConfigBlock
              label="Dashboard"
              value="http://localhost:3200"
            />
            <ConfigBlock
              label="MCP Config Snippet"
              value={`{
  "mcpServers": {
    "candor-proxy": {
      "url": "http://localhost:3100/sse"
    }
  }
}`}
              multiline
            />
          </div>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader icon={Activity} title="Recent Activity" />
        {events.length === 0 ? (
          <div
            className="font-[family-name:var(--font-figtree)]"
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 14,
            }}
          >
            <Image
              src="/mascot.png"
              alt="Candor mascot"
              width={56}
              height={56}
              style={{ marginBottom: 12, borderRadius: 12, opacity: 0.85, display: "block", margin: "0 auto 12px" }}
            />
            <p style={{ marginBottom: 6 }}>No events captured yet.</p>
            <p style={{ fontSize: 12 }}>
              Start the proxy and make some MCP calls to see them appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {events.slice(0, 8).map((evt) => (
              <MiniEventRow key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TIMELINE PAGE
   ═══════════════════════════════════════════ */
function TimelinePage({ events }: { events: LiveEvent[] }) {
  const [filterTool, setFilterTool] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const filtered = filterTool ? events.filter((e) => e.toolName.includes(filterTool)) : events;

  return (
    <div>
      <PageHeader title="Live Timeline" subtitle="Real-time stream of all MCP events." />

      <Card noPadding>
        {/* Filter + controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 20px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <FunnelSimple size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Filter by tool name..."
            aria-label="Filter events by tool name"
            value={filterTool}
            onChange={(e) => setFilterTool(e.target.value)}
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
          <span
            className="font-[family-name:var(--font-ibm-plex-mono)]"
            style={{ fontSize: 11, color: "var(--text-muted)" }}
          >
            {filtered.length} events
          </span>
        </div>

        {/* Event list */}
        <div ref={timelineRef} style={{ minHeight: 460, maxHeight: 600, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div
              className="font-[family-name:var(--font-figtree)]"
              style={{ padding: "60px 20px", textAlign: "center" }}
            >
              <Image
                src="/mascot.png"
                alt="Candor mascot"
                width={64}
                height={64}
                style={{ marginBottom: 16, borderRadius: 14, opacity: 0.85, display: "block", margin: "0 auto 16px" }}
              />
              <p style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                Waiting for events
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 13, maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>
                Events will appear here in real time once your AI agents start making MCP tool calls through the proxy.
              </p>
            </div>
          ) : (
            filtered.map((evt) => (
              <EventRow
                key={evt.id}
                event={evt}
                expanded={expandedEvent === evt.id}
                onToggle={() => setExpandedEvent(expandedEvent === evt.id ? null : evt.id)}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SESSIONS PAGE
   ═══════════════════════════════════════════ */
function SessionsPage({ sessions }: { sessions: LiveSession[] }) {
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(sessions.length / PAGE_SIZE);
  const paged = sessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader title="Sessions" subtitle="Browse historical agent sessions." />

      <Card noPadding>
        {sessions.length === 0 ? (
          <div
            className="font-[family-name:var(--font-figtree)]"
            style={{ padding: "60px 20px", textAlign: "center" }}
          >
            <ClockCountdown size={40} weight="duotone" color="var(--accent-indigo)" style={{ marginBottom: 16 }} />
            <p style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
              No sessions yet
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, maxWidth: 340, margin: "0 auto", lineHeight: 1.6 }}>
              Sessions are created automatically when your AI agents connect through the Candor proxy. Each session groups related MCP events together.
            </p>
          </div>
        ) : (
          <>
          <TableScroll>
            <table
              className="font-[family-name:var(--font-figtree)]"
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Session", "Agent", "Started", "Duration", "Events", "Cost", "Errors"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      style={{
                        padding: "12px 16px",
                        fontWeight: 500,
                        color: "var(--text-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", color: "var(--accent-indigo)", fontFamily: "var(--font-ibm-plex-mono)", fontSize: 12 }}>
                      {s.id.slice(0, 8)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)" }}>
                      {s.agentId || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                      {s.startedAt.toLocaleTimeString()}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                      {s.duration < 60
                        ? `${s.duration}s`
                        : `${Math.floor(s.duration / 60)}m ${s.duration % 60}s`}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)" }}>
                      {s.eventCount}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)", fontFamily: "var(--font-ibm-plex-mono)", fontSize: 12 }}>
                      ${s.totalCost.toFixed(4)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {s.errorCount > 0 ? (
                        <span style={{ color: "var(--accent-red, #ef4444)", fontWeight: 600 }}>{s.errorCount}</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COSTS PAGE
   ═══════════════════════════════════════════ */
function CostsPage({ events, sessions }: { events: LiveEvent[]; sessions: LiveSession[] }) {
  const totalCost = events.reduce((s, e) => s + e.costEstimate, 0);

  return (
    <div>
      <PageHeader title="Cost Dashboard" subtitle="Track and analyze your AI agent spending." />

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <MetricCard label="Total Estimated" value={`$${totalCost.toFixed(3)}`} color="var(--accent-violet)" />
        <MetricCard
          label="Avg per Session"
          value={`$${sessions.length ? (totalCost / sessions.length).toFixed(3) : "0.000"}`}
          color="var(--accent-indigo)"
        />
        <MetricCard label="Active Sessions" value={sessions.length.toString()} color="var(--accent-cyan)" />
        <MetricCard label="Total Events" value={events.length.toString()} color="var(--accent-blue)" />
      </div>

      {/* Cost by tool */}
      <Card>
        <CardHeader icon={ChartLineUp} title="Cost by Tool" />
        {events.length === 0 ? (
          <div
            className="font-[family-name:var(--font-figtree)]"
            style={{ padding: "40px 20px", textAlign: "center" }}
          >
            <CurrencyDollar size={36} weight="duotone" color="var(--accent-violet)" style={{ marginBottom: 12 }} />
            <p style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              No cost data yet
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, maxWidth: 300, margin: "0 auto", lineHeight: 1.6 }}>
              Cost attribution begins automatically once events start flowing through the proxy.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {(() => {
              const toolCosts = new Map<string, { count: number; cost: number }>();
              for (const e of events) {
                const name = e.toolName || "unknown";
                const existing = toolCosts.get(name) || { count: 0, cost: 0 };
                existing.count++;
                existing.cost += e.costEstimate;
                toolCosts.set(name, existing);
              }
              const sorted = Array.from(toolCosts.entries()).sort((a, b) => b[1].cost - a[1].cost);
              const maxCost = sorted[0]?.[1].cost || 1;
              return sorted.map(([name, data]) => (
                <div key={name} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{name}</span>
                    <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 12, color: "var(--accent-violet)" }}>${data.cost.toFixed(4)}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "var(--bg-deep)" }}>
                    <div role="progressbar" aria-valuenow={Math.round((data.cost / maxCost) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${name} cost proportion`} style={{ height: "100%", borderRadius: 2, background: "var(--accent-indigo)", width: `${(data.cost / maxCost) * 100}%`, transition: "width 0.3s" }} />
                  </div>
                  <span className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>{data.count} events</span>
                </div>
              ));
            })()}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ALERTS PAGE
   ═══════════════════════════════════════════ */
interface AlertRule {
  id: string;
  name: string;
  condition: { type: string; threshold: number; window?: number; toolName?: string };
  webhookUrl?: string;
  enabled: boolean;
}

interface AlertItem {
  id: string;
  message: string;
  severity: string;
  acknowledged: boolean;
  createdAt: string;
  rule?: { name: string };
}

function AlertsPage({ authToken }: { authToken?: string | null }) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) return;
    const headers = { Authorization: `Bearer ${authToken}` };

    Promise.all([
      fetch("/api/alert-rules", { headers }).then((r) => r.ok ? r.json() : { data: [] }),
      fetch("/api/alerts?pageSize=20", { headers }).then((r) => r.ok ? r.json() : { data: [] }),
    ])
      .then(([rulesData, alertsData]) => {
        setRules(rulesData.data || rulesData || []);
        setAlerts(alertsData.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authToken]);

  const conditionIcon = (type: string) => {
    switch (type) {
      case "latency": return Clock;
      case "cost_spike": return CurrencyDollar;
      case "error_rate": return Warning;
      case "tool_failure": return XCircle;
      default: return BellSimple;
    }
  };

  const conditionLabel = (c: AlertRule["condition"]) => {
    switch (c.type) {
      case "latency": return `> ${c.threshold}ms`;
      case "cost_spike": return `> $${c.threshold.toFixed(2)}`;
      case "error_rate": return `> ${(c.threshold * 100).toFixed(0)}%`;
      case "tool_failure": return c.toolName || "Any tool";
      case "event_count": return `> ${c.threshold} events`;
      default: return `${c.type}: ${c.threshold}`;
    }
  };

  const toggleRule = async (rule: AlertRule) => {
    if (!authToken) return;
    const res = await fetch(`/api/alert-rules/${rule.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !rule.enabled }),
    });
    if (res.ok) {
      setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
    }
  };

  return (
    <div>
      <PageHeader title="Alert Rules" subtitle="Configure alerts for latency, costs, and errors." />

      {loading ? (
        <div className="font-[family-name:var(--font-figtree)]" style={{ padding: "40px 20px", textAlign: "center" }}>
          <Activity size={32} weight="duotone" color="var(--accent-indigo)" style={{ marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading alerts...</p>
        </div>
      ) : (
        <>
          {rules.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
                marginBottom: 28,
              }}
            >
              {rules.map((rule) => (
                <AlertRuleCard
                  key={rule.id}
                  icon={conditionIcon(rule.condition.type)}
                  title={rule.name}
                  description={`Type: ${rule.condition.type}${rule.webhookUrl ? " · Webhook configured" : ""}`}
                  threshold={conditionLabel(rule.condition)}
                  enabled={rule.enabled}
                  onToggle={() => toggleRule(rule)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <div
                className="font-[family-name:var(--font-figtree)]"
                style={{ padding: "40px 20px", textAlign: "center" }}
              >
                <BellSimple size={36} weight="duotone" color="var(--accent-indigo)" style={{ marginBottom: 12 }} />
                <p style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                  No alert rules yet
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: 13, maxWidth: 340, margin: "0 auto", lineHeight: 1.6 }}>
                  Create alert rules via the API to monitor latency, costs, error rates, and more.
                </p>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader icon={BellSimple} title="Triggered Alerts" />
            {alerts.length === 0 ? (
              <div
                className="font-[family-name:var(--font-figtree)]"
                style={{ padding: "32px 20px", textAlign: "center" }}
              >
                <ShieldCheck size={36} weight="duotone" color="var(--status-success)" style={{ marginBottom: 12 }} />
                <p style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>All clear</p>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No alerts have been triggered.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background:
                          alert.severity === "critical" ? "var(--status-error)"
                          : alert.severity === "warning" ? "var(--status-warning, #f59e0b)"
                          : "var(--accent-indigo)",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 2 }}>
                        {alert.message}
                      </p>
                      <p className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {alert.acknowledged && (
                      <CheckCircle size={14} weight="bold" color="var(--status-success)" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════ */
function SettingsPage({ walletAddress }: { walletAddress: string }) {
  const [showKey, setShowKey] = useState(false);
  const apiKeyHint = "Set via CANDOR_API_KEY environment variable";

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your Candor instance configuration." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 28 }}>
        {/* Account */}
        <Card>
          <CardHeader icon={ShieldCheck} title="Account" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SettingRow label="Wallet Address">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CopyableText text={walletAddress} truncate />
                <a
                  href={`https://solscan.io/account/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--text-muted)", display: "flex" }}
                >
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </SettingRow>
            <SettingRow label="Plan">
              <span
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "rgba(var(--accent-indigo-rgb), 0.1)",
                  color: "var(--accent-indigo)",
                }}
              >
                Free Tier
              </span>
            </SettingRow>
            <SettingRow label="Events Quota">
              <span className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                0 / 10,000 per month
              </span>
            </SettingRow>
          </div>
        </Card>

        {/* API Key */}
        <Card>
          <CardHeader icon={Key} title="API Key" />
          <p
            className="font-[family-name:var(--font-figtree)]"
            style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}
          >
            Configure the <code style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "var(--bg-deep)", color: "var(--accent-violet)" }}>CANDOR_API_KEY</code> environment variable on your proxy to authenticate connections.
          </p>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: "var(--bg-deep)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span
              className="font-[family-name:var(--font-ibm-plex-mono)]"
              style={{ fontSize: 12, color: "var(--text-muted)" }}
            >
              {apiKeyHint}
            </span>
          </div>
        </Card>
      </div>

      {/* Proxy Config */}
      <Card>
        <CardHeader icon={TerminalWindow} title="Proxy Configuration" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <SettingRow label="Proxy Port">
            <span
              className="font-[family-name:var(--font-ibm-plex-mono)]"
              style={{ fontSize: 13, color: "var(--text-secondary)" }}
            >
              3100
            </span>
          </SettingRow>
          <SettingRow label="Dashboard Port">
            <span
              className="font-[family-name:var(--font-ibm-plex-mono)]"
              style={{ fontSize: 13, color: "var(--text-secondary)" }}
            >
              3200
            </span>
          </SettingRow>
          <SettingRow label="Log Retention">
            <span className="font-[family-name:var(--font-figtree)]" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              7 days
            </span>
          </SettingRow>
          <SettingRow label="Max Events per Session">
            <span
              className="font-[family-name:var(--font-ibm-plex-mono)]"
              style={{ fontSize: 13, color: "var(--text-secondary)" }}
            >
              1,000
            </span>
          </SettingRow>
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   SHARED: Pagination
   ═══════════════════════════════════════════ */
function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div
      className="font-[family-name:var(--font-figtree)]"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "12px 16px",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-deep)",
          color: page <= 1 ? "var(--text-muted)" : "var(--text-primary)",
          fontSize: 12,
          cursor: page <= 1 ? "default" : "pointer",
          opacity: page <= 1 ? 0.5 : 1,
        }}
      >
        Prev
      </button>
      <span style={{ fontSize: 12, color: "var(--text-muted)", padding: "0 8px" }}>
        {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-deep)",
          color: page >= totalPages ? "var(--text-muted)" : "var(--text-primary)",
          fontSize: 12,
          cursor: page >= totalPages ? "default" : "pointer",
          opacity: page >= totalPages ? 0.5 : 1,
        }}
      >
        Next
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHARED: Table scroll wrapper (mobile)
   ═══════════════════════════════════════════ */
function TableScroll({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      {children}
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1
        className="font-[family-name:var(--font-bricolage)]"
        style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}
      >
        {title}
      </h1>
      <p
        className="font-[family-name:var(--font-figtree)]"
        style={{ fontSize: 14, color: "var(--text-secondary)" }}
      >
        {subtitle}
      </p>
    </div>
  );
}

function Card({ children, noPadding = false }: { children: React.ReactNode; noPadding?: boolean }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        padding: noPadding ? 0 : 20,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon: IconComp, title }: { icon: typeof Activity; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <IconComp size={18} weight="duotone" color="var(--accent-indigo)" />
      <h3
        className="font-[family-name:var(--font-bricolage)]"
        style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}
      >
        {title}
      </h3>
    </div>
  );
}

function StatusCard({
  icon: IconComp,
  label,
  value,
  color,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="interactive-card"
      style={{
        padding: "18px 20px",
        borderRadius: 14,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <IconComp size={16} weight="duotone" color={color} />
        <span
          className="font-[family-name:var(--font-figtree)]"
          style={{ fontSize: 12, color: "var(--text-muted)" }}
        >
          {label}
        </span>
      </div>
      <span
        className="font-[family-name:var(--font-ibm-plex-mono)] tabular-nums"
        style={{ fontSize: 22, fontWeight: 700, color }}
      >
        {value}
      </span>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="interactive-card"
      style={{
        padding: 16,
        borderRadius: 12,
        background: "var(--bg-surface)",
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
        className="font-[family-name:var(--font-ibm-plex-mono)] tabular-nums"
        style={{ fontSize: 22, fontWeight: 700, color }}
      >
        {value}
      </span>
    </div>
  );
}

function SetupStep({
  number,
  title,
  done,
  command,
  description,
}: {
  number: string;
  title: string;
  done: boolean;
  command?: string;
  description?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: done ? "rgba(var(--status-success-rgb), 0.1)" : "rgba(var(--accent-indigo-rgb), 0.08)",
          border: `1px solid ${done ? "rgba(var(--status-success-rgb), 0.2)" : "rgba(var(--accent-indigo-rgb), 0.15)"}`,
          flexShrink: 0,
        }}
      >
        {done ? (
          <Check size={12} weight="bold" color="var(--status-success)" />
        ) : (
          <span
            className="font-[family-name:var(--font-ibm-plex-mono)]"
            style={{ fontSize: 10, fontWeight: 600, color: "var(--accent-indigo)" }}
          >
            {number}
          </span>
        )}
      </div>
      <div>
        <p
          className="font-[family-name:var(--font-figtree)]"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: done ? "var(--text-muted)" : "var(--text-primary)",
            textDecoration: done ? "line-through" : "none",
            marginBottom: 4,
          }}
        >
          {title}
        </p>
        {command && (
          <code
            className="font-[family-name:var(--font-ibm-plex-mono)]"
            style={{
              display: "inline-block",
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--bg-deep)",
              border: "1px solid var(--border-subtle)",
              color: "var(--accent-indigo)",
            }}
          >
            {command}
          </code>
        )}
        {description && (
          <p
            className="font-[family-name:var(--font-figtree)]"
            style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function ConfigBlock({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <span
        className="font-[family-name:var(--font-figtree)]"
        style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: multiline ? "flex-start" : "center",
          gap: 8,
          padding: multiline ? "12px 14px" : "8px 14px",
          borderRadius: 10,
          background: "var(--bg-deep)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <code
          className="font-[family-name:var(--font-ibm-plex-mono)]"
          style={{
            flex: 1,
            fontSize: 11,
            color: "var(--text-secondary)",
            whiteSpace: multiline ? "pre" : "nowrap",
            lineHeight: 1.6,
          }}
        >
          {value}
        </code>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`icon-hover-lift${copied ? " copy-flash" : ""}`}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: copied ? "var(--status-success)" : "var(--text-muted)",
        padding: 4,
        transition: "color 0.2s",
        flexShrink: 0,
        borderRadius: 4,
      }}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      data-tooltip="Copy"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function EventRow({
  event: evt,
  expanded,
  onToggle,
}: {
  event: LiveEvent;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="event-enter"
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`${evt.toolName} event at ${evt.timestamp.toLocaleTimeString()}, ${evt.status}`}
      style={{
        padding: "8px 20px",
        borderBottom: "1px solid rgba(var(--accent-indigo-rgb), 0.04)",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onClick={onToggle}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(var(--accent-indigo-rgb), 0.04)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
        {expanded ? <CaretDown size={10} color="var(--text-muted)" /> : <CaretRight size={10} color="var(--text-muted)" />}
        {evt.status === "success" ? (
          <CheckCircle size={14} weight="fill" color="var(--status-success)" />
        ) : (
          <XCircle size={14} weight="fill" color="var(--status-error)" />
        )}
        <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)", minWidth: 72 }}>
          {evt.timestamp.toLocaleTimeString()}
        </span>
        <span
          className="font-[family-name:var(--font-ibm-plex-mono)]"
          style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(var(--accent-indigo-rgb), 0.08)", color: "var(--accent-indigo)" }}
        >
          {evt.method}
        </span>
        <span className="font-[family-name:var(--font-figtree)]" style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 12 }}>
          {evt.toolName}
        </span>
        <span style={{ flex: 1 }} />
        <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: evt.latencyMs > 500 ? "var(--status-warning)" : "var(--text-muted)" }}>
          {evt.latencyMs}ms
        </span>
        <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)", minWidth: 56, textAlign: "right" }}>
          ${evt.costEstimate.toFixed(4)}
        </span>
      </div>
      {expanded && (
        <div
          className="font-[family-name:var(--font-ibm-plex-mono)]"
          style={{
            marginTop: 8,
            marginLeft: 24,
            padding: 12,
            borderRadius: 8,
            background: "rgba(var(--bg-deep-rgb), 0.6)",
            border: "1px solid var(--border-subtle)",
            fontSize: 11,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          <div><span style={{ color: "var(--text-muted)" }}>session: </span><span style={{ color: "var(--accent-cyan)" }}>{evt.sessionId}</span></div>
          {evt.params && <div><span style={{ color: "var(--text-muted)" }}>params: </span><span style={{ color: "var(--accent-violet)" }}>{evt.params}</span></div>}
          {evt.result && <div><span style={{ color: "var(--text-muted)" }}>result: </span><span style={{ color: evt.status === "error" ? "var(--status-error)" : "var(--status-success)" }}>{evt.result}</span></div>}
        </div>
      )}
    </div>
  );
}

function MiniEventRow({ event: evt }: { event: LiveEvent }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid rgba(var(--accent-indigo-rgb), 0.04)",
        fontSize: 12,
      }}
    >
      {evt.status === "success" ? (
        <CheckCircle size={14} weight="fill" color="var(--status-success)" />
      ) : (
        <XCircle size={14} weight="fill" color="var(--status-error)" />
      )}
      <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)" }}>
        {evt.timestamp.toLocaleTimeString()}
      </span>
      <span
        className="font-[family-name:var(--font-ibm-plex-mono)]"
        style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(var(--accent-indigo-rgb), 0.08)", color: "var(--accent-indigo)" }}
      >
        {evt.method}
      </span>
      <span className="font-[family-name:var(--font-figtree)]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
        {evt.toolName}
      </span>
      <span style={{ flex: 1 }} />
      <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)" }}>
        {evt.latencyMs}ms
      </span>
    </div>
  );
}

function AlertRuleCard({
  icon: IconComp,
  title,
  description,
  threshold,
  enabled,
  onToggle,
}: {
  icon: typeof Activity;
  title: string;
  description: string;
  threshold: string;
  enabled: boolean;
  onToggle?: () => void;
}) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <div
      className="interactive-card"
      style={{
        padding: 20,
        borderRadius: 14,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <IconComp size={18} weight="duotone" color="var(--accent-indigo)" />
          <span
            className="font-[family-name:var(--font-bricolage)]"
            style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}
          >
            {title}
          </span>
        </div>
        <button
          onClick={() => { setIsEnabled(!isEnabled); onToggle?.(); }}
          role="switch"
          aria-checked={isEnabled}
          aria-label={`Toggle ${title}`}
          style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: isEnabled ? "var(--accent-indigo)" : "rgba(var(--accent-indigo-rgb), 0.15)",
            position: "relative",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#fff",
              position: "absolute",
              top: 3,
              left: isEnabled ? 19 : 3,
              transition: "left 0.2s",
            }}
          />
        </button>
      </div>
      <p
        className="font-[family-name:var(--font-figtree)]"
        style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10 }}
      >
        {description}
      </p>
      <span
        className="font-[family-name:var(--font-ibm-plex-mono)]"
        style={{
          fontSize: 11,
          padding: "4px 10px",
          borderRadius: 6,
          background: "var(--bg-deep)",
          border: "1px solid var(--border-subtle)",
          color: "var(--accent-violet)",
        }}
      >
        {threshold}
      </span>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span
        className="font-[family-name:var(--font-figtree)]"
        style={{ fontSize: 13, color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function CopyableText({ text, truncate = false }: { text: string; truncate?: boolean }) {
  const display = truncate ? `${text.slice(0, 6)}...${text.slice(-4)}` : text;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        className="font-[family-name:var(--font-ibm-plex-mono)]"
        style={{ fontSize: 12, color: "var(--accent-cyan)" }}
      >
        {display}
      </span>
      <CopyButton text={text} />
    </div>
  );
}
