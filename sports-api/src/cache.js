// Simple in-memory cache with TTL, permanent entries, and in-flight dedupe.

const store = new Map(); // key -> { value, expires }  (expires = epoch ms, Infinity = permanent)
const inflight = new Map(); // key -> Promise

export function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expires !== Infinity && Date.now() > entry.expires) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function setPermanent(key, value) {
  store.set(key, { value, expires: Infinity });
}

function set(key, value, ttlMs) {
  const expires = ttlMs === Infinity ? Infinity : Date.now() + ttlMs;
  store.set(key, { value, expires });
}

/**
 * Returns cached value if fresh; otherwise awaits fetchFn and stores it.
 * Concurrent calls with the same key share a single upstream promise.
 */
export async function getOrFetch(key, ttlMs, fetchFn) {
  const cached = get(key);
  if (cached !== undefined) return cached;

  if (inflight.has(key)) return inflight.get(key);

  const promise = (async () => {
    const value = await fetchFn();
    set(key, value, ttlMs);
    return value;
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

export function _clear() {
  store.clear();
  inflight.clear();
}
