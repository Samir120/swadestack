import { Op } from 'sequelize';
import RefreshToken from '../models/sequelize/RefreshToken';

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // daily
const INITIAL_DELAY_MS = 60 * 1000; // let boot settle before the first sweep

let timer: NodeJS.Timeout | null = null;

/**
 * Delete refresh tokens whose expiry has passed.
 *
 * Only `expiresAt < now` is pruned. Revoked-but-unexpired tokens are kept on
 * purpose: they are what lets the refresh flow detect a revoked token being
 * replayed. They get cleaned up once they expire on their own.
 */
export const pruneExpiredRefreshTokens = async (): Promise<number> => {
  const deleted = await RefreshToken.destroy({
    where: { expiresAt: { [Op.lt]: new Date() } },
  });

  if (deleted > 0) {
    console.log(`[TokenCleanup] Removed ${deleted} expired refresh token(s)`);
  }
  return deleted;
};

/**
 * Start the periodic sweep. Safe to call once at boot; repeated calls are no-ops.
 *
 * A scheduled sweep is used rather than pruning inside the login/refresh path so
 * that a hot auth request never pays for a table-wide DELETE. If this app is ever
 * scaled to multiple instances, move this to an external scheduler so only one
 * process sweeps.
 */
export const startTokenCleanupSchedule = (): void => {
  if (timer) return;

  const run = () => {
    pruneExpiredRefreshTokens().catch((err) => {
      // Cleanup is best-effort — never let it take the process down.
      console.error('[TokenCleanup] Failed to prune expired refresh tokens:', err);
    });
  };

  setTimeout(run, INITIAL_DELAY_MS);
  timer = setInterval(run, CLEANUP_INTERVAL_MS);
  // Do not hold the event loop open purely for this timer.
  timer.unref?.();

  console.log('[TokenCleanup] Scheduled expired-token cleanup (every 24h)');
};

export const stopTokenCleanupSchedule = (): void => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};
