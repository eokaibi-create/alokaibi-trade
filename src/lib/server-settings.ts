import { getSiteSettings } from "./settings";

export async function getServerSettings() {
  try {
    const { createClient } = await import("@libsql/client");
    const db = createClient({
      url: process.env.TURSO_DB_URL!,
      authToken: process.env.TURSO_DB_TOKEN!,
    });
    const result = await db.execute("SELECT key, value FROM settings");
    const raw: Record<string, string> = {};
    for (const row of result.rows) {
      raw[row.key as string] = row.value as string;
    }
    db.close();
    return raw;
  } catch {
    return {} as Record<string, string>;
  }
}
