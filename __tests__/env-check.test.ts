import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("validateEnv", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // Reset the module to clear the `validated` flag
    vi.resetModules();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("does not error when all vars present", async () => {
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/candor";
    process.env.JWT_SECRET = "a-very-long-secret-that-is-at-least-32-chars";

    const { validateEnv } = await import("../lib/env-check");
    validateEnv();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("warns about short JWT_SECRET", async () => {
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/candor";
    process.env.JWT_SECRET = "short";

    const { validateEnv } = await import("../lib/env-check");
    validateEnv();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("at least 32 characters")
    );
  });

  it("logs missing required vars", async () => {
    delete process.env.DATABASE_URL;
    process.env.JWT_SECRET = "a-very-long-secret-that-is-at-least-32-chars";

    const { validateEnv } = await import("../lib/env-check");
    validateEnv();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("DATABASE_URL")
    );
  });

  it("only validates once (lazy)", async () => {
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/candor";
    process.env.JWT_SECRET = "a-very-long-secret-that-is-at-least-32-chars";

    const { validateEnv } = await import("../lib/env-check");
    validateEnv();
    validateEnv();
    validateEnv();

    // No errors, and the internal flag prevents re-running
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
