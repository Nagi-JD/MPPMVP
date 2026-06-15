import { OPENF1_BASE } from "../config.js";

async function openf1Get(path) {
  const url = `${OPENF1_BASE}${path}`;
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`OpenF1 network error: ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(`OpenF1 request failed (${res.status} ${res.statusText}) for ${path}`);
  }
  const body = await res.json();
  return Array.isArray(body) ? body : [];
}

export async function getSessions({ year }) {
  return openf1Get(`/sessions?year=${encodeURIComponent(year)}`);
}

export async function getDrivers(session_key) {
  return openf1Get(`/drivers?session_key=${encodeURIComponent(session_key)}`);
}

export async function getPositions(session_key) {
  return openf1Get(`/position?session_key=${encodeURIComponent(session_key)}`);
}

export async function getRaceControl(session_key) {
  return openf1Get(`/race_control?session_key=${encodeURIComponent(session_key)}`);
}

export async function getLaps(session_key) {
  return openf1Get(`/laps?session_key=${encodeURIComponent(session_key)}`);
}
