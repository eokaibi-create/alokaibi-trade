import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DB_URL || "libsql://okaibi-cms-ek12138.aws-ap-northeast-1.turso.io",
  authToken: process.env.TURSO_DB_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc5MDE0MzYsImlkIjoiMDE5ZGYzMmMtMmEwMS03NGYxLThlYjQtNjQ0ZDdjMzg1MmYxIiwicmlkIjoiMWY0ZjBlMDMtMzBlYy00MjNhLTgxMTItM2NkMDNhMzljODFjIn0.hmNKOP518o88Mr6RAu9PMqsUZLM2mCoB8-t_7kbfKGV39Bj2DsovlkRxzc6tg6GaUPvStmWqy5LHJ5C8M9qzBQ"
});

const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log("Tables:", tables.rows.map(r => r.name).join(", "));

const counts = await db.execute(`
  SELECT 'admins' as t, COUNT(*) as c FROM admins
  UNION ALL SELECT 'categories', COUNT(*) FROM categories
  UNION ALL SELECT 'products', COUNT(*) FROM products
  UNION ALL SELECT 'brands', COUNT(*) FROM brands
  UNION ALL SELECT 'inquiries', COUNT(*) FROM inquiries
  UNION ALL SELECT 'inquiry_replies', COUNT(*) FROM inquiry_replies
  UNION ALL SELECT 'contact_messages', COUNT(*) FROM contact_messages
  UNION ALL SELECT 'settings', COUNT(*) FROM settings
`);
counts.rows.forEach(r => console.log(`  ${r.t}: ${r.c} rows`));

db.close();
