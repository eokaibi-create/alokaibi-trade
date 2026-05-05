import { getTranslations } from "@/lib/translations";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getTranslations(locale);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.about.title}</h1>
      <p className="text-lg text-gray-600 mb-8">{t.about.intro}</p>

      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">{t.about.mission.title}</h2>
        <p className="text-gray-600">{t.about.mission.desc}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.about.values.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(t.about.values.items as any[]).map((item: any, i: number) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <a href={`/${locale}/contact`} className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          {t.about.contact_cta}
        </a>
      </div>
    </div>
  );
}
