import { getTranslations } from "@/lib/translations";

async function getData(search?: string) {
  try {
    const { createClient } = await import("@libsql/client");
    const db = createClient({ url: process.env.TURSO_DB_URL!, authToken: process.env.TURSO_DB_TOKEN! });
    const [catsRes, prodsRes] = await Promise.all([
      db.execute("SELECT * FROM categories ORDER BY sort_order ASC"),
      search
        ? db.execute("SELECT * FROM products WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? ORDER BY sort_order ASC", [`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`])
        : db.execute("SELECT * FROM products ORDER BY sort_order ASC"),
    ]);
    db.close();
    const categories = catsRes.rows.map((r: any) => ({ id: String(r.id), name: String(r.name || ""), slug: String(r.slug || ""), icon: String(r.icon || "📦") }));
    const products = prodsRes.rows.map((r: any) => ({ id: String(r.id), name: String(r.name || ""), slug: String(r.slug || ""), category_id: String(r.category_id || ""), image_url: String(r.image_url || ""), description: String(r.description || ""), is_external: !!r.is_external, external_url: String(r.external_url || ""), sort_order: Number(r.sort_order || 0) }));
    return { categories, products };
  } catch { return { categories: [], products: [] }; }
}

function parseName(raw: string) { try { return JSON.parse(raw); } catch { return { en: raw, zh: raw }; } }

export default async function ProductsPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ category?: string; q?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = getTranslations(locale);
  const searchQuery = sp.q || "";
  const { categories, products } = await getData(searchQuery || undefined);
  const activeCat = sp.category || "";

  let filtered = products;
  if (activeCat) {
    const catId = categories.find((c: any) => c.slug === activeCat)?.id;
    if (catId) filtered = filtered.filter((p: any) => p.category_id === catId);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.products.title}</h1>
      <p className="text-gray-500 mb-6">{t.products.desc}</p>

      {/* Search Bar */}
      <form method="GET" action={`/${locale}/products`} className="mb-6">
        <div className="flex gap-2 max-w-xl">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder={locale === "zh" ? "搜索产品..." : "Search products..."}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button type="submit"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition">
            {locale === "zh" ? "搜索" : "Search"}
          </button>
        </div>
      </form>

      {/* Category Pills */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2 mb-8">
          <a href={`/${locale}/products`} className={`px-4 py-2 rounded-full text-sm transition ${!activeCat ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.products.all_categories}</a>
          {categories.map((cat: any) => {
            const parsed = parseName(cat.name);
            const name = (parsed as any)[locale] || parsed.en;
            return (
              <a key={cat.id} href={`/${locale}/products?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm transition ${activeCat === cat.slug ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat.icon} {name}
              </a>
            );
          })}
        </div>
      )}

      {/* Search result info */}
      {searchQuery && (
        <p className="text-sm text-gray-500 mb-4">
          {locale === "zh" ? `搜索 "${searchQuery}" 找到 ${filtered.length} 个结果` : `Found ${filtered.length} results for "${searchQuery}"`}
        </p>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((product: any) => {
          const parsed = parseName(product.name);
          const name = (parsed as any)[locale] || parsed.en;
          return (
            <a key={product.id} href={product.is_external ? product.external_url : `/${locale}/products/${product.slug}`}
              target={product.is_external ? "_blank" : undefined}
              rel={product.is_external ? "noopener noreferrer" : undefined}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group border border-gray-100">
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">
                {product.image_url ? <img src={product.image_url} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : "📦"}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-sm">{name}</h3>
                {product.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>}
              </div>
            </a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-400">{searchQuery ? (locale === "zh" ? "未找到相关产品" : "No products found") : t.products.not_found}</p>
        </div>
      )}
    </div>
  );
}
