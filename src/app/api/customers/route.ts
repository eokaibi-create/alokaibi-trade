import { NextRequest, NextResponse } from "next/server";
import { getDb, parseBody } from "@/lib/db";
import { verifyToken, getAdminToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const result = await db.execute("SELECT * FROM customers ORDER BY created_at DESC");
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
      "UPDATE customers SET name=?, email=?, phone=?, company=?, notes=?, updated_at=? WHERE id=?",
      [body.name, body.email, body.phone || "", body.company || "", body.notes || "", t, body.id]
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const db = getDb();
    await db.execute("DELETE FROM customers WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
