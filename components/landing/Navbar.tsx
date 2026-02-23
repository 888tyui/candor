"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ListIcon as List,
  XIcon as X,
  GithubLogoIcon as GithubLogo,
  XLogoIcon as XLogo,
  ArrowUpRightIcon as ArrowUpRight,
} from "@phosphor-icons/react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Docs", href: "/docs" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 anim-slide-down ${
        scrolled
          ? "nav-glass shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/mascot.png"
              alt="Candor"
              width={36}
              height={36}
              className="object-cover"
              priority
            />
          </div>
          <span
            className="text-xl font-bold tracking-tight font-[family-name:var(--font-bricolage)]"
            style={{ color: "var(--text-primary)" }}
          >
            Candor
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link-animated relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg font-[family-name:var(--font-figtree)]"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="https://x.com/candor_io"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-hover-lift flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
            aria-label="Twitter / X"
          >
            <XLogo size={20} weight="bold" />
          </a>
          <a
            href="https://github.com/candor-io/candor"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-hover-lift flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
            aria-label="GitHub"
          >
            <GithubLogo size={20} weight="bold" />
          </a>
          <div
            className="w-px h-6 mx-2"
            style={{ background: "var(--border-subtle)" }}
          />
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 font-[family-name:var(--font-figtree)]"
            style={{
              color: "var(--accent-indigo)",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.15)";
            }}
          >
            Try Dashboard
            <ArrowUpRight size={14} weight="bold" />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "var(--text-secondary)" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X size={22} weight="bold" />
          ) : (
            <List size={22} weight="bold" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t anim-fade-in"
          style={{
            background: "rgba(6, 7, 15, 0.95)",
            backdropFilter: "blur(20px)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-white/5 font-[family-name:var(--font-figtree)]"
                style={{ color: "var(--text-secondary)" }}
              >
                {link.label}
              </a>
            ))}
            <div
              className="h-px my-2"
              style={{ background: "var(--border-subtle)" }}
            />
            <div className="flex items-center gap-3 px-4 py-2">
              <a
                href="https://x.com/candor_io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Twitter / X"
              >
                <XLogo size={20} weight="bold" />
              </a>
              <a
                href="https://github.com/candor-io/candor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
                aria-label="GitHub"
              >
                <GithubLogo size={20} weight="bold" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
