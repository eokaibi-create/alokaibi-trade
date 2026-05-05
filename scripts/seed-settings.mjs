import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DB_URL || "libsql://okaibi-cms-ek12138.aws-ap-northeast-1.turso.io",
  authToken: process.env.TURSO_DB_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc5MDE0MzYsImlkIjoiMDE5ZGYzMmMtMmEwMS03NGYxLThlYjQtNjQ0ZDdjMzg1MmYxIiwicmlkIjoiMWY0ZjBlMDMtMzBlYy00MjNhLTgxMTItM2NkMDNhMzljODFjIn0.hmNKOP518o88Mr6RAu9PMqsUZLM2mCoB8-t_7kbfKGV39Bj2DsovlkRxzc6tg6GaUPvStmWqy5LHJ5C8M9qzBQ"
});

const defaults = [
  ["site_name", "OKAIBI — Global Trading"],
  ["site_tagline", "Your trusted partner in global trade"],
  ["site_logo", ""],
  ["site_favicon", ""],
  ["site_description", "Your trusted partner in global trade since 2024."],
  ["site_keywords", "global trading, import, export, wholesale, B2B, sourcing"],
  ["hero_title_en", "Your Trusted Partner in Global Trade"],
  ["hero_title_zh", "您值得信赖的全球贸易伙伴"],
  ["hero_subtitle_en", "Connecting quality manufacturers with global buyers across consumer electronics, automotive parts, furniture, textiles, and vapor products."],
  ["hero_subtitle_zh", "连接优质制造商与全球买家，涵盖消费电子、汽车配件、家具建材、纺织品和蒸汽产品。"],
  ["hero_cta_en", "Explore Products"],
  ["hero_cta_zh", "浏览产品"],
  ["contact_email", "info@okaibiglobal.com"],
  ["contact_phone", "+86-571-8888-8888"],
  ["contact_address_en", "Hangzhou, Zhejiang Province, China"],
  ["contact_address_zh", "中国浙江省杭州市"],
  ["whatsapp_number", "+861234567890"],
  ["footer_tagline_en", "Your trusted partner in global trade since 2024."],
  ["footer_tagline_zh", "您自2024年以来值得信赖的全球贸易伙伴。"],
  ["footer_copyright", "© 2024 OKAIBI. All rights reserved."],
  ["about_title_en", "About OKAIBI"],
  ["about_title_zh", "关于 OKAIBI"],
  ["about_intro_en", "OKAIBI is a global trading company dedicated to bridging the gap between quality manufacturers and international buyers."],
  ["about_intro_zh", "OKAIBI 是一家致力于连接优质制造商与国际买家的全球贸易公司。"],
  ["about_mission_title_en", "Our Mission"],
  ["about_mission_title_zh", "我们的使命"],
  ["about_mission_desc_en", "To simplify global trade by providing reliable sourcing, quality assurance, and seamless logistics to businesses worldwide."],
  ["about_mission_desc_zh", "通过提供可靠的采购、质量保证和无缝的物流，简化全球贸易。"],
  ["google_analytics_id", ""],
  ["google_tag_manager", ""],
  ["maintenance_mode", "0"],
];

const t = new Date().toISOString().replace("T", " ").split(".")[0];

for (const [k, v] of defaults) {
  const existing = await db.execute("SELECT key FROM settings WHERE key = ?", [k]);
  if (existing.rows.length === 0) {
    await db.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)", [k, v, t]);
    console.log(`➕ ${k} = ${v.substring(0, 50)}...`);
  } else {
    console.log(`✓ ${k} already exists`);
  }
}

console.log("\n✅ Settings seeded successfully!");
db.close();
