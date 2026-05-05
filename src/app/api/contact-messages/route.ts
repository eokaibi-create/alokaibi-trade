import { NextRequest, NextResponse } from "next/server";
import { getDb, uuid, now, parseBody } from "@/lib/db";
import { verifyToken, getAdminToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const result = await db.execute(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message required" }, { status: 400 });
    }

    const id = uuid();
    const t = now();
    const db = getDb();

    await db.execute(
      "INSERT INTO contact_messages (id, name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, name, email, phone || "", subject || "", message, t]
    );

    // Auto-create customer
    const existing = await db.execute("SELECT id FROM customers WHERE email = ?", [email]);
    if (existing.rows.length === 0) {
      await db.execute(
        "INSERT INTO customers (id, name, email, phone, source, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [uuid(), name, email, phone || "", "contact", subject || "", t, t]
      );
    }

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
    const db = getDb();
    await db.execute("UPDATE contact_messages SET status=? WHERE id=?", [body.status || "pending", body.id]);
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
    await db.execute("DELETE FROM contact_messages WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
