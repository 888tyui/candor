import { prisma } from "./db";

const DEFAULT_RETENTION_DAYS = 7;

function getRetentionDays(): number {
  const env = process.env.LOG_RETENTION_DAYS;
  if (!env) return DEFAULT_RETENTION_DAYS;
  const parsed = parseInt(env, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RETENTION_DAYS;
}

/**
 * Delete events, sessions, alerts, and nonces older than the retention period.
 * Designed to run periodically (e.g. daily cron, or on proxy startup).
 */
export async function cleanupOldData(): Promise<{
  deletedEvents: number;
  deletedSessions: number;
  deletedAlerts: number;
  deletedNonces: number;
  deletedUserSessions: number;
}> {
  const retentionDays = getRetentionDays();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  // Delete old events first (foreign key constraint)
  const deletedEvents = await prisma.event.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });

  // Delete old alerts
  const deletedAlerts = await prisma.alert.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  // Delete sessions that ended before cutoff (keep active sessions)
  const deletedSessions = await prisma.session.deleteMany({
    where: {
      endedAt: { not: null, lt: cutoff },
    },
  });

  // Delete expired/used nonces (always safe to clean up)
  const deletedNonces = await prisma.authNonce.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true, createdAt: { lt: cutoff } },
      ],
    },
  });

  // Delete expired/revoked user sessions older than cutoff
  const deletedUserSessions = await prisma.userSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: cutoff } },
        { revoked: true, issuedAt: { lt: cutoff } },
      ],
    },
  });

  return {
    deletedEvents: deletedEvents.count,
    deletedSessions: deletedSessions.count,
    deletedAlerts: deletedAlerts.count,
    deletedNonces: deletedNonces.count,
    deletedUserSessions: deletedUserSessions.count,
  };
}

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start periodic cleanup. Runs every 24 hours by default.
 */
export function startPeriodicCleanup(intervalMs = 24 * 60 * 60 * 1000): void {
  if (cleanupInterval) return;

  // Run once immediately
  cleanupOldData()
    .then((result) => {
      const total = Object.values(result).reduce((a, b) => a + b, 0);
      if (total > 0) {
        console.log(`[data-retention] Cleaned up ${total} old records`, result);
      }
    })
    .catch((err) => {
      console.error("[data-retention] Cleanup failed:", err);
    });

  cleanupInterval = setInterval(() => {
    cleanupOldData()
      .then((result) => {
        const total = Object.values(result).reduce((a, b) => a + b, 0);
        if (total > 0) {
          console.log(`[data-retention] Cleaned up ${total} old records`, result);
        }
      })
      .catch((err) => {
        console.error("[data-retention] Cleanup failed:", err);
      });
  }, intervalMs);
}

export function stopPeriodicCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
