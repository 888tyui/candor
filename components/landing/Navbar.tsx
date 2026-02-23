"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ListIcon as List,
  XIcon as X,
  GithubLogoIcon as GithubLogo,
  XLogoIcon as XLogo,
  ArrowUpRightIcon as ArrowUpRight,
  ShieldCheckIcon as ShieldCheck,
  ActivityIcon as Activity,
  ClockCountdownIcon as ClockCountdown,
  CurrencyDollarIcon as CurrencyDollar,
  BellIcon as Bell,
  RocketLaunchIcon as RocketLaunch,
  GearIcon as Gear,
  TerminalIcon as Terminal,
  EyeIcon as Eye,
  BookOpenIcon as BookOpen,
  ChartLineUpIcon as ChartLineUp,
  PlugsIcon as Plugs,
  CaretDownIcon as CaretDown,
  StarIcon as Star,
} from "@phosphor-icons/react";

/* ═══════════════════════════════════════════════
   Dropdown Content Definitions
   ═══════════════════════════════════════════════ */

interface DropdownItem {
  icon: React.ComponentType<{ size?: number; weight?: "bold" | "duotone" | "fill"; color?: string }>;
  label: string;
  description: string;
  href: string;
  color: string;
  colorRgb: string;
}

interface NavDropdown {
  label: string;
  items: DropdownItem[];
  featured?: { label: string; description: string; href: string; cta: string };
}

const productDropdown: NavDropdown = {
  label: "Product",
  items: [
    {
      icon: ShieldCheck,
      label: "MCP Proxy",
      description: "Zero-config transparent interceptor",
      href: "#features",
      color: "var(--accent-cyan)",
      colorRgb: "var(--accent-cyan-rgb)",
    },
    {
      icon: Activity,
      label: "Live Timeline",
      description: "Real-time event streaming",
      href: "#features",
      color: "var(--accent-indigo)",
      colorRgb: "var(--accent-indigo-rgb)",
    },
    {
      icon: ClockCountdown,
      label: "Session Explorer",
      description: "Browse historical agent sessions",
      href: "#features",
      color: "var(--accent-violet)",
      colorRgb: "var(--accent-violet-rgb)",
    },
    {
      icon: CurrencyDollar,
      label: "Cost Tracking",
      description: "Per-session cost attribution",
      href: "#features",
      color: "var(--accent-blue)",
      colorRgb: "var(--accent-blue-rgb)",
    },
    {
      icon: Bell,
      label: "Smart Alerts",
      description: "Custom rules and webhooks",
      href: "#features",
      color: "var(--accent-purple)",
      colorRgb: "var(--accent-purple-rgb)",
    },
  ],
  featured: {
    label: "What's new",
    description: "Solana wallet authentication and real-time WebSocket dashboard.",
    href: "/dashboard",
    cta: "Try Dashboard",
  },
};

const developersDropdown: NavDropdown = {
  label: "Developers",
  items: [
    {
      icon: BookOpen,
      label: "Documentation",
      description: "Guides, API reference, and examples",
      href: "/docs",
      color: "var(--accent-indigo)",
      colorRgb: "var(--accent-indigo-rgb)",
    },
    {
      icon: RocketLaunch,
      label: "Quick Start",
      description: "Get running in under 60 seconds",
      href: "/docs#quickstart",
      color: "var(--status-success)",
      colorRgb: "var(--status-success-rgb)",
    },
    {
      icon: Terminal,
      label: "CLI Reference",
      description: "candor start, init, and status",
      href: "/docs#cli-reference",
      color: "var(--accent-cyan)",
      colorRgb: "var(--accent-cyan-rgb)",
    },
    {
      icon: Plugs,
      label: "MCP Integration",
      description: "stdio, SSE, and supported clients",
      href: "/docs#mcp-integration",
      color: "var(--accent-violet)",
      colorRgb: "var(--accent-violet-rgb)",
    },
    {
      icon: Gear,
      label: "Configuration",
      description: "Proxy routes and environment setup",
      href: "/docs#configuration",
      color: "var(--status-warning)",
      colorRgb: "var(--status-warning-rgb)",
    },
  ],
  featured: {
    label: "Open Source",
    description: "Candor is fully open source. Star us on GitHub and contribute.",
    href: "https://github.com/candor-io/candor",
    cta: "View Repository",
  },
};

