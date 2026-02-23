import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        background: "var(--bg-deep)",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          marginBottom: 32,
        }}
      >
        <Image
          src="/mascot.png"
          alt="Candor mascot"
          width={120}
          height={120}
          style={{
            borderRadius: 24,
            filter: "drop-shadow(0 8px 32px rgba(99,102,241,0.2))",
          }}
          priority
        />
        <div
          className="font-[family-name:var(--font-ibm-plex-mono)]"
          style={{
            position: "absolute",
            bottom: -8,
            right: -12,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--accent-indigo)",
            background: "var(--bg-surface)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 8,
            padding: "4px 10px",
          }}
        >
          404
        </div>
      </div>

      <h1
        className="font-[family-name:var(--font-bricolage)]"
        style={{
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          marginBottom: 12,
          lineHeight: 1.1,
        }}
      >
        Page not found
      </h1>

      <p
        className="font-[family-name:var(--font-figtree)]"
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: "var(--text-secondary)",
          maxWidth: 400,
          marginBottom: 36,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          className="font-[family-name:var(--font-figtree)]"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: "var(--accent-indigo)",
            borderRadius: 12,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          Go Home
        </Link>
        <Link
          href="/docs"
          className="font-[family-name:var(--font-figtree)]"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-secondary)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          Documentation
        </Link>
      </div>
    </div>
  );
}
