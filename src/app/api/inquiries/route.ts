import { NextRequest, NextResponse } from "next/server";
import { getDb, uuid, now, parseBody } from "@/lib/db";
import { verifyToken, getAdminToken } from "@/lib/auth";
import { sendInquiryNotification } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const db = getDb();

    if (id) {
      const result = await db.execute("SELECT * FROM inquiries WHERE id = ?", [id]);
      const replies = await db.execute(
        "SELECT * FROM inquiry_replies WHERE inquiry_id = ? ORDER BY created_at ASC",
        [id]
      );
      return NextResponse.json({ inquiry: result.rows[0] || null, replies: replies.rows });
    }

    const result = await db.execute("SELECT * FROM inquiries ORDER BY created_at DESC");
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    const { category, product_name, name, email, phone, company, quantity, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message required" }, { status: 400 });
    }

    const id = uuid();
    const t = now();
    const db = getDb();

    await db.execute(
      "INSERT INTO inquiries (id, category, product_name, name, email, phone, company, quantity, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, category || "", product_name || "", name, email, phone || "", company || "", quantity || "", message, t]
    );

    // Auto-create customer
    const existing = await db.execute("SELECT id FROM customers WHERE email = ?", [email]);
    if (existing.rows.length === 0) {
      await db.execute(
        "INSERT INTO customers (id, name, email, phone, company, source, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [uuid(), name, email, phone || "", company || "", "inquiry", category || "", t, t]
      );
    }

    // Send email notification (fire-and-forget)
    sendInquiryNotification({ name, email, phone, company, category, product_name, quantity, message }).catch(() => {});

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
    await db.execute("UPDATE inquiries SET status=? WHERE id=?", [body.status || "pending", body.id]);
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
    await db.execute("DELETE FROM inquiry_replies WHERE inquiry_id = ?", [id]);
    await db.execute("DELETE FROM inquiries WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
