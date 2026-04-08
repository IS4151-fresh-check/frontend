import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

function isLoopbackHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    h === "::1"
  );
}

/** Metro bundle URL, e.g. http://192.168.1.10:8081/... — reliable on real devices. */
function getPackagerScriptUrl(): string | undefined {
  try {
    // TurboModule path (matches RN getDevServer)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NativeSourceCode = require("react-native/Libraries/NativeModules/specs/NativeSourceCode")
      .default as {
      getConstants: () => { scriptURL?: string };
    };
    const url = NativeSourceCode.getConstants().scriptURL;
    if (typeof url === "string" && url.length > 0) {
      return url;
    }
  } catch {
    /* fall through */
  }
  try {
    const url = (NativeModules as { SourceCode?: { scriptURL?: string } })
      .SourceCode?.scriptURL;
    if (typeof url === "string" && url.length > 0) {
      return url;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function hostFromHttpUrl(url: string): string | undefined {
  const m = url.match(/^https?:\/\/([^/:]+)/i);
  const host = m?.[1]?.trim();
  if (host === undefined || host === "") {
    return undefined;
  }
  return host;
}

/** Expo manifest host (often localhost:8081 — wrong for API on a physical phone). */
function expoManifestHost(): string | undefined {
  const uri = Constants.expoConfig?.hostUri;
  if (typeof uri !== "string" || uri.length === 0) {
    return undefined;
  }
  const host = uri.split(":")[0]?.trim();
  if (host === undefined || host === "") {
    return undefined;
  }
  return host;
}

/** Prefer LAN IP from the JS bundle URL; never trust localhost alone on Android. */
function firstDevApiHost(): string | undefined {
  const fromScript = getPackagerScriptUrl();
  const hScript = fromScript !== undefined ? hostFromHttpUrl(fromScript) : undefined;
  const hExpo = expoManifestHost();

  const candidates = [hScript, hExpo].filter(
    (h): h is string => h !== undefined && h !== "",
  );

  for (const h of candidates) {
    if (!isLoopbackHost(h)) {
      return h;
    }
  }

  return undefined;
}

function firstLoopbackDevHost(): string | undefined {
  const fromScript = getPackagerScriptUrl();
  const hScript = fromScript !== undefined ? hostFromHttpUrl(fromScript) : undefined;
  if (hScript !== undefined && isLoopbackHost(hScript)) {
    return hScript;
  }
  const hExpo = expoManifestHost();
  if (hExpo !== undefined && isLoopbackHost(hExpo)) {
    return hExpo;
  }
  return undefined;
}

/** e.g. http://192.168.1.10:8081 — Metro, which proxies /api-proxy → API (see metro.config.js). */
function packagerOrigin(): string | undefined {
  const script = getPackagerScriptUrl();
  if (script === undefined) {
    return undefined;
  }
  try {
    const u = new URL(script);
    return `${u.protocol}//${u.host}`;
  } catch {
    return undefined;
  }
}

/**
 * Base URL for the Node backend (routes mounted at /api).
 * Override with EXPO_PUBLIC_API_BASE_URL when needed (e.g. staging server).
 */
export function getApiBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof env === "string" && env.trim() !== "") {
    return env.replace(/\/$/, "");
  }

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      if (__DEV__) {
        // Expo web is served from the same dev server (e.g. :8081). Calling :3000 directly is
        // cross-origin and often fails in the browser; Metro proxies /api-proxy → API.
        return `${window.location.origin.replace(/\/$/, "")}/api-proxy/api`;
      }
      const { hostname } = window.location;
      if (hostname !== "" && !isLoopbackHost(hostname)) {
        return `http://${hostname}:3000/api`;
      }
    }
    return "http://localhost:3000/api";
  }

  if (__DEV__) {
    const origin = packagerOrigin();
    if (origin !== undefined) {
      // Same host:port as Metro; avoids Windows Firewall blocking direct :3000 from the phone.
      return `${origin}/api-proxy/api`;
    }
    const lan = firstDevApiHost();
    if (lan !== undefined) {
      return `http://${lan}:3000/api`;
    }
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000/api";
    }
    const loop = firstLoopbackDevHost();
    if (loop !== undefined) {
      return `http://${loop}:3000/api`;
    }
  }

  return "http://localhost:3000/api";
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  try {
    return await fetch(url, init);
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    throw new Error(
      `${reason} — tried ${url}. Run the API (node index.js on port 3000), allow it through the firewall, or set EXPO_PUBLIC_API_BASE_URL.`,
    );
  }
}

export type ApiSectionStage =
  | "pending"
  | "fresh"
  | "ripe"
  | "overripe"
  | "spoiled";

export type ApiSection = {
  _id: string;
  name: string;
  location: string;
  arrivedAt: string;
  daysToNextStage?: number;
  ppm?: number;
  humidity?: number;
  temperature?: number;
  currentStage: ApiSectionStage;
  discountPercentage?: number;
};

export type ApiAlert = {
  _id: string;
  sectionId:
    | string
    | {
        _id: string;
        name: string;
        location: string;
      };
  title: string;
  message: string;
  type: "critical" | "info" | "warning";
  status: "active" | "resolved";
  createdAt?: string;
};

export type ApiReading = {
  _id: string;
  sectionId: string;
  humidity: number;
  temperature: number;
  ppm: number;
  ppmSlope: number;
  gasStage: string;
  gasConfidence: number;
  action: string;
  cvStage: string;
  cvConfidence: number;
  createdAt?: string;
  updatedAt?: string;
};

function snippet(text: string, max = 120): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

async function parseJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();
  let data: unknown = null;
  if (text.length === 0) {
    if (!res.ok) {
      throw new Error(res.statusText || `HTTP ${res.status}`);
    }
    throw new Error("Empty response from server (expected JSON)");
  }
  try {
    data = JSON.parse(text);
  } catch {
    const looksHtml = text.trimStart().toLowerCase().startsWith("<");
    throw new Error(
      looksHtml
        ? `Server returned HTML (${res.status}) — check API URL / Metro proxy. ${snippet(text)}`
        : `Invalid JSON from server (${contentType || "no content-type"}): ${snippet(text)}`,
    );
  }
  if (!res.ok) {
    const err =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof (data as { message: unknown }).message === "string"
          ? (data as { message: string }).message
          : res.statusText;
    throw new Error(err);
  }
  return data as T;
}

export async function fetchSections(): Promise<ApiSection[]> {
  const res = await apiFetch("/section");
  return parseJson<ApiSection[]>(res);
}

export async function fetchSectionById(
  sectionId: string,
): Promise<ApiSection> {
  const res = await apiFetch(`/section/${encodeURIComponent(sectionId)}`);
  return parseJson<ApiSection>(res);
}

export async function fetchActiveAlerts(): Promise<ApiAlert[]> {
  const res = await apiFetch("/alert");
  return parseJson<ApiAlert[]>(res);
}

export async function resolveAlert(alertId: string): Promise<void> {
  const res = await apiFetch(`/alert/${encodeURIComponent(alertId)}`, {
    method: "PATCH",
  });
  await parseJson<unknown>(res);
}

export async function fetchReadingsForSection(
  sectionId: string,
  limit = 20,
): Promise<ApiReading[]> {
  const q = new URLSearchParams({
    sectionId,
    limit: String(limit),
  });
  const res = await apiFetch(`/reading?${q.toString()}`);
  return parseJson<ApiReading[]>(res);
}
