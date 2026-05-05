import { NextRequest, NextResponse } from "next/server";
import { getDb, uuid, now, parseBody } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAdminToken } from "@/lib/auth";

export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute(
      "SELECT * FROM categories ORDER BY sort_order ASC"
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await parseBody(req);
    const id = uuid();
    const t = now();
    const db = getDb();

    await db.execute(
      "INSERT INTO categories (id, name, slug, description, icon, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        body.name || JSON.stringify({ en: "", zh: "", ar: "" }),
        body.slug || "",
        body.description || "",
        body.icon || "",
        body.sort_order || 0,
        t,
        t,
      ]
    );

    return NextResponse.json({ id, success: true });
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
    const t = now();
    const db = getDb();

    await db.execute(
      "UPDATE categories SET name=?, slug=?, description=?, icon=?, sort_order=?, updated_at=? WHERE id=?",
      [
        body.name,
        body.slug,
        body.description || "",
        body.icon || "",
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

export async function DELETE(req: NextRequest) {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const db = getDb();
    await db.execute("DELETE FROM categories WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