/* ═══════════════════════════════════════════════
   Main Navbar Component
   ═══════════════════════════════════════════════ */

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on scroll — separate handler so cancelClose can't override it
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - lastY) > 5) {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        setActiveDropdown(null);
        lastY = window.scrollY;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const inNav = navRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inNav && !inDropdown) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const openDropdown = useCallback((key: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveDropdown(key);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 anim-slide-down ${
        scrolled ? "nav-glass shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <nav
        ref={navRef}
        className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8"
        style={{ height: 64 }}
      >
        {/* ─── Logo ─── */}
        <Link href="/" className="flex items-center gap-3 group relative z-10">
          <div
            className="relative overflow-hidden transition-transform duration-300 group-hover:scale-110"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1px solid rgba(var(--accent-indigo-rgb), 0.15)",
              boxShadow: "0 0 20px rgba(var(--accent-indigo-rgb), 0.08)",
            }}
          >
            <Image src="/mascot.png" alt="Candor" width={34} height={34} className="object-cover" priority />
          </div>
          <span
            className="text-lg font-bold tracking-tight font-[family-name:var(--font-bricolage)]"
            style={{ color: "var(--text-primary)" }}
          >
            Candor
          </span>
        </Link>

        {/* ─── Desktop Navigation ─── */}
        <div className="hidden lg:flex items-center gap-0.5 relative" style={{ height: 64 }}>
          {/* Product dropdown trigger */}
          <NavTrigger
            label={productDropdown.label}
            isActive={activeDropdown === "product"}
            onMouseEnter={() => openDropdown("product")}
            onMouseLeave={scheduleClose}
          />

          {/* How it Works — simple link */}
          <a
            href="#how-it-works"
            className="nav-trigger-btn font-[family-name:var(--font-figtree)]"
            onMouseEnter={() => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); setActiveDropdown(null); }}
          >
            How it Works
          </a>

          {/* Developers dropdown trigger */}
          <NavTrigger
            label={developersDropdown.label}
            isActive={activeDropdown === "developers"}
            onMouseEnter={() => openDropdown("developers")}
            onMouseLeave={scheduleClose}
          />

          {/* Dashboard link */}
          <a
            href="/dashboard"
            className={`nav-trigger-btn font-[family-name:var(--font-figtree)]${pathname === "/dashboard" ? " active" : ""}`}
            onMouseEnter={() => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); setActiveDropdown(null); }}
          >
            Dashboard
          </a>
        </div>

        {/* ─── Desktop Actions ─── */}
        <div className="hidden lg:flex items-center gap-2 relative z-10">
          <a
            href="https://github.com/candor-io/candor"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-icon-btn"
            aria-label="GitHub"
          >
            <GithubLogo size={18} weight="bold" />
          </a>
          <a
            href="https://x.com/candor_io"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-icon-btn"
            aria-label="Twitter / X"
          >
            <XLogo size={18} weight="bold" />
          </a>
          <div className="w-px h-5 mx-1.5" style={{ background: "rgba(var(--white-rgb), 0.08)" }} />
          <Link href="/docs" className={`nav-ghost-btn font-[family-name:var(--font-figtree)]${pathname === "/docs" ? " nav-active" : ""}`}>
            Docs
          </Link>
          <Link href="/dashboard" className="nav-primary-btn font-[family-name:var(--font-figtree)]">
            <span>Get Started</span>
            <ArrowUpRight size={13} weight="bold" />
          </Link>
        </div>

        {/* ─── Mobile Toggle ─── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
          style={{
            color: mobileOpen ? "var(--accent-indigo)" : "var(--text-secondary)",
            background: mobileOpen ? "rgba(var(--accent-indigo-rgb), 0.1)" : "transparent",
            border: `1px solid ${mobileOpen ? "rgba(var(--accent-indigo-rgb), 0.2)" : "transparent"}`,
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
        </button>
      </nav>

      {/* ─── Mobile Menu ─── */}
      <div
        className="lg:hidden"
        style={{
          maxHeight: mobileOpen ? 600 : 0,
          opacity: mobileOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease",
          background: "rgba(var(--bg-deep-rgb), 0.97)",
          backdropFilter: "blur(24px)",
          borderTop: mobileOpen ? "1px solid rgba(var(--accent-indigo-rgb), 0.08)" : "1px solid transparent",
        }}
      >
        <div className="px-5 py-4 flex flex-col gap-1">
          {/* Product accordion */}
          <MobileAccordion
            label="Product"
            items={productDropdown.items}
            isExpanded={mobileExpanded === "product"}
            onToggle={() => setMobileExpanded(mobileExpanded === "product" ? null : "product")}
            onNavigate={() => setMobileOpen(false)}
          />
          <a
            href="#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="mobile-nav-link font-[family-name:var(--font-figtree)]"
          >
            How it Works
          </a>
          {/* Developers accordion */}
          <MobileAccordion
            label="Developers"
            items={developersDropdown.items}
            isExpanded={mobileExpanded === "developers"}
            onToggle={() => setMobileExpanded(mobileExpanded === "developers" ? null : "developers")}
            onNavigate={() => setMobileOpen(false)}
          />
          <a
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="mobile-nav-link font-[family-name:var(--font-figtree)]"
          >
            Dashboard
          </a>

          <div className="h-px my-2" style={{ background: "rgba(var(--white-rgb), 0.05)" }} />

          {/* Mobile actions */}
          <div className="flex items-center gap-2 px-1 pt-1">
            <Link href="/docs" className="nav-ghost-btn flex-1 justify-center font-[family-name:var(--font-figtree)]">
              Docs
            </Link>
            <Link href="/dashboard" className="nav-primary-btn flex-1 justify-center font-[family-name:var(--font-figtree)]">
              <span>Get Started</span>
              <ArrowUpRight size={13} weight="bold" />
            </Link>
          </div>

          <div className="flex items-center gap-2 px-1 pt-2">
            <a
              href="https://github.com/candor-io/candor"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-icon-btn"
              aria-label="GitHub"
            >
              <GithubLogo size={16} weight="bold" />
            </a>
            <a
              href="https://x.com/candor_io"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-icon-btn"
              aria-label="Twitter / X"
            >
              <XLogo size={16} weight="bold" />
            </a>
          </div>
        </div>
      </div>
    </header>

    {/* ─── Desktop Dropdown Panels (outside header to avoid parent backdrop-filter blocking child blur) ─── */}
    <div
      ref={dropdownRef}
      className="hidden lg:block fixed top-0 left-0 right-0 z-[49]"
      style={{ pointerEvents: activeDropdown ? "auto" : "none" }}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      {/* Transparent bridge covering navbar height — keeps hover chain alive */}
      <div style={{ height: 64 }} />
      <DropdownPanel
        dropdown={productDropdown}
        isOpen={activeDropdown === "product"}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      />
      <DropdownPanel
        dropdown={developersDropdown}
        isOpen={activeDropdown === "developers"}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      />
    </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   Desktop Nav Trigger Button
   ═══════════════════════════════════════════════ */

