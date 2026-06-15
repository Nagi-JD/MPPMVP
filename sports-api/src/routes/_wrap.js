// Wrap an async route handler so upstream errors become JSON 502 responses.
export function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((err) => {
      if (res.headersSent) return next(err);
      res.status(502).json({ error: err.message || "Upstream failure" });
    });
  };
}
