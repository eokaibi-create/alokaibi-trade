import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, getAdminToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = await getAdminToken();
    if (!token || !verifyToken(token))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();

    // Parallel queries for performance
    const [
      products, categories, inquiries, pendingInquiries,
      contacts, pendingContacts, customers, brands,
    ] = await Promise.all([
      db.execute("SELECT COUNT(*) as c FROM products"),
      db.execute("SELECT COUNT(*) as c FROM categories"),
      db.execute("SELECT COUNT(*) as c FROM inquiries"),
      db.execute("SELECT COUNT(*) as c FROM inquiries WHERE status='pending'"),
      db.execute("SELECT COUNT(*) as c FROM contact_messages"),
      db.execute("SELECT COUNT(*) as c FROM contact_messages WHERE status='pending'"),
      db.execute("SELECT COUNT(*) as c FROM customers"),
      db.execute("SELECT COUNT(*) as c FROM brands"),
    ]);

    // ── Category distribution ──
    const catDist = await db.execute(`
      SELECT c.name, c.slug, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name, c.slug
      ORDER BY count DESC
    `);

    // ── Monthly inquiry trends (last 12 months) ──
    const monthlyInquiries = await db.execute(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM inquiries
      WHERE created_at >= date('now', '-12 months')
      GROUP BY month
      ORDER BY month ASC
    `);

    // ── Monthly contact trends (last 12 months) ──
    const monthlyContacts = await db.execute(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM contact_messages
      WHERE created_at >= date('now', '-12 months')
      GROUP BY month
      ORDER BY month ASC
    `);

    // ── Top inquiry categories ──
    const topCategories = await db.execute(`
      SELECT category, COUNT(*) as count
      FROM inquiries
      WHERE category != '' AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    `);

    // ── Recent 7 days activity ──
    const recentInquiries = await db.execute(`
      SELECT id, name, email, category, product_name, status, created_at
      FROM inquiries
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const recentContacts = await db.execute(`
      SELECT id, name, email, subject, status, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // ── Today's stats ──
    const today = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM inquiries WHERE date(created_at) = date('now')) as today_inquiries,
        (SELECT COUNT(*) FROM contact_messages WHERE date(created_at) = date('now')) as today_contacts
    `);

    // ── Status breakdown ──
    const inquiryStatus = await db.execute(`
      SELECT status, COUNT(*) as count
      FROM inquiries
      GROUP BY status
    `);

    const contactStatus = await db.execute(`
      SELECT status, COUNT(*) as count
      FROM contact_messages
      GROUP BY status
    `);

    // ── Products by category ──
    const productsByCat = await db.execute(`
      SELECT c.name, c.slug, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name, c.slug
      ORDER BY count DESC
    `);

    // Parse JSON name fields
    const parseName = (val: any): string => {
      if (!val) return "Uncategorized";
      try { const p = JSON.parse(val); return p.en || p.zh || val; }
      catch { return String(val); }
    };

    return NextResponse.json({
      // Counts
      products: Number(products.rows[0].c),
      categories: Number(categories.rows[0].c),
      inquiries: Number(inquiries.rows[0].c),
      pending_inquiries: Number(pendingInquiries.rows[0].c),
      contacts: Number(contacts.rows[0].c),
      pending_contacts: Number(pendingContacts.rows[0].c),
      customers: Number(customers.rows[0].c),
      brands: Number(brands.rows[0].c),

      // Today
      today_inquiries: Number(today.rows[0].today_inquiries),
      today_contacts: Number(today.rows[0].today_contacts),

      // Breakdowns
      category_distribution: catDist.rows.map((r: any) => ({
        name: parseName(r.name),
        slug: r.slug,
        count: Number(r.count),
      })),
      products_by_category: productsByCat.rows.map((r: any) => ({
        name: parseName(r.name),
        slug: r.slug,
        count: Number(r.count),
      })),

      // Trends
      monthly_inquiries: monthlyInquiries.rows.map((r: any) => ({
        month: r.month,
        count: Number(r.count),
      })),
      monthly_contacts: monthlyContacts.rows.map((r: any) => ({
        month: r.month,
        count: Number(r.count),
      })),

      // Top
      top_inquiry_categories: topCategories.rows.map((r: any) => ({
        category: r.category,
        count: Number(r.count),
      })),

      // Status
      inquiry_status: inquiryStatus.rows.map((r: any) => ({
        status: r.status,
        count: Number(r.count),
      })),
      contact_status: contactStatus.rows.map((r: any) => ({
        status: r.status,
        count: Number(r.count),
      })),

      // Recent
      recent_inquiries: recentInquiries.rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        category: r.category,
        product_name: r.product_name,
        status: r.status,
        created_at: r.created_at,
      })),
      recent_contacts: recentContacts.rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        subject: r.subject,
        status: r.status,
        created_at: r.created_at,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