function NavTrigger({
  label,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: {
  label: string;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <button
      className={`nav-trigger-btn font-[family-name:var(--font-figtree)] ${isActive ? "active" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {label}
      <CaretDown
        size={11}
        weight="bold"
        style={{
          transform: isActive ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: 0.5,
        }}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════
   Desktop Dropdown Panel
   ═══════════════════════════════════════════════ */

function DropdownPanel({
  dropdown,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: {
  dropdown: NavDropdown;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      className="hidden lg:block"
      style={{
        position: "absolute",
        top: 64,
        left: 0,
        right: 0,
        zIndex: 40,
        pointerEvents: isOpen ? "auto" : "none",
        paddingTop: 8,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div
          className="nav-dropdown-panel"
          style={{
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateY(0)" : "translateY(-6px)",
            transition: "opacity 0.18s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Blur background layer — no opacity transition, snaps with visibility */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10, 12, 28, 0.85)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
              border: "1px solid rgba(var(--accent-indigo-rgb), 0.1)",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(var(--accent-indigo-rgb), 0.05), 0 0 80px rgba(var(--accent-indigo-rgb), 0.04)",
            }}
          />
          {/* Content layer */}
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: dropdown.featured ? "1fr 240px" : "1fr",
            }}
          >
          {/* Items grid */}
          <div style={{ padding: 8 }}>
            <div
              className="font-[family-name:var(--font-figtree)]"
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--text-muted)",
                padding: "12px 14px 8px",
              }}
            >
              {dropdown.label}
            </div>
            {dropdown.items.map((item) => (
              <DropdownItem key={item.label} item={item} />
            ))}
          </div>

          {/* Featured panel */}
          {dropdown.featured && (
            <div
              style={{
                padding: 20,
                borderLeft: "1px solid rgba(var(--accent-indigo-rgb), 0.08)",
                background: "rgba(var(--accent-indigo-rgb), 0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--accent-indigo)",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Star size={11} weight="fill" />
                {dropdown.featured.label}
              </div>
              <p
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  marginBottom: 16,
                }}
              >
                {dropdown.featured.description}
              </p>
              <a
                href={dropdown.featured.href}
                className="nav-featured-cta font-[family-name:var(--font-figtree)]"
              >
                {dropdown.featured.cta}
                <ArrowUpRight size={12} weight="bold" />
              </a>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Dropdown Item
   ═══════════════════════════════════════════════ */

function DropdownItem({ item }: { item: DropdownItem }) {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      className="nav-dropdown-item font-[family-name:var(--font-figtree)]"
    >
      <div
        className="nav-dropdown-icon"
        style={{
          background: `rgba(${item.colorRgb}, 0.06)`,
          border: `1px solid rgba(${item.colorRgb}, 0.09)`,
          color: item.color,
        }}
      >
        <Icon size={16} weight="duotone" />
      </div>
      <div>
        <div className="nav-dropdown-item-label">{item.label}</div>
        <div className="nav-dropdown-item-desc">{item.description}</div>
      </div>
    </a>
  );
}

/* ═══════════════════════════════════════════════
   Mobile Accordion
   ═══════════════════════════════════════════════ */

function MobileAccordion({
  label,
  items,
  isExpanded,
  onToggle,
  onNavigate,
}: {
  label: string;
  items: DropdownItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="mobile-nav-link font-[family-name:var(--font-figtree)]"
        style={{ width: "100%", display: "flex", justifyContent: "space-between" }}
      >
        {label}
        <CaretDown
          size={13}
          weight="bold"
          style={{
            transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.25s ease",
            opacity: 0.4,
          }}
        />
      </button>
      <div
        style={{
          maxHeight: isExpanded ? 400 : 0,
          opacity: isExpanded ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease",
        }}
      >
        <div style={{ padding: "4px 0 8px 8px" }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className="mobile-dropdown-item font-[family-name:var(--font-figtree)]"
              >
                <Icon size={15} weight="duotone" color={item.color} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
