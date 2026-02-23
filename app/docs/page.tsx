"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  MagnifyingGlassIcon as MagnifyingGlass,
  ListIcon as List,
  XIcon as X,
  CopyIcon as Copy,
  CheckIcon as Check,
  CaretRightIcon as CaretRight,
  ArrowLeftIcon as ArrowLeft,
  RocketLaunchIcon as RocketLaunch,
  DownloadSimpleIcon as DownloadSimple,
  GearIcon as Gear,
  TreeStructureIcon as TreeStructure,
  TerminalIcon as Terminal,
  PlugsIcon as Plugs,
  ShieldCheckIcon as ShieldCheck,
  ChartLineUpIcon as ChartLineUp,
  BellIcon as Bell,
  CurrencyDollarIcon as CurrencyDollar,
  WrenchIcon as Wrench,
  BookOpenIcon as BookOpen,
  ArrowUpRightIcon as ArrowUpRight,
  GithubLogoIcon as GithubLogo,
  CaretDownIcon as CaretDown,
  LightningIcon as Lightning,
  EyeIcon as Eye,
  DatabaseIcon as Database,
  ClockIcon as Clock,
  CodeIcon as Code,
  BracketsSquareIcon as BracketsSquare,
  ArrowsClockwiseIcon as ArrowsClockwise,
  WarningIcon as Warning,
  InfoIcon as Info,
  CheckCircleIcon as CheckCircle,
} from "@phosphor-icons/react";

/* ═══════════════════════════════════════════════
   Documentation Structure
   ═══════════════════════════════════════════════ */

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; weight?: "bold" | "duotone" | "fill"; color?: string }>;
  subsections?: { id: string; title: string }[];
}

