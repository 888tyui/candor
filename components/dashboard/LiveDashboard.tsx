"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  HouseIcon as House,
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
export default function LiveDashboard({ walletAddress }: { walletAddress: string }) {
  const [activePage, setActivePage] = useState<PageId>("overview");
  const [proxyConnected, setProxyConnected] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [sessions] = useState<LiveSession[]>([]);

  // Simulate checking proxy connection
  useEffect(() => {
    const check = setInterval(() => {
      setProxyConnected(false);
    }, 5000);
    return () => clearInterval(check);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "calc(100dvh - 64px)" }}>
      {/* Sidebar */}
      <aside
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
            onClick={() => setActivePage(item.id)}
            className={`sidebar-item font-[family-name:var(--font-figtree)]${activePage === item.id ? " active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: activePage === item.id ? 500 : 400,
              color: activePage === item.id ? "var(--text-primary)" : "var(--text-secondary)",
              background: activePage === item.id ? "rgba(99,102,241,0.08)" : "transparent",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              if (activePage !== item.id) {
                e.currentTarget.style.background = "rgba(99,102,241,0.04)";
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
            {item.id === "alerts" && (
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 6,
                  background: "rgba(99,102,241,0.1)",
                  color: "var(--accent-indigo)",
                }}
              >
                0
              </span>
            )}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Proxy status */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            background: proxyConnected ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
            border: `1px solid ${proxyConnected ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {proxyConnected ? (
              <WifiHigh size={14} weight="bold" color="#22c55e" />
            ) : (
              <WifiSlash size={14} weight="bold" color="#ef4444" />
            )}
            <span
              className="font-[family-name:var(--font-figtree)]"
              style={{ fontSize: 12, fontWeight: 500, color: proxyConnected ? "#22c55e" : "#ef4444" }}
            >
              {proxyConnected ? "Proxy Connected" : "Proxy Offline"}
            </span>
          </div>
          <span
            className="font-[family-name:var(--font-ibm-plex-mono)]"
            style={{ fontSize: 10, color: "var(--text-muted)" }}
          >
            localhost:3100
          </span>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
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
        {activePage === "alerts" && <AlertsPage />}
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
          color={proxyConnected ? "#22c55e" : "#ef4444"}
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
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
          <table
            className="font-[family-name:var(--font-figtree)]"
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
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
                      textAlign: "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
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
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Cost breakdown will appear here.</p>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ALERTS PAGE
   ═══════════════════════════════════════════ */
function AlertsPage() {
  return (
    <div>
      <PageHeader title="Alert Rules" subtitle="Configure alerts for latency, costs, and errors." />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <AlertRuleCard
          icon={Clock}
          title="Latency Threshold"
          description="Alert when any tool call exceeds a configured latency."
          threshold="> 2000ms"
          enabled={false}
        />
        <AlertRuleCard
          icon={CurrencyDollar}
          title="Cost Budget"
          description="Alert when estimated daily cost exceeds a set budget."
          threshold="$10.00 / day"
          enabled={false}
        />
        <AlertRuleCard
          icon={Warning}
          title="Error Rate"
          description="Alert when error rate exceeds a percentage threshold."
          threshold="> 5%"
          enabled={false}
        />
      </div>

      <Card>
        <CardHeader icon={BellSimple} title="Triggered Alerts" />
        <div
          className="font-[family-name:var(--font-figtree)]"
          style={{ padding: "32px 20px", textAlign: "center" }}
        >
          <ShieldCheck size={36} weight="duotone" color="#22c55e" style={{ marginBottom: 12 }} />
          <p style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            All clear
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No alerts have been triggered.</p>
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════ */
function SettingsPage({ walletAddress }: { walletAddress: string }) {
  const [showKey, setShowKey] = useState(false);
  const apiKey = `ck_${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your Candor instance configuration." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Account */}
        <Card>
          <CardHeader icon={ShieldCheck} title="Account" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SettingRow label="Wallet Address">
              <CopyableText text={walletAddress} truncate />
            </SettingRow>
            <SettingRow label="Plan">
              <span
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "rgba(99,102,241,0.1)",
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
            Use this key to authenticate proxy connections to your dashboard.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--bg-deep)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span
              className="font-[family-name:var(--font-ibm-plex-mono)]"
              style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)" }}
            >
              {showKey ? apiKey : "ck_••••••••••••••••••"}
            </span>
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: 4,
              }}
            >
              {showKey ? <EyeSlash size={14} /> : <Eye size={14} />}
            </button>
            <CopyButton text={apiKey} />
          </div>
        </Card>
      </div>

      {/* Proxy Config */}
      <Card>
        <CardHeader icon={TerminalWindow} title="Proxy Configuration" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
          background: done ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.08)",
          border: `1px solid ${done ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)"}`,
          flexShrink: 0,
        }}
      >
        {done ? (
          <Check size={12} weight="bold" color="#22c55e" />
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
        color: copied ? "#22c55e" : "var(--text-muted)",
        padding: 4,
        transition: "color 0.2s",
        flexShrink: 0,
        borderRadius: 4,
      }}
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
      style={{
        padding: "8px 20px",
        borderBottom: "1px solid rgba(99,102,241,0.04)",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onClick={onToggle}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.04)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
        {expanded ? <CaretDown size={10} color="var(--text-muted)" /> : <CaretRight size={10} color="var(--text-muted)" />}
        {evt.status === "success" ? (
          <CheckCircle size={14} weight="fill" color="#22c55e" />
        ) : (
          <XCircle size={14} weight="fill" color="#ef4444" />
        )}
        <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)", minWidth: 72 }}>
          {evt.timestamp.toLocaleTimeString()}
        </span>
        <span
          className="font-[family-name:var(--font-ibm-plex-mono)]"
          style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(99,102,241,0.08)", color: "var(--accent-indigo)" }}
        >
          {evt.method}
        </span>
        <span className="font-[family-name:var(--font-figtree)]" style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 12 }}>
          {evt.toolName}
        </span>
        <span style={{ flex: 1 }} />
        <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: evt.latencyMs > 500 ? "#f59e0b" : "var(--text-muted)" }}>
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
            background: "rgba(6,7,15,0.6)",
            border: "1px solid var(--border-subtle)",
            fontSize: 11,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          <div><span style={{ color: "var(--text-muted)" }}>session: </span><span style={{ color: "var(--accent-cyan)" }}>{evt.sessionId}</span></div>
          {evt.params && <div><span style={{ color: "var(--text-muted)" }}>params: </span><span style={{ color: "var(--accent-violet)" }}>{evt.params}</span></div>}
          {evt.result && <div><span style={{ color: "var(--text-muted)" }}>result: </span><span style={{ color: evt.status === "error" ? "#ef4444" : "#22c55e" }}>{evt.result}</span></div>}
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
        borderBottom: "1px solid rgba(99,102,241,0.04)",
        fontSize: 12,
      }}
    >
      {evt.status === "success" ? (
        <CheckCircle size={14} weight="fill" color="#22c55e" />
      ) : (
        <XCircle size={14} weight="fill" color="#ef4444" />
      )}
      <span className="font-[family-name:var(--font-ibm-plex-mono)]" style={{ fontSize: 10, color: "var(--text-muted)" }}>
        {evt.timestamp.toLocaleTimeString()}
      </span>
      <span
        className="font-[family-name:var(--font-ibm-plex-mono)]"
        style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(99,102,241,0.08)", color: "var(--accent-indigo)" }}
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
}: {
  icon: typeof Activity;
  title: string;
  description: string;
  threshold: string;
  enabled: boolean;
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
          onClick={() => setIsEnabled(!isEnabled)}
          style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: isEnabled ? "var(--accent-indigo)" : "rgba(99,102,241,0.15)",
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
