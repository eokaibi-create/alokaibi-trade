import { NextRequest, NextResponse } from "next/server";
import { getDb, parseBody } from "@/lib/db";
import { verifyToken, getAdminToken } from "@/lib/auth";

export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute(
      "SELECT * FROM brands ORDER BY sort_order ASC"
    );
    return NextResponse.json(result.rows);
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

    await db.execute(
      "UPDATE brands SET name=?, description=?, website_url=?, is_active=?, sort_order=?, updated_at=? WHERE id=?",
      [
        body.name,
        body.description || "",
        body.website_url || "",
        body.is_active ? 1 : 0,
        body.sort_order || 0,
        t,
        body.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
