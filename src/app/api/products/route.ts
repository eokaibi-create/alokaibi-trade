import { NextRequest, NextResponse } from "next/server";
import { getDb, uuid, now, parseBody } from "@/lib/db";
import { verifyToken, getAdminToken } from "@/lib/auth";

export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute(
      "SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.sort_order ASC"
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
      "INSERT INTO products (id, name, slug, category_id, description, image_url, is_external, external_url, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        body.name || JSON.stringify({ en: "", zh: "", ar: "" }),
        body.slug || "",
        body.category_id || "",
        body.description || "",
        body.image_url || "",
        body.is_external ? 1 : 0,
        body.external_url || "",
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
      "UPDATE products SET name=?, slug=?, category_id=?, description=?, image_url=?, is_external=?, external_url=?, sort_order=?, updated_at=? WHERE id=?",
      [
        body.name,
        body.slug,
        body.category_id,
        body.description || "",
        body.image_url || "",
        body.is_external ? 1 : 0,
        body.external_url || "",
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
    await db.execute("DELETE FROM products WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
