import { createClient } from "@libsql/client";
import { randomBytes } from "crypto";
import { hashSync } from "bcryptjs";

const db = createClient({
  url: process.env.TURSO_DB_URL || "libsql://okaibi-cms-ek12138.aws-ap-northeast-1.turso.io",
  authToken: process.env.TURSO_DB_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc5MDE0MzYsImlkIjoiMDE5ZGYzMmMtMmEwMS03NGYxLThlYjQtNjQ0ZDdjMzg1MmYxIiwicmlkIjoiMWY0ZjBlMDMtMzBlYy00MjNhLTgxMTItM2NkMDNhMzljODFjIn0.hmNKOP518o88Mr6RAu9PMqsUZLM2mCoB8-t_7kbfKGV39Bj2DsovlkRxzc6tg6GaUPvStmWqy5LHJ5C8M9qzBQ"
});

// ─── Create tables ────────────────────────────────────────
const tables = [
  `CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id TEXT NOT NULL REFERENCES categories(id),
    description TEXT,
    image_url TEXT,
    is_external INTEGER DEFAULT 0,
    external_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    category_slug TEXT,
    is_active INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    product_name TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    quantity TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS inquiry_replies (
    id TEXT PRIMARY KEY,
    inquiry_id TEXT NOT NULL REFERENCES inquiries(id),
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    source TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`
];

for (const sql of tables) {
  await db.execute(sql);
}
console.log("✅ All 9 tables created");

// ─── Seed admin ────────────────────────────────────────────
const adminId = "admin-001";
const adminPass = "admin123";
const existingAdmins = await db.execute("SELECT id FROM admins WHERE id = ?", [adminId]);
if (existingAdmins.rows.length === 0) {
  await db.execute(
    "INSERT INTO admins (id, username, password_hash) VALUES (?, ?, ?)",
    [adminId, "admin", hashSync(adminPass, 10)]
  );
  console.log("✅ Admin created: admin / admin123");
} else {
  await db.execute(
    "UPDATE admins SET password_hash = ? WHERE id = ?",
    [hashSync(adminPass, 10), adminId]
  );
  console.log("✅ Admin password reset to: admin123");
}

// ─── Seed categories ──────────────────────────────────────
const cats = [
  { id: "cat-electronics",   name_en: "Consumer Electronics",     name_zh: "消费电子产品",       name_ar: "الإلكترونيات الاستهلاكية",    slug: "electronics",   icon: "📱", sort: 1 },
  { id: "cat-autoparts",     name_en: "Auto Parts & Accessories", name_zh: "汽车配件",           name_ar: "قطع غيار السيارات",           slug: "autoparts",     icon: "🚗", sort: 2 },
  { id: "cat-furniture",     name_en: "Furniture & Building Materials", name_zh: "家具与建材",  name_ar: "الأثاث ومواد البناء",         slug: "furniture",     icon: "🪑", sort: 3 },
  { id: "cat-textiles",      name_en: "Textiles & Apparel",       name_zh: "纺织品与服装",       name_ar: "المنسوجات والملابس",            slug: "textiles",      icon: "👕", sort: 4 },
  { id: "cat-vaporx",        name_en: "VAPORX — Hookah, Shisha & Vaping", name_zh: "VAPORX — 水烟与电子烟产品", name_ar: "VAPORX — الشيشة والفيب", slug: "vaporx", icon: "💨", sort: 5 }
];
for (const c of cats) {
  const existing = await db.execute("SELECT id FROM categories WHERE id = ?", [c.id]);
  if (existing.rows.length === 0) {
    await db.execute(
      "INSERT INTO categories (id, name, slug, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      [c.id, JSON.stringify({en: c.name_en, zh: c.name_zh, ar: c.name_ar}), c.slug, "", c.icon, c.sort]
    );
  }
}
console.log("✅ 5 categories seeded");

