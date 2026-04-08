const http = require("node:http");
const { getDefaultConfig } = require("expo/metro-config");

/** Where Express listens (this machine). Not reachable from some phones if firewall blocks :3000. */
const API_TARGET =
  process.env.EXPO_API_PROXY_TARGET ?? "http://127.0.0.1:3000";

function parseTarget() {
  try {
    return new URL(API_TARGET);
  } catch {
    return new URL("http://127.0.0.1:3000");
  }
}

/** Drop hop-by-hop headers when forwarding. */
function forwardHeaders(raw) {
  const skip = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
  ]);
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!skip.has(k.toLowerCase())) {
      out[k] = v;
    }
  }
  return out;
}

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      const url = req.url ?? "";
      if (!url.startsWith("/api-proxy")) {
        return middleware(req, res, next);
      }

      const backend = parseTarget();
      const suffix = url.slice("/api-proxy".length) || "/";
      const opts = {
        protocol: backend.protocol,
        hostname: backend.hostname,
        port: backend.port || (backend.protocol === "https:" ? 443 : 80),
        path: suffix,
        method: req.method,
        headers: forwardHeaders(req.headers),
      };

      const proxyReq = http.request(opts, (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on("error", (err) => {
        if (!res.headersSent) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
        }
        res.end(
          JSON.stringify({
            error: "API proxy: backend unreachable",
            message: err.message,
            hint: "Start the API with node index.js (port 3000) on this machine.",
          }),
        );
      });

      req.pipe(proxyReq);
    };
  },
};

module.exports = config;
