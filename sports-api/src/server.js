import express from "express";
import cors from "cors";
import { PORT, CORS_ORIGINS, NOTIFY_INTERVAL_MS } from "./config.js";
import { startNotifyCron } from "./predict/notify.js";

import categoriesRouter from "./routes/categories.js";
import gamesRouter from "./routes/games.js";
import eventsRouter from "./routes/events.js";
import standingsRouter from "./routes/standings.js";
import streamRouter from "./routes/stream.js";
import appRouter from "./routes/app.js";

const app = express();

// If CORS_ORIGINS is just ["*"], pass the wildcard string so cors reflects all.
const corsOrigin = CORS_ORIGINS.length === 1 && CORS_ORIGINS[0] === "*" ? "*" : CORS_ORIGINS;
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/v1", categoriesRouter);
app.use("/v1", streamRouter);
app.use("/v1", gamesRouter);
app.use("/v1", eventsRouter);
app.use("/v1", standingsRouter);
app.use("/v1", appRouter);

// 404 for unknown routes.
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

// Final error handler — JSON, 502 for upstream failures.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (res.headersSent) return;
  res.status(502).json({ error: err.message || "Upstream failure" });
});

app.listen(PORT, () => {
  console.log(`mpp-sports-api listening on http://localhost:${PORT}`);
  // Settlement → push-notification cron (no-op unless SUPABASE_URL is set).
  startNotifyCron(NOTIFY_INTERVAL_MS);
});

export default app;
