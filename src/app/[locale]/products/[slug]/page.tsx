import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";

async function getProduct(slug: string) {
  try {
    const { createClient } = await import("@libsql/client");
    const db = createClient({ url: process.env.TURSO_DB_URL!, authToken: process.env.TURSO_DB_TOKEN! });
    const result = await db.execute(
      "SELECT p.*, c.name as cat_name, c.slug as cat_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?",
      [slug]
    );
    db.close();
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return {
      id: r.id, name: String(r.name || ""), slug: String(r.slug || ""),
      description: String(r.description || ""), image_url: String(r.image_url || ""),
      category_id: String(r.category_id || ""), cat_name: String(r.cat_name || ""),
      cat_slug: String(r.cat_slug || ""), sort_order: Number(r.sort_order || 0),
    };
  } catch { return null; }
}

function parseName(raw: string) { try { return JSON.parse(raw); } catch { return { en: raw, zh: raw }; } }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const parsed = parseName(product.name);
  const name = (parsed as any)[locale] || parsed.en || product.name;

  return {
    title: name,
    description: product.description || `${name} - OKAIBI Products`,
    openGraph: { title: name, description: product.description || "" },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = getTranslations(locale);
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.products.not_found}</h1>
        <a href={`/${locale}/products`} className="text-blue-600 hover:underline">{t.products.back}</a>
      </div>
    );
  }

  const parsed = parseName(product.name);
  const name = (parsed as any)[locale] || parsed.en || product.name;
  const catParsed = parseName(product.cat_name);
  const catName = (catParsed as any)[locale] || catParsed.en || "";
  const desc = product.description || "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <a href={`/${locale}/products`} className="text-sm text-blue-600 hover:underline mb-6 inline-block">&larr; {t.products.back}</a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-6xl overflow-hidden">
          {product.image_url
            ? <img src={product.image_url} alt={name} className="w-full h-full object-cover rounded-xl" />
            : "📦"}
        </div>
        <div>
          <p className="text-xs text-blue-600 font-medium mb-1">{catName}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{name}</h1>
          {desc && <p className="text-gray-600 mb-6 leading-relaxed">{desc}</p>}
          <a href={`/${locale}/inquiry?product=${encodeURIComponent(name)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md">
            {t.products.inquiry} <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
