import type express from "express";

/**
 * Express middleware: one stderr line per request with method, path, status and
 * timing. The Authorization header is reduced to a presence flag and its scheme,
 * never its value, so the key cannot reach the logs. Install it before the
 * API-key gate so rejected requests are recorded too.
 */
export function createRequestLogMiddleware(): express.RequestHandler {
  return (req, res, next) => {
    const started = Date.now();
    res.on("finish", () => {
      const header = req.headers.authorization;
      const auth = header ? (header.startsWith("Bearer ") ? "bearer" : "other") : "none";
      const session = req.headers["mcp-session-id"] ? "yes" : "no";
      const ua = String(req.headers["user-agent"] ?? "-").slice(0, 80);
      console.error(
        `[http] ${req.method} ${req.path} ${res.statusCode} ${Date.now() - started}ms auth=${auth} session=${session} ua="${ua}"`
      );
    });
    next();
  };
}