// ─── Seed products ────────────────────────────────────────
const products = [
  { id: "prod-elec-1",  name: {en:"Smart LED TV 55\" 4K",zh:"55寸4K智能LED电视",ar:"تلفاز LED ذكي 55 بوصة 4K"}, slug:"smart-led-tv-55", cat:"cat-electronics", sort:1, external:false, extUrl:"" },
  { id: "prod-elec-2",  name: {en:"Wireless Bluetooth Earphones",zh:"无线蓝牙耳机",ar:"سماعات بلوتوث لاسلكية"}, slug:"wireless-bt-earphones", cat:"cat-electronics", sort:2, external:false, extUrl:"" },
  { id: "prod-auto-1",  name: {en:"Alloy Wheel Rims 18\"",zh:"18寸合金轮毂",ar:"جنوط عجلات ألمنيوم 18 بوصة"}, slug:"alloy-wheel-rims-18", cat:"cat-autoparts", sort:1, external:false, extUrl:"" },
  { id: "prod-auto-2",  name: {en:"LED Car Headlights Kit",zh:"LED汽车大灯套件",ar:"طقم مصابيح أمامية LED للسيارة"}, slug:"led-car-headlights", cat:"cat-autoparts", sort:2, external:false, extUrl:"" },
  { id: "prod-furn-1",  name: {en:"Modern Office Desk",zh:"现代办公桌",ar:"مكتب حديث"}, slug:"modern-office-desk", cat:"cat-furniture", sort:1, external:false, extUrl:"" },
  { id: "prod-furn-2",  name: {en:"Ceramic Floor Tiles 60x60cm",zh:"60x60陶瓷地砖",ar:"بلاط سيراميك للأرضيات 60×60 سم"}, slug:"ceramic-floor-tiles-60x60", cat:"cat-furniture", sort:2, external:false, extUrl:"" },
  { id: "prod-text-1",  name: {en:"Cotton T-Shirts Bulk",zh:"纯棉T恤批发",ar:"تيشيرتات قطن بالجملة"}, slug:"cotton-tshirts-bulk", cat:"cat-textiles", sort:1, external:false, extUrl:"" },
  { id: "prod-text-2",  name: {en:"Denim Jeans Collection",zh:"牛仔长裤系列",ar:"مجموعة جينز دينم"}, slug:"denim-jeans-collection", cat:"cat-textiles", sort:2, external:false, extUrl:"" },
  { id: "prod-vap-1",   name: {en:"Premium Hookah Shisha",zh:"高级水烟壶",ar:"شيشة فاخرة"}, slug:"premium-hookah-shisha", cat:"cat-vaporx", sort:1, external:true, extUrl:"https://okaibiglobal.com" },
  { id: "prod-vap-2",   name: {en:"Disposable Vape Pen",zh:"一次性电子烟",ar:"قلم فيب يمكن التخلص منه"}, slug:"disposable-vape-pen", cat:"cat-vaporx", sort:2, external:true, extUrl:"https://okaibiglobal.com" },
];
for (const p of products) {
  const existing = await db.execute("SELECT id FROM products WHERE id = ?", [p.id]);
  if (existing.rows.length === 0) {
    await db.execute(
      "INSERT INTO products (id, name, slug, category_id, description, image_url, is_external, external_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [p.id, JSON.stringify(p.name), p.slug, p.cat, "", "", p.external ? 1 : 0, p.extUrl, p.sort]
    );
  }
}
console.log("✅ 10 products seeded");

// ─── Seed brands ──────────────────────────────────────────
const brands = [
  { id:"brand-vaporx",     name:{en:"VAPORX",zh:"VAPORX",ar:"VAPORX"},       slug:"vaporx",     desc:{en:"VAPORX — Premium Hookah, Shisha & Vaping",zh:"VAPORX — 高级水烟与电子烟产品",ar:"VAPORX — منتجات الشيشة والفيب الفاخرة"}, url:"https://okaibiglobal.com",    active:1, sort:1 },
  { id:"brand-eksnewlife", name:{en:"EK'S NEW LIFE",zh:"EK'S NEW LIFE",ar:"EK'S NEW LIFE"}, slug:"eks-new-life", desc:{en:"Coming Soon — A New Lifestyle Brand",zh:"即将推出 — 全新生活品牌",ar:"قريباً — علامة تجارية جديدة لأسلوب الحياة"}, url:"", active:0, sort:2 },
];
for (const b of brands) {
  const existing = await db.execute("SELECT id FROM brands WHERE id = ?", [b.id]);
  if (existing.rows.length === 0) {
    await db.execute(
      "INSERT INTO brands (id, name, slug, description, logo_url, website_url, category_slug, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [b.id, JSON.stringify(b.name), b.slug, JSON.stringify(b.desc), "", b.url, "", b.active, b.sort]
    );
  }
}
console.log("✅ 2 brands seeded");

// ─── Default settings ─────────────────────────────────────
const defaults = [
  ["site_title", "OKAIBI — Global Trading"],
  ["site_description", "Your trusted partner in global trade"],
  ["admin_password_hash", ""],
  ["contact_email", "info@okaibi.com"],
  ["whatsapp_number", "+861234567890"]
];
for (const [k, v] of defaults) {
  const existing = await db.execute("SELECT key FROM settings WHERE key = ?", [k]);
  if (existing.rows.length === 0) {
    await db.execute("INSERT INTO settings (key, value) VALUES (?, ?)", [k, v]);
  }
}
console.log("✅ Settings seeded");

await db.close();
console.log("\n🚀 Setup complete! Database is ready.");
