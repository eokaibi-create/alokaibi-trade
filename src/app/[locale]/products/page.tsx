import { getTranslations } from "@/lib/translations";

async function getData() {
  try {
    const { createClient } = await import("@libsql/client");
    const db = createClient({ url: process.env.TURSO_DB_URL!, authToken: process.env.TURSO_DB_TOKEN! });
    const [catsRes, prodsRes] = await Promise.all([
      db.execute("SELECT * FROM categories ORDER BY sort_order ASC"),
      db.execute("SELECT * FROM products ORDER BY sort_order ASC"),
    ]);
    db.close();
    const categories = catsRes.rows.map((r: any) => ({ id: String(r.id), name: String(r.name || ""), slug: String(r.slug || ""), icon: String(r.icon || "📦") }));
    const products = prodsRes.rows.map((r: any) => ({ id: String(r.id), name: String(r.name || ""), slug: String(r.slug || ""), category_id: String(r.category_id || ""), image_url: String(r.image_url || ""), description: String(r.description || ""), is_external: !!r.is_external, external_url: String(r.external_url || ""), sort_order: Number(r.sort_order || 0) }));
    return { categories, products };
  } catch { return { categories: [], products: [] }; }
}

function parseName(raw: string) { try { return JSON.parse(raw); } catch { return { en: raw, zh: raw }; } }

export default async function ProductsPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ category?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = getTranslations(locale);
  const { categories, products } = await getData();
  const activeCat = sp.category || "";

  const filtered = activeCat ? products.filter((p: any) => p.category_id === categories.find((c: any) => c.slug === activeCat)?.id) : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.products.title}</h1>
      <p className="text-gray-500 mb-8">{t.products.desc}</p>

      <div className="flex flex-wrap gap-2 mb-8">
        <a href={`/${locale}/products`} className={`px-4 py-2 rounded-full text-sm ${!activeCat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.products.all_categories}</a>
        {categories.map((cat: any) => {
          const parsed = parseName(cat.name);
          const name = (parsed as any)[locale] || parsed.en;
          return (
            <a key={cat.id} href={`/${locale}/products?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm ${activeCat === cat.slug ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat.icon} {name}
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((product: any) => {
          const parsed = parseName(product.name);
          const name = (parsed as any)[locale] || parsed.en;
          return (
            <a key={product.id} href={product.is_external ? product.external_url : `/${locale}/products/${product.slug}`}
              target={product.is_external ? "_blank" : undefined}
              rel={product.is_external ? "noopener noreferrer" : undefined}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group">
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">
                {product.image_url ? <img src={product.image_url} alt={name} className="w-full h-full object-cover" /> : "📦"}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-sm">{name}</h3>
                {product.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>}
              </div>
            </a>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="text-center text-gray-400 py-12">{t.products.not_found}</p>}
    </div>
  );
}