const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: RocketLaunch,
    subsections: [
      { id: "overview", title: "Overview" },
      { id: "quickstart", title: "Quick Start" },
      { id: "requirements", title: "Requirements" },
    ],
  },
  {
    id: "installation",
    title: "Installation",
    icon: DownloadSimple,
    subsections: [
      { id: "npm-install", title: "npm / yarn / pnpm" },
      { id: "verify-install", title: "Verify Installation" },
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    icon: Gear,
    subsections: [
      { id: "config-file", title: "Config File" },
      { id: "mcp-routing", title: "MCP Routing" },
      { id: "environment-vars", title: "Environment Variables" },
    ],
  },
  {
    id: "architecture",
    title: "Architecture",
    icon: TreeStructure,
    subsections: [
      { id: "data-flow", title: "Data Flow" },
      { id: "proxy-layer", title: "Proxy Layer" },
      { id: "event-pipeline", title: "Event Pipeline" },
    ],
  },
  {
    id: "cli-reference",
    title: "CLI Reference",
    icon: Terminal,
    subsections: [
      { id: "candor-start", title: "candor start" },
      { id: "candor-init", title: "candor init" },
      { id: "candor-status", title: "candor status" },
    ],
  },
  {
    id: "mcp-integration",
    title: "MCP Integration",
    icon: Plugs,
    subsections: [
      { id: "stdio-mode", title: "stdio Mode" },
      { id: "sse-mode", title: "SSE Mode" },
      { id: "supported-clients", title: "Supported Clients" },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Eye,
    subsections: [
      { id: "live-timeline", title: "Live Timeline" },
      { id: "sessions", title: "Session Explorer" },
      { id: "wallet-auth", title: "Wallet Authentication" },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: BracketsSquare,
    subsections: [
      { id: "rest-endpoints", title: "REST Endpoints" },
      { id: "websocket", title: "WebSocket API" },
      { id: "event-schema", title: "Event Schema" },
    ],
  },
  {
    id: "cost-tracking",
    title: "Cost Tracking",
    icon: CurrencyDollar,
    subsections: [
      { id: "cost-models", title: "Cost Models" },
      { id: "custom-rates", title: "Custom Rates" },
    ],
  },
  {
    id: "alerts",
    title: "Alerts",
    icon: Bell,
    subsections: [
      { id: "alert-rules", title: "Alert Rules" },
      { id: "webhooks", title: "Webhooks" },
      { id: "conditions", title: "Condition Types" },
    ],
  },
  {
    id: "deployment",
    title: "Deployment",
    icon: ArrowsClockwise,
    subsections: [
      { id: "railway-deploy", title: "Railway" },
      { id: "docker-deploy", title: "Docker" },
      { id: "self-hosted", title: "Self-Hosted" },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: Wrench,
    subsections: [
      { id: "common-issues", title: "Common Issues" },
      { id: "faq", title: "FAQ" },
    ],
  },
];

/* ═══════════════════════════════════════════════
   Main Docs Page
   ═══════════════════════════════════════════════ */

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [activeSubsection, setActiveSubsection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["getting-started"])
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track active section via scroll
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const headings = container.querySelectorAll("[data-section-id]");
      let current = "";
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 140) {
          current = heading.getAttribute("data-section-id") || "";
        }
      });
      if (current) {
        const [sec, sub] = current.split("/");
        if (sec) {
          setActiveSection(sec);
          setExpandedSections((prev) => {
            if (prev.has(sec)) return prev;
            const next = new Set(prev);
            next.add(sec);
            return next;
          });
        }
        if (sub) setActiveSubsection(sub);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateTo = useCallback(
    (sectionId: string, subsectionId?: string) => {
      setActiveSection(sectionId);
      if (subsectionId) setActiveSubsection(subsectionId);
      setSidebarOpen(false);

      setExpandedSections((prev) => {
        const next = new Set(prev);
        next.add(sectionId);
        return next;
      });

      const targetId = subsectionId || sectionId;
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el && contentRef.current) {
          const containerTop = contentRef.current.getBoundingClientRect().top;
          const elTop = el.getBoundingClientRect().top;
          contentRef.current.scrollTo({
            top: contentRef.current.scrollTop + (elTop - containerTop) - 32,
            behavior: "smooth",
          });
        }
      }, 50);
    },
    []
  );

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  // Search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { sectionId: string; subsectionId?: string; title: string; context: string }[] =
      [];
    docSections.forEach((sec) => {
      if (sec.title.toLowerCase().includes(q)) {
        results.push({ sectionId: sec.id, title: sec.title, context: "Section" });
      }
      sec.subsections?.forEach((sub) => {
        if (sub.title.toLowerCase().includes(q)) {
          results.push({
            sectionId: sec.id,
            subsectionId: sub.id,
            title: sub.title,
            context: sec.title,
          });
        }
      });
    });
    // Search through content keywords
    const contentKeywords: Record<string, { sectionId: string; subsectionId?: string; context: string }> = {
      proxy: { sectionId: "architecture", subsectionId: "proxy-layer", context: "Architecture" },
      websocket: { sectionId: "api-reference", subsectionId: "websocket", context: "API Reference" },
      webhook: { sectionId: "alerts", subsectionId: "webhooks", context: "Alerts" },
      "npm install": { sectionId: "installation", subsectionId: "npm-install", context: "Installation" },
      docker: { sectionId: "deployment", subsectionId: "docker-deploy", context: "Deployment" },
      railway: { sectionId: "deployment", subsectionId: "railway-deploy", context: "Deployment" },
      wallet: { sectionId: "dashboard", subsectionId: "wallet-auth", context: "Dashboard" },
      solana: { sectionId: "dashboard", subsectionId: "wallet-auth", context: "Dashboard" },
      phantom: { sectionId: "dashboard", subsectionId: "wallet-auth", context: "Dashboard" },
      stdio: { sectionId: "mcp-integration", subsectionId: "stdio-mode", context: "MCP Integration" },
      sse: { sectionId: "mcp-integration", subsectionId: "sse-mode", context: "MCP Integration" },
      claude: { sectionId: "mcp-integration", subsectionId: "supported-clients", context: "MCP Integration" },
      cursor: { sectionId: "mcp-integration", subsectionId: "supported-clients", context: "MCP Integration" },
      alert: { sectionId: "alerts", subsectionId: "alert-rules", context: "Alerts" },
      cost: { sectionId: "cost-tracking", subsectionId: "cost-models", context: "Cost Tracking" },
      pricing: { sectionId: "cost-tracking", subsectionId: "custom-rates", context: "Cost Tracking" },
      config: { sectionId: "configuration", subsectionId: "config-file", context: "Configuration" },
      environment: { sectionId: "configuration", subsectionId: "environment-vars", context: "Configuration" },
      timeline: { sectionId: "dashboard", subsectionId: "live-timeline", context: "Dashboard" },
      session: { sectionId: "dashboard", subsectionId: "sessions", context: "Dashboard" },
    };
    Object.entries(contentKeywords).forEach(([keyword, meta]) => {
      if (keyword.includes(q) || q.includes(keyword)) {
        const alreadyExists = results.some(
          (r) => r.sectionId === meta.sectionId && r.subsectionId === meta.subsectionId
        );
        if (!alreadyExists) {
          results.push({
            ...meta,
            title: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          });
        }
      }
    });
    return results.slice(0, 8);
  }, [searchQuery]);

  return (
    <div
      style={{ background: "var(--bg-deep)", minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      {/* ─── Top Navigation ─── */}
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
            maxWidth: 1440,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:!hidden flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: sidebarOpen ? "rgba(99,102,241,0.1)" : "transparent",
                border: `1px solid ${sidebarOpen ? "rgba(99,102,241,0.25)" : "var(--border-subtle)"}`,
                color: sidebarOpen ? "var(--accent-indigo)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {sidebarOpen ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
            </button>

            <a
              href="/"
              style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
            >
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
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--accent-indigo)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <BookOpen size={14} weight="duotone" />
              Documentation
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Search button */}
            <button
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(99,102,241,0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--font-figtree)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <MagnifyingGlass size={15} />
              <span className="hidden sm:inline">Search docs...</span>
              <kbd
                className="hidden sm:inline font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.12)",
                  color: "var(--text-muted)",
                }}
              >
                Ctrl K
              </kbd>
            </button>

            <div className="hidden md:flex" style={{ alignItems: "center", gap: 8 }}>
              <a
                href="/"
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 8,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Home
              </a>
              <a
                href="/dashboard"
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 8,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Dashboard
              </a>
              <a
                href="https://github.com/candor-io/candor"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-hover-lift"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  color: "var(--text-secondary)",
                  transition: "all 0.2s",
                }}
              >
                <GithubLogo size={18} weight="bold" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Search Overlay ─── */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 120,
            background: "rgba(6,7,15,0.8)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
        >
          <div
            className="anim-scale-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 560,
              margin: "0 24px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-glow)",
              borderRadius: 16,
              boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <MagnifyingGlass size={18} color="var(--accent-indigo)" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 15,
                }}
              />
              <kbd
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{
                  fontSize: 10,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.12)",
                  color: "var(--text-muted)",
                }}
              >
                ESC
              </kbd>
            </div>

            {searchResults.length > 0 && (
              <div style={{ padding: 8, maxHeight: 360, overflowY: "auto" }}>
                {searchResults.map((result, i) => (
                  <button
                    key={`${result.sectionId}-${result.subsectionId}-${i}`}
                    onClick={() => {
                      navigateTo(result.sectionId, result.subsectionId);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="font-[family-name:var(--font-figtree)]"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      padding: "12px 16px",
                      background: "transparent",
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <CaretRight size={12} color="var(--accent-indigo)" />
                    <span>{result.title}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      {result.context}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  padding: "32px 20px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: 14,
                }}
              >
                No results found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Main Layout ─── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          maxWidth: 1440,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ─── Mobile sidebar overlay ─── */}
        <div
          className="lg:hidden"
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            background: "rgba(6,7,15,0.6)",
            backdropFilter: "blur(4px)",
            opacity: sidebarOpen ? 1 : 0,
            pointerEvents: sidebarOpen ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ─── Sidebar ─── */}
        <aside
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 docs-sidebar`}
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            bottom: 0,
            width: 280,
            zIndex: 45,
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border-subtle)",
            overflowY: "auto",
            transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            padding: "24px 0",
          }}
        >
          {/* Version badge */}
          <div style={{ padding: "0 20px", marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(99,102,241,0.04)",
                border: "1px solid rgba(99,102,241,0.08)",
              }}
            >
              <Lightning size={14} weight="fill" color="var(--accent-indigo)" />
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ fontSize: 11, color: "var(--text-secondary)" }}
              >
                v1.0.0
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "rgba(34,197,94,0.1)",
                  color: "#22c55e",
                  fontFamily: "var(--font-figtree)",
                }}
              >
                Latest
              </span>
            </div>
          </div>

          {/* Nav sections */}
          <nav>
            {docSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const isExpanded = expandedSections.has(section.id);

              return (
                <div key={section.id} style={{ marginBottom: 2 }}>
                  <button
                    onClick={() => {
                      if (isActive) {
                        toggleSection(section.id);
                      } else {
                        setExpandedSections((prev) => {
                          const next = new Set(prev);
                          next.add(section.id);
                          return next;
                        });
                        navigateTo(section.id, section.subsections?.[0]?.id);
                      }
                    }}
                    className="font-[family-name:var(--font-figtree)] docs-nav-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 20px",
                      background: isActive ? "rgba(99,102,241,0.06)" : "transparent",
                      border: "none",
                      borderLeft: isActive
                        ? "2px solid var(--accent-indigo)"
                        : "2px solid transparent",
                      cursor: "pointer",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <Icon
                      size={16}
                      weight={isActive ? "duotone" : "bold"}
                      color={isActive ? "var(--accent-indigo)" : undefined}
                    />
                    <span style={{ flex: 1 }}>{section.title}</span>
                    {section.subsections && (
                      <CaretDown
                        size={12}
                        style={{
                          transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                          transition: "transform 0.2s",
                          opacity: 0.5,
                        }}
                      />
                    )}
                  </button>

                  {/* Subsections */}
                  {isExpanded && section.subsections && (
                    <div
                      style={{
                        overflow: "hidden",
                        animation: "docs-expand 0.2s ease-out",
                      }}
                    >
                      {section.subsections.map((sub) => {
                        const isSubActive =
                          activeSection === section.id && activeSubsection === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => navigateTo(section.id, sub.id)}
                            className="font-[family-name:var(--font-figtree)] docs-nav-item"
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 20px 8px 50px",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: isSubActive ? "var(--accent-indigo)" : "var(--text-muted)",
                              fontSize: 12.5,
                              fontWeight: isSubActive ? 500 : 400,
                              textAlign: "left",
                              transition: "all 0.15s",
                              position: "relative",
                            }}
                          >
                            {isSubActive && (
                              <span
                                style={{
                                  position: "absolute",
                                  left: 38,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  width: 4,
                                  height: 4,
                                  borderRadius: "50%",
                                  background: "var(--accent-indigo)",
                                }}
                              />
                            )}
                            {sub.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div
            style={{
              padding: "24px 20px",
              marginTop: 16,
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <a
              href="https://github.com/candor-io/candor"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-figtree)]"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <GithubLogo size={14} weight="bold" />
              Edit on GitHub
              <ArrowUpRight size={10} style={{ marginLeft: "auto" }} />
            </a>
          </div>
        </aside>

        {/* ─── Content Area ─── */}
        <main
          ref={contentRef}
          className="page-enter lg:ml-[280px]"
          style={{
            flex: 1,
            overflowY: "auto",
            height: "calc(100dvh - 64px)",
            padding: "40px 24px 120px",
          }}
        >
          <div
            style={{
              maxWidth: 820,
              margin: "0 auto",
            }}
          >
            <DocsContent navigateTo={navigateTo} />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Code Block Component
   ═══════════════════════════════════════════════ */

function CodeBlock({
  code,
  language = "bash",
  filename,
  showLineNumbers = false,
}: {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div
      className="docs-code-block"
      style={{
        borderRadius: 12,
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-card)",
        overflow: "hidden",
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(99,102,241,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Dots */}
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,95,87,0.6)" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,189,46,0.6)" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(39,201,63,0.6)" }} />
          </div>
          {filename && (
            <span
              className="font-[family-name:var(--font-ibm-plex-mono)]"
              style={{ fontSize: 11, color: "var(--text-muted)" }}
            >
              {filename}
            </span>
          )}
          {!filename && language && (
            <span
              className="font-[family-name:var(--font-ibm-plex-mono)]"
              style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={`icon-hover-lift ${copied ? "copy-flash" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 6,
            background: "transparent",
            border: "1px solid var(--border-subtle)",
            color: copied ? "#22c55e" : "var(--text-muted)",
            cursor: "pointer",
            fontSize: 11,
            fontFamily: "var(--font-figtree)",
            transition: "all 0.2s",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Code content */}
      <div style={{ overflowX: "auto", padding: "16px 0" }}>
        <pre
          className="font-[family-name:var(--font-ibm-plex-mono)]"
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.7,
            color: "var(--text-secondary)",
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                padding: "0 16px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {showLineNumbers && (
                <span
                  style={{
                    userSelect: "none",
                    width: 40,
                    flexShrink: 0,
                    color: "var(--text-muted)",
                    fontSize: 11,
                    opacity: 0.6,
                    textAlign: "right",
                    paddingRight: 16,
                  }}
                >
                  {i + 1}
                </span>
              )}
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightSyntax(line, language),
                }}
              />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Syntax Highlighting (lightweight)
   ═══════════════════════════════════════════════ */

