/**
 * Validate required environment variables at runtime.
 * Called lazily on first API request, not at module level (to avoid build-time failures).
 */
let validated = false;

export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const required: [string, string][] = [
    ["DATABASE_URL", "PostgreSQL connection string"],
    ["JWT_SECRET", "JWT signing secret (min 32 chars)"],
  ];

  const missing: string[] = [];
  for (const [name, desc] of required) {
    if (!process.env[name]) {
      missing.push(`  - ${name}: ${desc}`);
    }
  }

  if (missing.length > 0) {
    console.error(
      `\n[candor] Missing required environment variables:\n${missing.join("\n")}\n`
    );
  }

  // Validate JWT_SECRET length
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    console.error(
      "[candor] JWT_SECRET must be at least 32 characters for security."
    );
  }
}
