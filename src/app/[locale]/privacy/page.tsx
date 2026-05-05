import { getTranslations } from "@/lib/translations";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getTranslations(locale);

  const content = {
    en: {
      h1: "Privacy Policy",
      lastUpdated: "Last updated: January 2025",
      sections: [
        { title: "Information We Collect", content: "We collect information you provide directly, such as your name, email address, phone number, and company details when you submit inquiries or contact forms. We also automatically collect certain technical information, including IP address, browser type, and usage patterns." },
        { title: "How We Use Your Information", content: "We use the information we collect to respond to your inquiries, provide our trading services, improve our website, and communicate with you about our products and services. We do not sell your personal information to third parties." },
        { title: "Data Security", content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction." },
        { title: "Your Rights", content: "You have the right to access, update, or delete your personal information. You may also request a copy of the data we hold about you. To exercise these rights, please contact us at info@okaibiglobal.com." },
        { title: "Cookies", content: "Our website uses essential cookies for functionality. We do not use tracking cookies or third-party analytics without your consent." },
      ],
    },
    zh: {
      h1: "隐私政策",
      lastUpdated: "最后更新：2025年1月",
      sections: [
        { title: "我们收集的信息", content: "当您提交询盘或联系表单时，我们会收集您直接提供的信息，如姓名、邮箱、电话和公司信息。同时，我们会自动收集某些技术信息，包括IP地址、浏览器类型和使用模式。" },
        { title: "我们如何使用您的信息", content: "我们使用收集的信息来回复您的询盘、提供贸易服务、改进网站以及向您介绍我们的产品和服务。我们不会将您的个人信息出售给第三方。" },
        { title: "数据安全", content: "我们采取适当的技术和组织措施，保护您的个人信息免受未经授权的访问、更改、披露或破坏。" },
        { title: "您的权利", content: "您有权访问、更新或删除您的个人信息。您也可以要求获取我们保存的有关您的数据副本。行使这些权利，请发送邮件至 info@okaibiglobal.com。" },
        { title: "Cookie", content: "我们的网站使用必要的Cookie以确保功能正常。未经您的同意，我们不会使用跟踪Cookie或第三方分析工具。" },
      ],
    },
    ar: {
      h1: "سياسة الخصوصية",
      lastUpdated: "آخر تحديث: يناير 2025",
      sections: [
        { title: "المعلومات التي نجمعها", content: "نجمع المعلومات التي تقدمها مباشرة، مثل اسمك وبريدك الإلكتروني ورقم هاتفك وتفاصيل شركتك عند تقديم الاستفسارات. كما نجمع تلقائياً بعض المعلومات التقنية بما في ذلك عنوان IP ونوع المتصفح." },
        { title: "كيف نستخدم معلوماتك", content: "نستخدم المعلومات التي نجمعها للرد على استفساراتك وتقديم خدماتنا التجارية وتحسين موقعنا. لا نبيع معلوماتك الشخصية لأطراف ثالثة." },
        { title: "أمان البيانات", content: "نطبق إجراءات تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفشاء أو التدمير." },
        { title: "حقوقك", content: "لديك الحق في الوصول إلى معلوماتك الشخصية أو تحديثها أو حذفها. يمكنك أيضاً طلب نسخة من البيانات التي نحتفظ بها. للتواصل: info@okaibiglobal.com" },
        { title: "ملفات تعريف الارتباط", content: "يستخدم موقعنا ملفات تعريف الارتباط الأساسية للوظائف. لا نستخدم ملفات تتبع أو تحليلات خارجية دون موافقتك." },
      ],
    },
  };

  const data = (content as any)[locale] || content.en;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.h1}</h1>
      <p className="text-sm text-gray-400 mb-8">{data.lastUpdated}</p>

      <div className="space-y-6">
        {data.sections.map((s: any, i: number) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-2">{s.title}</h2>
            <p className="text-sm text-gray-600">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
