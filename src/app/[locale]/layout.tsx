import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { getServerSettings } from "@/lib/server-settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getServerSettings();
  const t = getTranslations(locale);
  const siteName = settings.site_name || "OKAIBI";
  const siteDesc = locale === "zh" && settings.site_tagline
    ? (settings as any)[`hero_subtitle_${locale}`] || settings.site_tagline
    : (settings.site_description || t.site.desc);

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDesc,
    keywords: settings.site_keywords || "global trading, B2B, wholesale, import, export",
    openGraph: {
      title: siteName,
      description: siteDesc,
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale);
  const settings = await getServerSettings();
  const isZh = locale === "zh";

  const siteName = settings.site_name || "OKAIBI";
  const siteTagline = settings.site_tagline || "Your trusted partner in global trade";
  const contactEmail = settings.contact_email || "info@okaibiglobal.com";
  const contactPhone = settings.contact_phone || "+86-571-8888-8888";
  const contactAddress = isZh && settings.contact_address_zh
    ? settings.contact_address_zh
    : (settings.contact_address_en || "Hangzhou, Zhejiang Province, China");
  const footerTagline = isZh && settings.footer_tagline_zh
    ? settings.footer_tagline_zh
    : (settings.footer_tagline_en || siteTagline);
  const footerCopyright = settings.footer_copyright || `© 2024 ${siteName}. All rights reserved.`;
  const siteLogo = settings.site_logo || "";
  const whatsappNumber = settings.whatsapp_number || "";
  const gaId = settings.google_analytics_id || "";
  const gtmId = settings.google_tag_manager || "";

  const navItems = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/products`, label: t.nav.products },
    { href: `/${locale}/brands`, label: t.nav.brands },
    { href: `/${locale}/inquiry`, label: t.nav.inquiry },
    { href: `/${locale}/contact`, label: t.nav.contact },
    { href: `/${locale}/about`, label: t.nav.about },
  ];

  const langLinks: Record<string, string> = { en: "/en", zh: "/zh" };

  return (
    <div>
      {/* Google Analytics */}
      {gaId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      )}
      {gaId && (
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`
        }} />
      )}
      {/* Google Tag Manager */}
      {gtmId && (
        <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`} height="0" width="0" style={{display:"none",visibility:"hidden"}} /></noscript>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <a href={`/${locale}`} className="flex items-center gap-2">
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold text-gray-900">{siteName}</span>
              )}
            </a>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a key={item.href} href={item.href}
                  className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">{item.label}</a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              {Object.entries(langLinks).map(([code, href]) => (
                <a key={code} href={href}
                  className={`text-xs px-2 py-1 rounded transition ${
                    code === locale
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-blue-600 hover:bg-gray-50"
                  }`}>{code.toUpperCase()}</a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-3">{siteName}</h3>
              <p className="text-sm text-gray-400">{footerTagline}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">{t.footer.quick_links}</h4>
              <div className="space-y-2 text-sm">
                {[t.nav.products, t.nav.brands, t.nav.inquiry, t.nav.about, t.nav.privacy, t.nav.terms].map((label, i) => {
                  const paths = ["products", "brands", "inquiry", "about", "privacy", "terms"];
                  return <a key={paths[i]} href={`/${locale}/${paths[i]}`} className="block hover:text-white transition">{label}</a>;
                })}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">{t.footer.contact_info}</h4>
              <div className="space-y-2 text-sm">
                <p><a href={`mailto:${contactEmail}`} className="hover:text-white transition">{contactEmail}</a></p>
                <p>{contactPhone}</p>
                {whatsappNumber && <p>WhatsApp: <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g,"")}`} target="_blank" className="hover:text-white transition">{whatsappNumber}</a></p>}
                <p>{contactAddress}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            {footerCopyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
