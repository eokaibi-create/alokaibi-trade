import { getTranslations } from "@/lib/translations";

async function getBrands() {
  try {
    const { createClient } = await import("@libsql/client");
    const db = createClient({ url: process.env.TURSO_DB_URL!, authToken: process.env.TURSO_DB_TOKEN! });
    const result = await db.execute("SELECT * FROM brands ORDER BY sort_order ASC");
    db.close();
    return result.rows.map((r: any) => ({
      id: r.id, name: r.name, slug: r.slug, logo_url: r.logo_url || "",
      description: r.description || "", is_active: !!r.is_active,
      external_url: r.external_url || "", category_slug: r.category_slug || "",
    }));
  } catch { return []; }
}

export default async function BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getTranslations(locale);
  const brands = await getBrands();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.brands.title}</h1>
      <p className="text-gray-500 mb-8">{t.brands.desc}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brands.map((brand: any) => (
          <div key={brand.id} className={`bg-white rounded-xl shadow-sm p-6 ${!brand.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                {brand.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain rounded-lg" /> : "🏷️"}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{brand.name}</h3>
                {brand.description && <p className="text-sm text-gray-500 mt-1">{brand.description}</p>}
                <div className="mt-3">
                  {brand.is_active ? (
                    brand.external_url ? (
                      <a href={brand.external_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline font-medium">{t.brands.visit_site} →</a>
                    ) : (
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    )
                  ) : (
                    <span className="text-sm text-gray-400 italic">{t.brands.coming_soon}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {brands.length === 0 && <p className="text-center text-gray-400 py-12">{t.brands.coming_soon}</p>}
    </div>
  );
}