function highlightSyntax(line: string, language: string): string {
  // Escape HTML entities
  const escaped = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Use unique placeholder tokens to avoid regex conflicts
  const tokens: string[] = [];
  let result = escaped;

  const addToken = (html: string) => {
    const idx = tokens.length;
    tokens.push(html);
    return `\u00AB${idx}\u00BB`; // «0» «1» etc.
  };

  // 1. Comments first — whole line gets colored, no further processing
  if (language === "bash" || language === "yaml" || language === "dockerfile") {
    result = result.replace(/^(\s*#.*)$/, (m) => addToken(`<span style="color:#4a4e69;font-style:italic">${m}</span>`));
  }
  // JS-style single-line comment (but NOT inside URLs like http://)
  result = result.replace(/(?<![:])(\/\/.*)$/, (m) => addToken(`<span style="color:#4a4e69;font-style:italic">${m}</span>`));

  // 2. Strings
  result = result.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, (m) => addToken(`<span style="color:#a5d6ff">${m}</span>`));

  // 3. Special tokens
  result = result.replace(/\b(true|false|null|undefined)\b/g, (m) => addToken(`<span style="color:#67e8f9">${m}</span>`));

  // 4. Keywords
  const keywords = "const|let|var|function|return|import|from|export|default|if|else|async|await|new|class|interface|type|extends|implements|npm|npx|yarn|pnpm|candor|GET|POST|PUT|DELETE|WS|FROM|WORKDIR|COPY|RUN|EXPOSE|CMD|AS";
  result = result.replace(new RegExp(`\\b(${keywords})\\b`, "g"), (m) => addToken(`<span style="color:#c084fc">${m}</span>`));

  // 5. Numbers (only standalone, not inside placeholders)
  result = result.replace(/(?<!\u00AB)\b(\d+\.?\d*)\b(?!\u00BB)/g, (m) => addToken(`<span style="color:#f9a8d4">${m}</span>`));

  // Restore tokens
  for (let i = 0; i < tokens.length; i++) {
    result = result.replace(`\u00AB${i}\u00BB`, tokens[i]);
  }

  return result;
}

/* ═══════════════════════════════════════════════
   Callout Component
   ═══════════════════════════════════════════════ */

function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "success" | "tip";
  title?: string;
  children: React.ReactNode;
}) {
  const configs = {
    info: { icon: Info, color: "var(--accent-blue)", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.15)" },
    warning: { icon: Warning, color: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)" },
    success: { icon: CheckCircle, color: "#22c55e", bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.15)" },
    tip: { icon: Lightning, color: "var(--accent-violet)", bg: "rgba(139,92,246,0.06)", border: "rgba(139,92,246,0.15)" },
  };
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      style={{
        padding: "16px 20px",
        borderRadius: 12,
        background: config.bg,
        border: `1px solid ${config.border}`,
        marginBottom: 24,
        display: "flex",
        gap: 14,
      }}
    >
      <Icon size={18} weight="duotone" color={config.color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        {title && (
          <div
            className="font-[family-name:var(--font-figtree)]"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: config.color,
              marginBottom: 6,
            }}
          >
            {title}
          </div>
        )}
        <div
          className="font-[family-name:var(--font-figtree)]"
          style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   API Endpoint Component
   ═══════════════════════════════════════════════ */

function ApiEndpoint({
  method,
  path,
  description,
  params,
}: {
  method: "GET" | "POST" | "PUT" | "DELETE" | "WS";
  path: string;
  description: string;
  params?: { name: string; type: string; description: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const methodColors: Record<string, string> = {
    GET: "#22c55e",
    POST: "#3b82f6",
    PUT: "#f59e0b",
    DELETE: "#ef4444",
    WS: "#8b5cf6",
  };

  return (
    <div
      className="interactive-card"
      style={{
        borderRadius: 12,
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-card)",
        marginBottom: 12,
        overflow: "hidden",
        cursor: params ? "pointer" : "default",
      }}
      onClick={() => params && setExpanded(!expanded)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
        }}
      >
        <span
          className="font-[family-name:var(--font-ibm-plex-mono)]"
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 6,
            background: `${methodColors[method]}15`,
            color: methodColors[method],
            letterSpacing: "0.03em",
          }}
        >
          {method}
        </span>
        <code
          className="font-[family-name:var(--font-ibm-plex-mono)]"
          style={{ fontSize: 13, color: "var(--text-primary)", flex: 1 }}
        >
          {path}
        </code>
        <span
          className="font-[family-name:var(--font-figtree)] hidden sm:inline"
          style={{ fontSize: 12, color: "var(--text-muted)" }}
        >
          {description}
        </span>
        {params && (
          <CaretDown
            size={12}
            color="var(--text-muted)"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          />
        )}
      </div>

      {expanded && params && (
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "14px 18px",
            background: "rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="font-[family-name:var(--font-figtree)]"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            Parameters
          </div>
          {params.map((param) => (
            <div
              key={param.name}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                padding: "6px 0",
              }}
            >
              <code
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ fontSize: 12, color: "var(--accent-cyan)" }}
              >
                {param.name}
              </code>
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ fontSize: 10, color: "var(--text-muted)" }}
              >
                {param.type}
              </span>
              <span
                className="font-[family-name:var(--font-figtree)]"
                style={{ fontSize: 12, color: "var(--text-secondary)" }}
              >
                {param.description}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Architecture Diagram (ASCII → styled)
   ═══════════════════════════════════════════════ */

