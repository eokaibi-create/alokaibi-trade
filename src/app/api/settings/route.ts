import { NextRequest, NextResponse } from "next/server";
import { getDb, parseBody } from "@/lib/db";
import { verifyToken, getAdminToken, hashPassword } from "@/lib/auth";
import { invalidateCache } from "@/lib/settings";

export async function GET() {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const result = await db.execute("SELECT * FROM settings");
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key as string] = row.value as string;
    }
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await parseBody(req);
    const db = getDb();
    const t = new Date().toISOString().replace("T", " ").split(".")[0];

    for (const [key, value] of Object.entries(body)) {
      if (key === "new_password" && value) {
        const hash = hashPassword(value as string);
        await db.execute(
          "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
          ["admin_password_hash", hash, t]
        );
      } else if (key !== "_new_password" && key !== "_confirm_password") {
        await db.execute(
          "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
          [key, String(value), t]
        );
      }
    }

    // Invalidate the site settings cache so frontend reads fresh data
    invalidateCache();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
