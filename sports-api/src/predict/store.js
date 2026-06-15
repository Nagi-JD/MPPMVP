// File-based, persistent prediction store: sports-api/.data/predictions.json

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../.data");
const FILE = path.join(DATA_DIR, "predictions.json");

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]", "utf8");
  }
}

/**
 * Load all raw stored predictions: [{ id, userId, marketId, value, createdAt }]
 */
export async function loadAll() {
  await ensureFile();
  const txt = await fs.readFile(FILE, "utf8");
  try {
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function saveAll(arr) {
  await ensureFile();
  await fs.writeFile(FILE, JSON.stringify(arr, null, 2), "utf8");
}

export async function getByUser(userId) {
  const all = await loadAll();
  return all.filter((p) => p.userId === userId);
}

/**
 * Insert or replace the prediction for (userId, marketId).
 * Returns the stored raw record.
 */
export async function upsert({ userId, marketId, value }) {
  const all = await loadAll();
  const id = `${userId}:${marketId}`;
  const idx = all.findIndex((p) => p.userId === userId && p.marketId === marketId);
  const record = {
    id,
    userId,
    marketId,
    value: String(value),
    createdAt: idx >= 0 ? all[idx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) all[idx] = record;
  else all.push(record);
  await saveAll(all);
  return record;
}