function ArchitectureDiagram() {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid var(--border-subtle)",
        background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.02) 100%)",
        padding: 32,
        marginBottom: 32,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.6,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Title */}
        <div
          className="font-[family-name:var(--font-figtree)]"
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--text-muted)",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <TreeStructure size={14} weight="duotone" color="var(--accent-indigo)" />
          System Architecture
        </div>

        {/* Flow diagram */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
          }}
        >
          {/* Row 1: Agent */}
          <DiagramBox
            label="AI Agent"
            sublabel="Claude, Cursor, Windsurf, etc."
            color="var(--accent-cyan)"
            icon={<Lightning size={16} weight="duotone" />}
          />
          <FlowArrow label="MCP JSON-RPC (stdio/SSE)" />

          {/* Row 2: Proxy */}
          <DiagramBox
            label="Candor Proxy"
            sublabel="localhost:3100"
            color="var(--accent-indigo)"
            icon={<ShieldCheck size={16} weight="duotone" />}
            highlight
          />

          {/* Fork arrows */}
          <div
            style={{
              display: "flex",
              gap: 24,
              alignItems: "flex-start",
              justifyContent: "center",
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: 1, minWidth: 160 }}>
              <FlowArrow label="Forward" small />
              <DiagramBox
                label="MCP Server(s)"
                sublabel="Tool execution"
                color="var(--accent-blue)"
                icon={<Plugs size={14} weight="duotone" />}
                small
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: 1, minWidth: 160 }}>
              <FlowArrow label="Log" small />
              <DiagramBox
                label="PostgreSQL"
                sublabel="Event storage"
                color="#22c55e"
                icon={<Database size={14} weight="duotone" />}
                small
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: 1, minWidth: 160 }}>
              <FlowArrow label="Stream" small />
              <DiagramBox
                label="WebSocket"
                sublabel=":3101"
                color="var(--accent-violet)"
                icon={<ArrowsClockwise size={14} weight="duotone" />}
                small
              />
            </div>
          </div>

          {/* Final row */}
          <FlowArrow label="Real-time feed" />
          <DiagramBox
            label="Dashboard"
            sublabel="Timeline / Sessions / Costs / Alerts"
            color="var(--accent-violet)"
            icon={<Eye size={16} weight="duotone" />}
          />
        </div>
      </div>
    </div>
  );
}

