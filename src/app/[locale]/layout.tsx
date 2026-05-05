import { getTranslations } from "@/lib/translations";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getTranslations(locale);

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
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <a href={`/${locale}`} className="text-xl font-bold text-gray-900">OKAIBI</a>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-sm text-gray-600 hover:text-blue-600 transition">{item.label}</a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              {Object.entries(langLinks).map(([code, href]) => (
                <a key={code} href={href} className={`text-xs px-2 py-1 rounded ${code === locale ? "bg-blue-600 text-white" : "text-gray-400 hover:text-blue-600"}`}>{code.toUpperCase()}</a>
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
              <h3 className="text-white font-bold text-lg mb-3">OKAIBI</h3>
              <p className="text-sm text-gray-400">{t.footer.tagline}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">{t.footer.quick_links}</h4>
              <div className="space-y-2 text-sm">
                {[t.nav.products, t.nav.brands, t.nav.inquiry, t.nav.about, t.nav.privacy, t.nav.terms].map((label, i) => {
                  const paths = ["products", "brands", "inquiry", "about", "privacy", "terms"];
                  return <a key={paths[i]} href={`/${locale}/${paths[i]}`} className="block hover:text-white">{label}</a>;
                })}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">{t.footer.contact_info}</h4>
              <div className="space-y-2 text-sm">
                <p>{t.contact.info.email}</p>
                <p>{t.contact.info.phone}</p>
                <p>{t.contact.info.address}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            &copy; 2024 OKAIBI. {t.footer.rights}
          </div>
        </div>
      </footer>
    </div>
  );
}
