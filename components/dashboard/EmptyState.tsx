"use client";

import type { Icon } from "@phosphor-icons/react";

export default function EmptyState({
  icon: IconComp,
  title,
  description,
  action,
}: {
  icon: Icon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.12)",
          marginBottom: 20,
        }}
      >
        <IconComp size={28} weight="duotone" color="var(--accent-indigo)" />
      </div>

      <h3
        className="font-[family-name:var(--font-bricolage)]"
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 8,
        }}
      >
        {title}
      </h3>

      <p
        className="font-[family-name:var(--font-figtree)]"
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--text-secondary)",
          maxWidth: 360,
          marginBottom: action ? 24 : 0,
        }}
      >
        {description}
      </p>

      {action}
    </div>
  );
}