function DiagramBox({
  label,
  sublabel,
  color,
  icon,
  highlight,
  small,
}: {
  label: string;
  sublabel: string;
  color: string;
  icon: React.ReactNode;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: small ? 10 : 14,
        padding: small ? "12px 18px" : "16px 24px",
        borderRadius: 12,
        background: highlight ? `${color}10` : "var(--bg-surface)",
        border: `1px solid ${color}${highlight ? "30" : "20"}`,
        boxShadow: highlight ? `0 0 24px ${color}15` : "none",
        minWidth: small ? 160 : 240,
        width: small ? "100%" : "auto",
        maxWidth: small ? 240 : 320,
      }}
    >
      <div
        style={{
          width: small ? 28 : 36,
          height: small ? 28 : 36,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}12`,
          color: color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          className="font-[family-name:var(--font-figtree)]"
          style={{
            fontSize: small ? 12 : 14,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {label}
        </div>
        <div
          className="font-[family-name:var(--font-ibm-plex-mono)]"
          style={{
            fontSize: small ? 10 : 11,
            color: "var(--text-muted)",
          }}
        >
          {sublabel}
        </div>
      </div>
    </div>
  );
}

function FlowArrow({ label, small }: { label: string; small?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div
        style={{
          width: 1,
          height: small ? 16 : 24,
          background: "linear-gradient(to bottom, var(--accent-indigo), transparent)",
        }}
      />
      <span
        className="font-[family-name:var(--font-ibm-plex-mono)]"
        style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.05em" }}
      >
        {label}
      </span>
      <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid var(--accent-indigo)", opacity: 0.5 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Section Header Component
   ═══════════════════════════════════════════════ */

function SectionHeader({
  id,
  parentId,
  icon: Icon,
  title,
  description,
  isMainSection,
}: {
  id: string;
  parentId?: string;
  icon?: React.ComponentType<{ size?: number; weight?: "bold" | "duotone" }>;
  title: string;
  description?: string;
  isMainSection?: boolean;
}) {
  return (
    <div
      id={id}
      data-section-id={parentId ? `${parentId}/${id}` : id}
      style={{
        marginBottom: isMainSection ? 32 : 24,
        paddingTop: 32,
      }}
    >
      {isMainSection && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          {Icon && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.12)",
              }}
            >
              <Icon size={18} weight="duotone" />
            </div>
          )}
          <div className="hero-line" style={{ flex: 1, opacity: 0.5 }} />
        </div>
      )}
      <h2
        className="font-[family-name:var(--font-bricolage)]"
        style={{
          fontSize: isMainSection ? 28 : 20,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          marginBottom: description ? 8 : 0,
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          className="font-[family-name:var(--font-figtree)]"
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: "var(--text-secondary)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Inline Code
   ═══════════════════════════════════════════════ */

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="font-[family-name:var(--font-ibm-plex-mono)]"
      style={{
        fontSize: "0.9em",
        padding: "2px 8px",
        borderRadius: 6,
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(99,102,241,0.1)",
        color: "var(--accent-cyan)",
      }}
    >
      {children}
    </code>
  );
}

/* ═══════════════════════════════════════════════
   Paragraph
   ═══════════════════════════════════════════════ */

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-[family-name:var(--font-figtree)]"
      style={{
        fontSize: 14.5,
        lineHeight: 1.8,
        color: "var(--text-secondary)",
        marginBottom: 20,
      }}
    >
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════
   Step List Component
   ═══════════════════════════════════════════════ */

function StepList({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 20,
            position: "relative",
          }}
        >
          {/* Line connector */}
          {i < steps.length - 1 && (
            <div
              style={{
                position: "absolute",
                left: 15,
                top: 32,
                bottom: -20,
                width: 1,
                background: "var(--border-subtle)",
              }}
            />
          )}
          <div
            className="font-[family-name:var(--font-ibm-plex-mono)]"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.15)",
              color: "var(--accent-indigo)",
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
          <div style={{ paddingTop: 2 }}>
            <div
              className="font-[family-name:var(--font-figtree)]"
              style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}
            >
              {step.title}
            </div>
            <div
              className="font-[family-name:var(--font-figtree)]"
              style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}
            >
              {step.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Feature Grid Component
   ═══════════════════════════════════════════════ */

function FeatureGrid({ features }: { features: { icon: React.ReactNode; title: string; description: string }[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 28,
      }}
    >
      {features.map((feature, i) => (
        <div
          key={i}
          className="interactive-card"
          style={{
            padding: "20px",
            borderRadius: 12,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-card)",
          }}
        >
          <div style={{ marginBottom: 12 }}>{feature.icon}</div>
          <div
            className="font-[family-name:var(--font-figtree)]"
            style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}
          >
            {feature.title}
          </div>
          <div
            className="font-[family-name:var(--font-figtree)]"
            style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}
          >
            {feature.description}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Table Component
   ═══════════════════════════════════════════════ */

function DocsTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid var(--border-subtle)",
        overflow: "hidden",
        marginBottom: 24,
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}
        >
          <thead>
            <tr style={{ background: "rgba(99,102,241,0.04)" }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="font-[family-name:var(--font-figtree)]"
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    borderBottom: "1px solid var(--border-subtle)",
                    whiteSpace: "nowrap",
                    fontSize: 12,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={
                      j === 0
                        ? "font-[family-name:var(--font-ibm-plex-mono)]"
                        : "font-[family-name:var(--font-figtree)]"
                    }
                    style={{
                      padding: "10px 16px",
                      color: j === 0 ? "var(--accent-cyan)" : "var(--text-secondary)",
                      fontSize: j === 0 ? 12 : 13,
                      whiteSpace: j === 0 ? "nowrap" : undefined,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   THE DOCUMENTATION CONTENT
   ═══════════════════════════════════════════════ */

function DocsContent({ navigateTo }: { navigateTo: (s: string, sub?: string) => void }) {
  return (
    <div>
      {/* ━━━━━━━━━━━━ GETTING STARTED ━━━━━━━━━━━━ */}
      <SectionHeader
        id="getting-started"
        icon={RocketLaunch}
        title="Getting Started"
        description="Everything you need to start observing your AI agents in real time."
        isMainSection
      />

      <SectionHeader
        id="overview"
        parentId="getting-started"
        title="Overview"
      />
      <P>
        Candor is a real-time observability platform for AI agents.
        It works as a transparent proxy that sits between your AI agent and MCP servers,
        intercepting, logging, and visualizing every tool call, resource read, and response.
      </P>
      <P>
        Think of it as <strong style={{ color: "var(--text-primary)" }}>Sentry for AI agents</strong> — you see
        exactly what your agents are doing, how much they cost, and when things go wrong.
      </P>

      <FeatureGrid
        features={[
          {
            icon: <Eye size={20} weight="duotone" color="var(--accent-cyan)" />,
            title: "Full Visibility",
            description: "Every MCP tool call, resource read, and prompt completion logged and visualized.",
          },
          {
            icon: <Clock size={20} weight="duotone" color="var(--accent-indigo)" />,
            title: "Real-Time",
            description: "Live event streaming via WebSocket. See agent actions as they happen.",
          },
          {
            icon: <CurrencyDollar size={20} weight="duotone" color="var(--accent-violet)" />,
            title: "Cost Tracking",
            description: "Estimate token costs per session, per tool, per agent. No surprises.",
          },
          {
            icon: <Bell size={20} weight="duotone" color="#f59e0b" />,
            title: "Smart Alerts",
            description: "Set rules for error rates, cost spikes, latency thresholds. Get notified via webhook.",
          },
        ]}
      />

      <SectionHeader
        id="quickstart"
        parentId="getting-started"
        title="Quick Start"
      />
      <P>Get up and running in under 60 seconds:</P>

      <StepList
        steps={[
          { title: "Install the Candor proxy globally", description: "Use npm, yarn, or pnpm to install the CLI." },
          { title: "Configure your MCP client", description: "Point your agent's MCP traffic through Candor's proxy port." },
          { title: "Start the proxy", description: "Launch the proxy and dashboard together." },
          { title: "Open the dashboard", description: "Watch events stream in real time." },
        ]}
      />

      <CodeBlock
        code={`# Install globally
npm install -g @candor/proxy

# Initialize configuration
candor init

# Start proxy + dashboard
candor start

# Open dashboard at http://localhost:3200`}
        language="bash"
      />

      <SectionHeader
        id="requirements"
        parentId="getting-started"
        title="Requirements"
      />
      <DocsTable
        headers={["Requirement", "Version", "Notes"]}
        rows={[
          ["Node.js", ">=18.0.0", "LTS recommended"],
          ["npm / yarn / pnpm", "Any recent", "For package installation"],
          ["PostgreSQL", ">=14", "Event storage (optional for dev)"],
          ["MCP Client", "Any", "Claude Desktop, Cursor, Windsurf, etc."],
        ]}
      />

      <Callout type="tip" title="Development Mode">
        PostgreSQL is only required for production. In dev mode, Candor uses an in-memory store for events
        so you can try it without any database setup.
      </Callout>

      {/* ━━━━━━━━━━━━ INSTALLATION ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="installation"
        icon={DownloadSimple}
        title="Installation"
        description="Install the Candor proxy CLI on your system."
        isMainSection
      />

      <SectionHeader
        id="npm-install"
        parentId="installation"
        title="npm / yarn / pnpm"
      />

      <CodeBlock
        code={`# npm
npm install -g @candor/proxy

# yarn
yarn global add @candor/proxy

# pnpm
pnpm add -g @candor/proxy`}
        language="bash"
      />

      <SectionHeader
        id="verify-install"
        parentId="installation"
        title="Verify Installation"
      />
      <P>After installing, verify the CLI is available:</P>

      <CodeBlock
        code={`candor --version
# @candor/proxy v1.0.0

candor --help
# Usage: candor <command> [options]
#
# Commands:
#   start     Start the proxy and dashboard
#   init      Initialize a new config file
#   status    Show proxy status and connections`}
        language="bash"
      />

      {/* ━━━━━━━━━━━━ CONFIGURATION ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="configuration"
        icon={Gear}
        title="Configuration"
        description="Set up your proxy, routes, and environment for development or production."
        isMainSection
      />

      <SectionHeader
        id="config-file"
        parentId="configuration"
        title="Config File"
      />
      <P>
        Run <InlineCode>candor init</InlineCode> to generate a <InlineCode>candor.config.json</InlineCode> file in your project root.
        This file controls how the proxy routes MCP traffic.
      </P>

      <CodeBlock
        code={`{
  "proxy": {
    "port": 3100,
    "dashboard": 3200,
    "websocket": 3101
  },
  "upstreams": [
    {
      "name": "filesystem",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    },
    {
      "name": "github",
      "transport": "sse",
      "url": "https://mcp.github.com/sse"
    }
  ],
  "storage": {
    "driver": "postgres",
    "url": "postgresql://user:pass@localhost:5432/candor"
  },
  "retention": {
    "days": 7,
    "maxEventsPerSession": 1000
  }
}`}
        language="json"
        filename="candor.config.json"
        showLineNumbers
      />

      <SectionHeader
        id="mcp-routing"
        parentId="configuration"
        title="MCP Routing"
      />
      <P>
        Candor acts as a transparent proxy. You change one line in your MCP client config to
        route traffic through Candor instead of directly to the MCP server.
      </P>

      <Callout type="info" title="Before and After">
        Your MCP client connects to <InlineCode>localhost:3100</InlineCode> instead of the upstream server.
        Candor handles forwarding, logging, and streaming the data to the dashboard.
      </Callout>

      <CodeBlock
        code={`// Claude Desktop: ~/.claude/claude_desktop_config.json
// Before (direct connection):
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}

// After (through Candor proxy):
{
  "mcpServers": {
    "candor-proxy": {
      "command": "candor",
      "args": ["start", "--attach"]
    }
  }
}`}
        language="json"
        filename="claude_desktop_config.json"
        showLineNumbers
      />

      <SectionHeader
        id="environment-vars"
        parentId="configuration"
        title="Environment Variables"
      />

      <DocsTable
        headers={["Variable", "Default", "Description"]}
        rows={[
          ["DATABASE_URL", "—", "PostgreSQL connection string"],
          ["PROXY_PORT", "3100", "Port for MCP proxy listener"],
          ["DASHBOARD_PORT", "3200", "Port for web dashboard"],
          ["WEBSOCKET_PORT", "3101", "Port for live event streaming"],
          ["NEXT_PUBLIC_SOLANA_NETWORK", "mainnet-beta", "Solana cluster for wallet auth"],
          ["NEXT_PUBLIC_SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com", "Solana RPC endpoint"],
          ["WEBHOOK_SECRET", "—", "Secret for verifying webhook deliveries"],
          ["LOG_RETENTION_DAYS", "7", "Days to keep event history"],
          ["MAX_EVENTS_PER_SESSION", "1000", "Max events stored per session"],
        ]}
      />

      {/* ━━━━━━━━━━━━ ARCHITECTURE ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="architecture"
        icon={TreeStructure}
        title="Architecture"
        description="How Candor intercepts, stores, and visualizes MCP traffic."
        isMainSection
      />

      <SectionHeader
        id="data-flow"
        parentId="architecture"
        title="Data Flow"
      />
      <P>
        Candor sits between your AI agent and its MCP servers as a transparent proxy layer.
        Every request and response passes through, gets logged, and is streamed to the dashboard in real time.
      </P>

      <ArchitectureDiagram />

      <SectionHeader
        id="proxy-layer"
        parentId="architecture"
        title="Proxy Layer"
      />
      <P>
        The proxy layer intercepts MCP JSON-RPC messages over both <InlineCode>stdio</InlineCode> and{" "}
        <InlineCode>SSE</InlineCode> transports. It is completely transparent — your agents work exactly as before.
      </P>

      <FeatureGrid
        features={[
          {
            icon: <ShieldCheck size={18} weight="duotone" color="var(--accent-indigo)" />,
            title: "Zero Code Changes",
            description: "No SDK, no imports. Just a config change to route through the proxy.",
          },
          {
            icon: <ArrowsClockwise size={18} weight="duotone" color="var(--accent-cyan)" />,
            title: "Bidirectional",
            description: "Captures both requests (agent → server) and responses (server → agent).",
          },
          {
            icon: <Clock size={18} weight="duotone" color="var(--accent-violet)" />,
            title: "Low Latency",
            description: "Sub-millisecond overhead. Async logging ensures zero impact on agent performance.",
          },
        ]}
      />

      <SectionHeader
        id="event-pipeline"
        parentId="architecture"
        title="Event Pipeline"
      />
      <P>Each intercepted MCP message goes through the following pipeline:</P>

      <StepList
        steps={[
          { title: "Intercept", description: "Proxy captures the raw JSON-RPC request/response pair." },
          { title: "Enrich", description: "Adds metadata: timestamp, session ID, latency, estimated token count." },
          { title: "Store", description: "Writes to PostgreSQL via Prisma for persistent storage and querying." },
          { title: "Stream", description: "Broadcasts to connected WebSocket clients for real-time dashboard updates." },
          { title: "Evaluate", description: "Checks against alert rules. Triggers webhooks if conditions match." },
        ]}
      />

      {/* ━━━━━━━━━━━━ CLI REFERENCE ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="cli-reference"
        icon={Terminal}
        title="CLI Reference"
        description="Complete reference for the Candor proxy CLI commands."
        isMainSection
      />

      <SectionHeader
        id="candor-start"
        parentId="cli-reference"
        title="candor start"
      />
      <P>Start the proxy server and dashboard. This is the primary command for daily use.</P>

      <CodeBlock
        code={`candor start [options]

Options:
  --port <number>       Proxy port (default: 3100)
  --dashboard <number>  Dashboard port (default: 3200)
  --config <path>       Path to config file (default: ./candor.config.json)
  --no-dashboard        Start proxy only, skip dashboard
  --attach              Run in attached mode (for MCP client integration)
  --verbose             Enable verbose logging

Examples:
  candor start
  candor start --port 4100 --dashboard 4200
  candor start --no-dashboard
  candor start --config ./custom-config.json`}
        language="bash"
      />

      <SectionHeader
        id="candor-init"
        parentId="cli-reference"
        title="candor init"
      />
      <P>Generate a new configuration file with an interactive wizard.</P>

      <CodeBlock
        code={`candor init [options]

Options:
  --dir <path>     Output directory (default: current directory)
  --template <id>  Use a starter template (basic, advanced)

# Interactive wizard flow:
# 1. Select MCP servers to monitor
# 2. Configure transport type (stdio/SSE)
# 3. Set storage backend (memory/postgres)
# 4. Choose dashboard port
# → Generates candor.config.json`}
        language="bash"
      />

      <SectionHeader
        id="candor-status"
        parentId="cli-reference"
        title="candor status"
      />
      <P>Show the current status of the proxy, connected agents, and active sessions.</P>

      <CodeBlock
        code={`candor status

# Output:
# Candor Proxy v1.0.0
# ─────────────────────────────
# Status:     Running
# Proxy:      localhost:3100
# Dashboard:  localhost:3200
# WebSocket:  localhost:3101
#
# Active Sessions: 2
# Total Events:    1,847
# Uptime:          4h 23m
#
# Connected Upstreams:
#   ✓ filesystem (stdio)
#   ✓ github (SSE)
#   ✗ slack (disconnected)`}
        language="bash"
      />

      {/* ━━━━━━━━━━━━ MCP INTEGRATION ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="mcp-integration"
        icon={Plugs}
        title="MCP Integration"
        description="How to connect different AI agents and MCP clients through Candor."
        isMainSection
      />

      <SectionHeader
        id="stdio-mode"
        parentId="mcp-integration"
        title="stdio Mode"
      />
      <P>
        stdio is the default transport for local MCP servers. The proxy spawns the MCP server
        as a child process and intercepts all stdin/stdout communication.
      </P>

      <CodeBlock
        code={`// candor.config.json
{
  "upstreams": [
    {
      "name": "filesystem",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
    },
    {
      "name": "sqlite",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "db.sqlite"]
    }
  ]
}`}
        language="json"
        filename="candor.config.json"
        showLineNumbers
      />

      <SectionHeader
        id="sse-mode"
        parentId="mcp-integration"
        title="SSE Mode"
      />
      <P>
        SSE (Server-Sent Events) transport is used for remote MCP servers. The proxy connects
        to the remote server and relays events to your local agent.
      </P>

      <CodeBlock
        code={`// candor.config.json
{
  "upstreams": [
    {
      "name": "github",
      "transport": "sse",
      "url": "https://mcp.github.com/sse",
      "headers": {
        "Authorization": "Bearer ghp_xxxxxxxxxxxx"
      }
    }
  ]
}`}
        language="json"
        filename="candor.config.json"
        showLineNumbers
      />

      <SectionHeader
        id="supported-clients"
        parentId="mcp-integration"
        title="Supported Clients"
      />
      <P>Candor works with any MCP-compatible AI agent. Here are setup guides for popular clients:</P>

      <DocsTable
        headers={["Client", "Transport", "Config Location"]}
        rows={[
          ["Claude Desktop", "stdio", "~/.claude/claude_desktop_config.json"],
          ["Claude Code (CLI)", "stdio", "~/.claude/claude_code_config.json"],
          ["Cursor", "stdio", ".cursor/mcp.json"],
          ["Windsurf", "stdio", "~/.codeium/windsurf/mcp_config.json"],
          ["VS Code (Copilot)", "stdio", ".vscode/mcp.json"],
          ["Custom Agent", "stdio / SSE", "See API Reference"],
        ]}
      />

      <Callout type="info">
        All MCP clients that support the standard stdio transport work with Candor out of the box.
        No client-specific code is needed.
      </Callout>

      {/* ━━━━━━━━━━━━ DASHBOARD ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="dashboard"
        icon={Eye}
        title="Dashboard"
        description="The visual interface for monitoring your AI agents."
        isMainSection
      />

      <SectionHeader
        id="live-timeline"
        parentId="dashboard"
        title="Live Timeline"
      />
      <P>
        The Timeline view shows every MCP event as it happens. Events stream in real time
        via WebSocket and display the tool name, method, parameters, latency, and cost estimate.
      </P>

      <FeatureGrid
        features={[
          {
            icon: <Lightning size={18} weight="duotone" color="var(--accent-cyan)" />,
            title: "Real-Time Streaming",
            description: "Events appear instantly as your agent executes tool calls.",
          },
          {
            icon: <MagnifyingGlass size={18} weight="duotone" color="var(--accent-indigo)" />,
            title: "Powerful Filters",
            description: "Filter by tool name, method, status, latency range, or time window.",
          },
          {
            icon: <Code size={18} weight="duotone" color="var(--accent-violet)" />,
            title: "Expandable Detail",
            description: "Click any event to see full request params and response payload.",
          },
        ]}
      />

      <SectionHeader
        id="sessions"
        parentId="dashboard"
        title="Session Explorer"
      />
      <P>
        Sessions group related MCP events together. Each time an agent starts a new conversation
        or task, Candor creates a session to track all associated tool calls.
      </P>

      <DocsTable
        headers={["Field", "Description"]}
        rows={[
          ["Agent ID", "Identifier for the AI agent that created the session"],
          ["Duration", "Time from first to last event in the session"],
          ["Events", "Total number of MCP events in the session"],
          ["Cost", "Estimated total cost based on token usage"],
          ["Errors", "Number of failed tool calls or error responses"],
          ["Status", "Active (receiving events) or completed"],
        ]}
      />

      <SectionHeader
        id="wallet-auth"
        parentId="dashboard"
        title="Wallet Authentication"
      />
      <P>
        Candor uses Solana wallet-based authentication. Connect a Phantom or Solflare wallet
        to access your personal dashboard. Your wallet address serves as your account identifier.
      </P>

      <Callout type="success" title="Why Wallet Auth?">
        Wallet auth means no passwords, no email verification, and no centralized account storage.
        Your identity is your wallet — simple, secure, and decentralized.
      </Callout>

      <CodeBlock
        code={`// Supported wallets:
// - Phantom (browser extension)
// - Solflare (browser extension)
// - Any Wallet Standard compatible wallet

// The dashboard uses @solana/wallet-adapter-react
// Auth flow:
// 1. Click "Connect Wallet" → wallet popup
// 2. Approve connection → dashboard unlocks
// 3. Wallet address = account ID
// 4. Disconnect to return to demo mode`}
        language="typescript"
      />

      {/* ━━━━━━━━━━━━ API REFERENCE ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="api-reference"
        icon={BracketsSquare}
        title="API Reference"
        description="REST endpoints and WebSocket API for programmatic access."
        isMainSection
      />

      <SectionHeader
        id="rest-endpoints"
        parentId="api-reference"
        title="REST Endpoints"
      />

      <ApiEndpoint
        method="GET"
        path="/api/sessions"
        description="List sessions"
        params={[
          { name: "page", type: "number", description: "Page number (default: 1)" },
          { name: "limit", type: "number", description: "Items per page (default: 20)" },
          { name: "agentId", type: "string", description: "Filter by agent ID" },
          { name: "status", type: "string", description: "Filter: active | completed" },
        ]}
      />
      <ApiEndpoint
        method="GET"
        path="/api/sessions/:id"
        description="Session detail"
        params={[
          { name: "id", type: "string", description: "Session UUID" },
          { name: "includeEvents", type: "boolean", description: "Include event list (default: false)" },
        ]}
      />
      <ApiEndpoint
        method="GET"
        path="/api/events"
        description="Query events"
        params={[
          { name: "sessionId", type: "string", description: "Filter by session" },
          { name: "tool", type: "string", description: "Filter by tool name" },
          { name: "method", type: "string", description: "Filter by MCP method" },
          { name: "since", type: "ISO 8601", description: "Events after this timestamp" },
        ]}
      />
      <ApiEndpoint
        method="GET"
        path="/api/stats"
        description="Aggregated statistics"
        params={[
          { name: "period", type: "string", description: "1h | 24h | 7d | 30d" },
          { name: "groupBy", type: "string", description: "tool | agent | session" },
        ]}
      />
      <ApiEndpoint method="POST" path="/api/alert-rules" description="Create alert rule" />
      <ApiEndpoint method="PUT" path="/api/alert-rules/:id" description="Update alert rule" />
      <ApiEndpoint method="DELETE" path="/api/alert-rules/:id" description="Delete alert rule" />
      <ApiEndpoint method="GET" path="/api/alerts" description="List triggered alerts" />
      <ApiEndpoint method="GET" path="/api/cost-rates" description="List cost rates" />
      <ApiEndpoint method="PUT" path="/api/cost-rates/:id" description="Update cost rate" />

      <SectionHeader
        id="websocket"
        parentId="api-reference"
        title="WebSocket API"
      />
      <P>
        Connect to the WebSocket endpoint for real-time event streaming.
        Events are broadcast as they are intercepted by the proxy.
      </P>

      <CodeBlock
        code={`// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3101');

ws.onopen = () => {
  console.log('Connected to Candor event stream');

  // Subscribe to specific sessions (optional)
  ws.send(JSON.stringify({
    type: 'subscribe',
    sessionId: 'session-uuid-here'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'event':
      // New MCP event intercepted
      console.log(data.event);
      break;
    case 'session:start':
      // New session began
      console.log('New session:', data.sessionId);
      break;
    case 'session:end':
      // Session completed
      console.log('Session ended:', data.sessionId);
      break;
    case 'alert':
      // Alert rule triggered
      console.log('Alert:', data.alert);
      break;
  }
};`}
        language="typescript"
        filename="websocket-client.ts"
        showLineNumbers
      />

      <SectionHeader
        id="event-schema"
        parentId="api-reference"
        title="Event Schema"
      />
      <P>Each MCP event has the following structure:</P>

      <CodeBlock
        code={`interface MCPEvent {
  id: string;           // Unique event ID
  sessionId: string;    // Parent session ID
  timestamp: string;    // ISO 8601 timestamp
  direction: 'request' | 'response';

  // MCP fields
  method: string;       // e.g., "tools/call", "resources/read"
  toolName?: string;    // Tool name (for tool calls)
  params?: object;      // Request parameters
  result?: object;      // Response result

  // Metadata
  latencyMs?: number;   // Round-trip latency
  costEstimate?: number; // Estimated USD cost
  tokenCount?: {
    input: number;
    output: number;
  };
  status: 'success' | 'error';
  error?: string;       // Error message (if status is 'error')
}`}
        language="typescript"
        filename="types/event.ts"
        showLineNumbers
      />

      {/* ━━━━━━━━━━━━ COST TRACKING ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="cost-tracking"
        icon={CurrencyDollar}
        title="Cost Tracking"
        description="Monitor and attribute costs across agents, sessions, and tools."
        isMainSection
      />

      <SectionHeader
        id="cost-models"
        parentId="cost-tracking"
        title="Cost Models"
      />
      <P>
        Candor estimates costs by analyzing token counts in MCP payloads and matching them
        against configurable rate cards for different LLM providers.
      </P>

      <DocsTable
        headers={["Provider", "Model", "Input (per 1K)", "Output (per 1K)"]}
        rows={[
          ["Anthropic", "Claude Opus 4", "$15.00", "$75.00"],
          ["Anthropic", "Claude Sonnet 4", "$3.00", "$15.00"],
          ["Anthropic", "Claude Haiku 3.5", "$0.80", "$4.00"],
          ["OpenAI", "GPT-4o", "$2.50", "$10.00"],
          ["OpenAI", "GPT-4o mini", "$0.15", "$0.60"],
        ]}
      />

      <SectionHeader
        id="custom-rates"
        parentId="cost-tracking"
        title="Custom Rates"
      />
      <P>Configure custom cost rates via the API or dashboard settings:</P>

      <CodeBlock
        code={`// Create custom cost rate
PUT /api/cost-rates/custom-model

{
  "provider": "custom",
  "model": "my-fine-tuned-model",
  "inputPer1kTokens": 5.00,
  "outputPer1kTokens": 15.00,
  "currency": "USD"
}`}
        language="json"
      />

      {/* ━━━━━━━━━━━━ ALERTS ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="alerts"
        icon={Bell}
        title="Alerts"
        description="Define rules to get notified when things need attention."
        isMainSection
      />

      <SectionHeader
        id="alert-rules"
        parentId="alerts"
        title="Alert Rules"
      />
      <P>
        Alert rules evaluate conditions against incoming events. When a condition matches,
        Candor creates an alert and optionally sends a webhook notification.
      </P>

      <CodeBlock
        code={`// Create alert rule via API
POST /api/alert-rules

{
  "name": "High Error Rate",
  "condition": {
    "type": "error_rate",
    "threshold": 0.1,     // 10% error rate
    "window": "5m"        // Over a 5-minute window
  },
  "webhookUrl": "https://hooks.slack.com/services/xxx",
  "enabled": true
}`}
        language="json"
      />

      <SectionHeader
        id="webhooks"
        parentId="alerts"
        title="Webhooks"
      />
      <P>
        Alert notifications are sent as HTTP POST requests to your configured webhook URL.
        Each payload includes the alert details, triggering event, and session context.
      </P>

      <CodeBlock
        code={`// Webhook payload example
{
  "id": "alert-uuid",
  "rule": "High Error Rate",
  "severity": "warning",
  "message": "Error rate exceeded 10% in the last 5 minutes",
  "timestamp": "2026-02-23T14:30:00Z",
  "session": {
    "id": "session-uuid",
    "agentId": "claude-desktop"
  },
  "event": {
    "id": "event-uuid",
    "method": "tools/call",
    "toolName": "file_write",
    "status": "error",
    "error": "Permission denied"
  }
}`}
        language="json"
        filename="webhook-payload.json"
        showLineNumbers
      />

      <SectionHeader
        id="conditions"
        parentId="alerts"
        title="Condition Types"
      />

      <DocsTable
        headers={["Type", "Description", "Parameters"]}
        rows={[
          ["error_rate", "Triggers when error rate exceeds threshold", "threshold (0-1), window"],
          ["latency", "Triggers when p95 latency exceeds threshold", "thresholdMs, window"],
          ["cost_spike", "Triggers when session cost exceeds budget", "maxCostUsd"],
          ["tool_failure", "Triggers on specific tool error", "toolName, errorPattern"],
          ["session_duration", "Triggers when session exceeds time limit", "maxDurationMs"],
          ["event_count", "Triggers when events per session exceed limit", "maxEvents"],
        ]}
      />

      {/* ━━━━━━━━━━━━ DEPLOYMENT ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="deployment"
        icon={ArrowsClockwise}
        title="Deployment"
        description="Deploy Candor for team-wide or production observability."
        isMainSection
      />

      <SectionHeader
        id="railway-deploy"
        parentId="deployment"
        title="Railway"
      />
      <P>
        Railway is the recommended deployment platform. Deploy the dashboard, proxy,
        and PostgreSQL database as connected services.
      </P>

      <CodeBlock
        code={`# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL=<auto-provided>
railway variables set PROXY_PORT=3100
railway variables set DASHBOARD_PORT=3200`}
        language="bash"
      />

      <SectionHeader
        id="docker-deploy"
        parentId="deployment"
        title="Docker"
      />

      <CodeBlock
        code={`# Dockerfile
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3100 3200 3101

CMD ["npm", "start"]`}
        language="dockerfile"
        filename="Dockerfile"
        showLineNumbers
      />

      <CodeBlock
        code={`# docker-compose.yml
services:
  candor:
    build: .
    ports:
      - "3100:3100"
      - "3200:3200"
      - "3101:3101"
    environment:
      - DATABASE_URL=postgresql://candor:secret@db:5432/candor
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: candor
      POSTGRES_USER: candor
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`}
        language="yaml"
        filename="docker-compose.yml"
        showLineNumbers
      />

      <SectionHeader
        id="self-hosted"
        parentId="deployment"
        title="Self-Hosted"
      />
      <P>For self-hosted deployments, you need Node.js 18+ and PostgreSQL 14+:</P>

      <StepList
        steps={[
          { title: "Clone the repository", description: "git clone https://github.com/candor-io/candor.git" },
          { title: "Install dependencies", description: "npm install" },
          { title: "Set up the database", description: "Create a PostgreSQL database and set DATABASE_URL" },
          { title: "Run migrations", description: "npx prisma migrate deploy" },
          { title: "Build the dashboard", description: "npm run build" },
          { title: "Start", description: "npm start (or use PM2/systemd for process management)" },
        ]}
      />

      {/* ━━━━━━━━━━━━ TROUBLESHOOTING ━━━━━━━━━━━━ */}
      <div className="hero-line" style={{ margin: "48px 0", opacity: 0.3 }} />

      <SectionHeader
        id="troubleshooting"
        icon={Wrench}
        title="Troubleshooting"
        description="Common issues and frequently asked questions."
        isMainSection
      />

      <SectionHeader
        id="common-issues"
        parentId="troubleshooting"
        title="Common Issues"
      />

      <Callout type="warning" title="Port already in use">
        If port 3100 is occupied, either stop the conflicting process or use{" "}
        <InlineCode>candor start --port 4100</InlineCode> to specify an alternative port.
      </Callout>

      <Callout type="warning" title="Wallet connection fails">
        Make sure you have Phantom or Solflare browser extension installed.
        Candor does not support hardware wallets (Ledger) due to USB dependency constraints.
      </Callout>

      <Callout type="info" title="Events not appearing in dashboard">
        Check that your MCP client is routing through the Candor proxy port (default: 3100).
        Use <InlineCode>candor status</InlineCode> to verify the proxy is running and upstreams are connected.
      </Callout>

      <Callout type="info" title="High memory usage">
        If the proxy is consuming too much memory, reduce <InlineCode>MAX_EVENTS_PER_SESSION</InlineCode> and
        {" "}<InlineCode>LOG_RETENTION_DAYS</InlineCode> in your environment variables.
      </Callout>

      <SectionHeader
        id="faq"
        parentId="troubleshooting"
        title="FAQ"
      />

      <FaqItem question="Does Candor modify my agent's MCP traffic?">
        No. Candor is a read-only proxy. It forwards all traffic unchanged between your agent
        and MCP servers. The only addition is metadata logging and event streaming.
      </FaqItem>

      <FaqItem question="Can I use Candor with multiple agents simultaneously?">
        Yes. The proxy handles multiple concurrent connections and creates separate sessions
        for each agent. The dashboard shows all sessions in a unified view.
      </FaqItem>

      <FaqItem question="What happens if the proxy goes down?">
        Your agent will lose connection to MCP servers while the proxy is down. We recommend
        using a process manager (PM2, systemd) for production to auto-restart on failure.
      </FaqItem>

      <FaqItem question="Is my data stored securely?">
        All data is stored in your PostgreSQL database — Candor never sends data to external
        servers. The dashboard authenticates via Solana wallet, with no centralized account system.
      </FaqItem>

      <FaqItem question="Can I export event data?">
        Yes. Use the REST API to query and export events as JSON. Full CSV/Parquet export
        is planned for a future release.
      </FaqItem>

      {/* ─── Bottom nav ─── */}
      <div
        style={{
          marginTop: 64,
          padding: "32px 0",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <a
          href="/"
          className="font-[family-name:var(--font-figtree)]"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
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
        <a
          href="https://github.com/candor-io/candor"
          target="_blank"
          rel="noopener noreferrer"
          className="font-[family-name:var(--font-figtree)]"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-muted)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <GithubLogo size={14} weight="bold" />
          View on GitHub
          <ArrowUpRight size={10} />
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FAQ Item
   ═══════════════════════════════════════════════ */

function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-card)",
        marginBottom: 8,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="font-[family-name:var(--font-figtree)]"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text-primary)",
          fontSize: 14,
          fontWeight: 500,
          textAlign: "left",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.03)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <CaretRight
          size={14}
          color="var(--accent-indigo)"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
        <span>{question}</span>
      </button>
      {open && (
        <div
          className="font-[family-name:var(--font-figtree)]"
          style={{
            padding: "0 20px 16px 46px",
            fontSize: 13.5,
            lineHeight: 1.7,
            color: "var(--text-secondary)",
            animation: "docs-expand 0.2s ease-out",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
