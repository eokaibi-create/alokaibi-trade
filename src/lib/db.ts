import { createClient } from "@libsql/client";
import type { IncomingMessage } from "http";

let db: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!db) {
    db = createClient({
      url: process.env.TURSO_DB_URL!,
      authToken: process.env.TURSO_DB_TOKEN!,
    });
  }
  return db;
}

// ─── Helpers ──────────────────────────────────
export function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function now() {
  return new Date().toISOString().replace("T", " ").split(".")[0];
}

export function jsonParseSafe(str: string | null | undefined, fallback: any = "") {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

// ─── Request body parser ───────────────────────
export function parseBody(req: Request): Promise<any> {
  return req.json().catch(() => ({}));
}
