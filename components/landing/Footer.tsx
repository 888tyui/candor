"use client";

import Image from "next/image";
import { GithubLogoIcon as GithubLogo, XLogoIcon as XLogo, ArrowUpRightIcon as ArrowUpRight } from "@phosphor-icons/react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/docs#api-reference" },
      { label: "Changelog", href: "https://github.com/candor-io/candor/releases", external: true },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "https://github.com/candor-io/candor", external: true },
      { label: "Twitter / X", href: "https://x.com/candor_io", external: true },
      { label: "Discord", href: "https://discord.gg/candor", external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "64px 24px 32px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Top row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 40,
            marginBottom: 56,
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Image src="/mascot.png" alt="Candor" width={28} height={28} style={{ borderRadius: 6 }} />
              <span
                className="font-[family-name:var(--font-bricolage)]"
                style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}
              >
                Candor
              </span>
            </div>
            <p
              className="font-[family-name:var(--font-figtree)]"
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                maxWidth: 240,
                marginBottom: 20,
              }}
            >
              Real-time observability for AI agents. See everything your agents do.
            </p>

            {/* Social buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <SocialButton href="https://x.com/candor_io" label="Twitter / X">
                <XLogo size={16} weight="bold" />
              </SocialButton>
              <SocialButton href="https://github.com/candor-io/candor" label="GitHub">
                <GithubLogo size={16} weight="bold" />
              </SocialButton>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4
                className="font-[family-name:var(--font-figtree)]"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: 16,
                }}
              >
                {group.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={"external" in link ? "_blank" : undefined}
                      rel={"external" in link ? "noopener noreferrer" : undefined}
                      className="font-[family-name:var(--font-figtree)]"
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    >
                      {link.label}
                      {"external" in link && <ArrowUpRight size={10} />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: 24,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            className="font-[family-name:var(--font-figtree)]"
            style={{ fontSize: 12, color: "var(--text-muted)" }}
          >
            &copy; {new Date().getFullYear()} Candor. Open source under MIT License.
          </span>
          <span
            className="font-[family-name:var(--font-ibm-plex-mono)]"
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              padding: "4px 12px",
              borderRadius: 6,
              background: "rgba(99,102,241,0.04)",
              border: "1px solid rgba(99,102,241,0.08)",
            }}
          >
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
}

function SocialButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "rgba(99,102,241,0.06)",
        border: "1px solid rgba(99,102,241,0.1)",
        color: "var(--text-secondary)",
        transition: "all 0.2s",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
        e.currentTarget.style.background = "rgba(99,102,241,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.1)";
        e.currentTarget.style.background = "rgba(99,102,241,0.06)";
      }}
    >
      {children}
    </a>
  );
}
