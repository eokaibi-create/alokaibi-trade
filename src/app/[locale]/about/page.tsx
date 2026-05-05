import { getTranslations } from "@/lib/translations";
import { getServerSettings } from "@/lib/server-settings";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getTranslations(locale);
  const settings = await getServerSettings();
  const isZh = locale === "zh";

  const title = isZh && settings.about_title_zh ? settings.about_title_zh : (settings.about_title_en || t.about.title);
  const intro = isZh && settings.about_intro_zh ? settings.about_intro_zh : (settings.about_intro_en || t.about.intro);
  const missionTitle = isZh && settings.about_mission_title_zh ? settings.about_mission_title_zh : (settings.about_mission_title_en || t.about.mission.title);
  const missionDesc = isZh && settings.about_mission_desc_zh ? settings.about_mission_desc_zh : (settings.about_mission_desc_en || t.about.mission.desc);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">{intro}</p>

      <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3">{missionTitle}</h2>
        <p className="text-gray-600 leading-relaxed">{missionDesc}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
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
        <a href={`/${locale}/contact`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md">
          {t.about.contact_cta} <span>→</span>
        </a>
      </div>
    </div>
  );
}
