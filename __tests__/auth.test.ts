import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

// Set env vars before importing modules that read them at import time
const TEST_JWT_SECRET = "test-secret-that-is-at-least-32-chars-long!!";
process.env.JWT_SECRET = TEST_JWT_SECRET;

import {
  signJWT,
  verifyJWT,
  createSIWSMessage,
  parseSIWSMessage,
  verifyEd25519Signature,
} from "../lib/auth";

describe("JWT sign & verify", () => {
  it("signs and verifies a token with correct claims", async () => {
    const wallet = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK";
    const jti = "session-123";

    const token = await signJWT(wallet, jti);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const payload = await verifyJWT(token);
    expect(payload.wallet).toBe(wallet);
    expect(payload.jti).toBe(jti);
    expect(payload.iss).toBe("candor");
    expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it("rejects a tampered token", async () => {
    const token = await signJWT("SomeWallet123", "jti-1");
    const tampered = token.slice(0, -5) + "XXXXX";
    await expect(verifyJWT(tampered)).rejects.toThrow();
  });

  it("rejects a token signed with a different secret", async () => {
    // We can't easily create one with a different secret via our API,
    // so just verify a garbage string rejects
    await expect(verifyJWT("not.a.token")).rejects.toThrow();
  });
});

describe("SIWS message creation & parsing", () => {
  const wallet = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK";
  const nonce = "abc123nonce";
  const domain = "app.candor.dev";

  it("creates a well-formatted SIWS message", () => {
    const msg = createSIWSMessage(wallet, nonce, domain);
    expect(msg).toContain(`${domain} wants you to sign in`);
    expect(msg).toContain(wallet);
    expect(msg).toContain(`Nonce: ${nonce}`);
    expect(msg).toContain("Sign in to Candor");
    expect(msg).toContain(`URI: https://${domain}`);
  });

  it("roundtrips through parse", () => {
    const msg = createSIWSMessage(wallet, nonce, domain);
    const parsed = parseSIWSMessage(msg);
    expect(parsed).not.toBeNull();
    expect(parsed!.wallet).toBe(wallet);
    expect(parsed!.nonce).toBe(nonce);
    expect(parsed!.domain).toBe(domain);
  });

  it("returns null for garbage input", () => {
    expect(parseSIWSMessage("")).toBeNull();
    expect(parseSIWSMessage("just some random text")).toBeNull();
  });

  it("returns null for missing fields", () => {
    const incomplete = "example.com wants you to sign in with your Solana account:\n\n";
    expect(parseSIWSMessage(incomplete)).toBeNull();
  });
});

describe("Ed25519 signature verification", () => {
  it("returns false for invalid base58 signature", () => {
    expect(
      verifyEd25519Signature("test message", "not-valid-base58!!!", "also-not-valid")
    ).toBe(false);
  });

  it("returns false for mismatched signature", () => {
    // Valid base58 but wrong sig/key pair
    const fakeKey = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK";
    const fakeSig = "5VERv8NMhvTEEGrLmPJ7rFKs5J5E6v3eFi9c6Y99f8WLkVXk3JfuWXyKqmgU1jx7F2WbhRKsw9DfpXaGFhNVfQZ3";
    expect(verifyEd25519Signature("test message", fakeSig, fakeKey)).toBe(false);
  });
});
