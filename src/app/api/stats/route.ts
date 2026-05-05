import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, getAdminToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [
      products, categories, inquiries, pendingInquiries,
      contacts, pendingContacts, customers,
    ] = await Promise.all([
      db.execute("SELECT COUNT(*) as c FROM products"),
      db.execute("SELECT COUNT(*) as c FROM categories"),
      db.execute("SELECT COUNT(*) as c FROM inquiries"),
      db.execute("SELECT COUNT(*) as c FROM inquiries WHERE status='pending'"),
      db.execute("SELECT COUNT(*) as c FROM contact_messages"),
      db.execute("SELECT COUNT(*) as c FROM contact_messages WHERE status='pending'"),
      db.execute("SELECT COUNT(*) as c FROM customers"),
    ]);

    return NextResponse.json({
      products: products.rows[0].c,
      categories: categories.rows[0].c,
      inquiries: inquiries.rows[0].c,
      pending_inquiries: pendingInquiries.rows[0].c,
      contacts: contacts.rows[0].c,
      pending_contacts: pendingContacts.rows[0].c,
      customers: customers.rows[0].c,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
