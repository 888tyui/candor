import { createHmac } from "crypto";
import { isAllowedWebhookUrl } from "./validation";

let _webhookSecret: string | null = null;

function getWebhookSecret(): string {
  if (_webhookSecret) return _webhookSecret;
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("WEBHOOK_SECRET environment variable is required");
  }
  _webhookSecret = secret;
  return _webhookSecret;
}
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

// Per-rule debounce tracking (capped at 10k entries)
const lastDelivery = new Map<string, number>();
const DEBOUNCE_MS = 10_000; // 10s debounce per rule
const MAX_DEBOUNCE_ENTRIES = 10_000;

interface WebhookPayload {
  event: string;
  ruleId: string;
  ruleName: string;
  alert: {
    id: string;
    message: string;
    severity: string;
    sessionId: string;
    eventId?: string;
  };
  timestamp: string;
}

function signPayload(body: string): string {
  return createHmac("sha256", getWebhookSecret()).update(body).digest("hex");
}

export async function deliverWebhook(
  url: string,
  payload: WebhookPayload
): Promise<boolean> {
  // SSRF protection: validate URL before making any request
  if (!isAllowedWebhookUrl(url)) {
    console.error(`[webhook] Blocked request to disallowed URL: ${url}`);
    return false;
  }

  // Per-rule debounce
  const lastTime = lastDelivery.get(payload.ruleId);
  if (lastTime && Date.now() - lastTime < DEBOUNCE_MS) {
    return false;
  }

  const body = JSON.stringify(payload);
  const signature = signPayload(body);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Candor-Signature": `sha256=${signature}`,
          "X-Candor-Event": payload.event,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });

      if (res.ok) {
        // Cap debounce map size
        if (lastDelivery.size >= MAX_DEBOUNCE_ENTRIES) {
          const oldest = Array.from(lastDelivery.entries())
            .sort((a, b) => a[1] - b[1])[0];
          if (oldest) lastDelivery.delete(oldest[0]);
        }
        lastDelivery.set(payload.ruleId, Date.now());
        return true;
      }

      // 4xx errors are not retryable
      if (res.status >= 400 && res.status < 500) {
        console.error(
          `[webhook] ${url} returned ${res.status}, not retrying`
        );
        return false;
      }
    } catch (err) {
      console.error(
        `[webhook] attempt ${attempt + 1}/${MAX_RETRIES} failed for ${url}:`,
        err
      );
    }

    // Exponential backoff
    if (attempt < MAX_RETRIES - 1) {
      await new Promise((r) =>
        setTimeout(r, INITIAL_BACKOFF_MS * Math.pow(2, attempt))
      );
    }
  }

  return false;
}
