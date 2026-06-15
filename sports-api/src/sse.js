// SSE hub with per-category subscriber tracking and a quota-protective poll loop.
// Polling for a category runs ONLY while that category has >= 1 subscriber.
import { fetchLiveEvents } from "./live.js";

const CADENCE_MS = {
  nba: 20_000,
  lnb: 20_000,
  euroleague: 20_000,
  f1: 8_000,
};

const clients = new Map(); // category -> Set<res>
const timers = new Map(); // category -> intervalId

export function addClient(res, category) {
  if (!clients.has(category)) clients.set(category, new Set());
  clients.get(category).add(res);
  startPolling(category);
}

export function removeClient(res, category) {
  const set = clients.get(category);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) {
    clients.delete(category);
    stopPolling(category);
  }
}

export function broadcast(category, payload) {
  const set = clients.get(category);
  if (!set || set.size === 0) return;
  const data = `event: update\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of set) {
    try {
      res.write(data);
    } catch {
      // best-effort; dead connections cleaned up on close
    }
  }
}

function startPolling(category) {
  if (timers.has(category)) return; // already polling
  const cadence = CADENCE_MS[category] || 20_000;

  const poll = async () => {
    // Guard: only poll while subscribers exist.
    if (!clients.get(category)?.size) return;
    try {
      const events = await fetchLiveEvents(category);
      broadcast(category, { category, events, ts: new Date().toISOString() });
    } catch (err) {
      broadcast(category, { category, error: err.message, ts: new Date().toISOString() });
    }
  };

  poll(); // immediate first push
  const id = setInterval(poll, cadence);
  if (typeof id.unref === "function") id.unref();
  timers.set(category, id);
}

function stopPolling(category) {
  const id = timers.get(category);
  if (id) {
    clearInterval(id);
    timers.delete(category);
  }
}
