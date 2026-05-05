import { getTranslations } from "@/lib/translations";
import { getServerSettings } from "@/lib/server-settings";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  image_url: string;
  description: string;
  is_external: boolean;
  external_url: string;
  sort_order: number;
}

async function getCategories(): Promise<Category[]> {
  try {
    const { createClient } = await import("@libsql/client");
    const db = createClient({
      url: process.env.TURSO_DB_URL!,
      authToken: process.env.TURSO_DB_TOKEN!,
    });
    const result = await db.execute("SELECT * FROM categories ORDER BY sort_order ASC");
    db.close();
    return result.rows.map((r: any) => ({
      id: r.id, name: r.name, slug: r.slug,
      icon: r.icon || "📦", sort_order: r.sort_order || 0,
    }));
  } catch { return []; }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { createClient } = await import("@libsql/client");
    const db = createClient({
      url: process.env.TURSO_DB_URL!,
      authToken: process.env.TURSO_DB_TOKEN!,
    });
    const result = await db.execute("SELECT * FROM products ORDER BY sort_order ASC LIMIT 8");
    db.close();
    return result.rows.map((r: any) => ({
      id: r.id, name: r.name, slug: r.slug, category_id: r.category_id,
      image_url: r.image_url || "", description: r.description || "",
      is_external: !!r.is_external, external_url: r.external_url || "", sort_order: r.sort_order || 0,
    }));
  } catch { return []; }
}

function parseName(raw: string): { en: string; zh: string } {
  try { return JSON.parse(raw); }
  catch { return { en: raw, zh: raw }; }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getTranslations(locale);
  const settings = await getServerSettings();
  const categories = await getCategories();
  const featured = await getFeaturedProducts();
  const isZh = locale === "zh";

  // Dynamic hero content from settings
  const heroTitle = isZh && settings.hero_title_zh ? settings.hero_title_zh : (settings.hero_title_en || t.home.hero.title);
  const heroSubtitle = isZh && settings.hero_subtitle_zh ? settings.hero_subtitle_zh : (settings.hero_subtitle_en || t.home.hero.subtitle);
  const heroCta = isZh && settings.hero_cta_zh ? settings.hero_cta_zh : (settings.hero_cta_en || t.home.hero.cta);

  const categoryEmojis: Record<string, string> = {
    electronics: "📱", autoparts: "🚗", furniture: "🪑",
    textiles: "👕", vaporx: "💨",
  };

  return (
    <>
      {/* Hero Section — Dynamic from DB */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 mb-8 leading-relaxed">
              {heroSubtitle}
            </p>
            <a
              href={`/${locale}/products`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition shadow-lg shadow-blue-900/20"
            >
              {heroCta}
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t.home.categories}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t.home.categories_desc}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const parsed = parseName(cat.name);
              const name = (parsed as any)[locale] || parsed.en;
              return (
                <a
                  key={cat.id}
                  href={`/${locale}/products?category=${cat.slug}`}
                  className="group bg-gray-50 hover:bg-blue-50 rounded-xl p-6 text-center transition-all border border-gray-100 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                    {categoryEmojis[cat.slug] || cat.icon || "📦"}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-sm">
                    {name}
                  </h3>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t.products.title}</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">{t.products.desc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => {
                const parsed = parseName(product.name);
                const name = (parsed as any)[locale] || parsed.en;
                return (
                  <a
                    key={product.id}
                    href={product.is_external ? product.external_url : `/${locale}/products/${product.slug}`}
                    target={product.is_external ? "_blank" : undefined}
                    rel={product.is_external ? "noopener noreferrer" : undefined}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group"
                  >
                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">
                      {product.image_url ? (
                        <img src={product.image_url} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-sm">{name}</h3>
                      {product.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Why Us Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t.home.why_us}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t.home.why_us_desc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(t.home.reasons as any[]).map((reason: any, i: number) => (
              <div key={i} className="text-center p-6 group">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-sm text-gray-500">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-4">{t.home.cta_section.title}</h2>
          <p className="text-blue-100/90 mb-8 max-w-xl mx-auto">{t.home.cta_section.desc}</p>
          <a
            href={`/${locale}/inquiry`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition shadow-lg"
          >
            {t.home.cta_section.button}
            <span>→</span>
          </a>
        </div>
      </section>
    </>
  );
}
