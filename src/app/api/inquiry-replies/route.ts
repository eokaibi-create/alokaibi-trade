import { NextRequest, NextResponse } from "next/server";
import { getDb, uuid, now, parseBody } from "@/lib/db";
import { verifyToken, getAdminToken } from "@/lib/auth";
import { sendReplyNotification } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const inquiryId = searchParams.get("inquiry_id");
    if (!inquiryId) return NextResponse.json({ error: "Missing inquiry_id" }, { status: 400 });

    const db = getDb();
    const result = await db.execute(
      "SELECT * FROM inquiry_replies WHERE inquiry_id = ? ORDER BY created_at ASC",
      [inquiryId]
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
    const { inquiry_id, message } = body;
    if (!inquiry_id || !message)
      return NextResponse.json({ error: "inquiry_id and message required" }, { status: 400 });

    const id = uuid();
    const t = now();
    const db = getDb();

    await db.execute(
      "INSERT INTO inquiry_replies (id, inquiry_id, message, created_at) VALUES (?, ?, ?, ?)",
      [id, inquiry_id, message, t]
    );
    await db.execute("UPDATE inquiries SET status='replied' WHERE id=?", [inquiry_id]);

    // Send email notification to the inquirer
    const inquiry = await db.execute("SELECT name, email FROM inquiries WHERE id=?", [inquiry_id]);
    if (inquiry.rows.length > 0) {
      const row = inquiry.rows[0] as any;
      sendReplyNotification(row.name, row.email, message).catch(() => {});
    }

    return NextResponse.json({ id, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
