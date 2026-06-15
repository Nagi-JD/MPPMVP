import { Router } from "express";
import { addClient, removeClient } from "../sse.js";
import { CATEGORIES } from "../config.js";

const router = Router();

// GET /v1/stream?category=nba|lnb|euroleague|f1
router.get("/stream", (req, res) => {
  const category = String(req.query.category || "");
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category: ${category}` });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write(`event: open\ndata: ${JSON.stringify({ category })}\n\n`);

  // Heartbeat to keep proxies from closing idle connections.
  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      /* noop */
    }
  }, 25_000);
  if (typeof heartbeat.unref === "function") heartbeat.unref();

  addClient(res, category);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(res, category);
  });
});

export default router;
