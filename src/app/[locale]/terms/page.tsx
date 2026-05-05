import { getTranslations } from "@/lib/translations";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getTranslations(locale);

  const content: Record<string, any> = {
    en: {
      h1: "Terms of Service",
      lastUpdated: "Last updated: January 2025",
      sections: [
        { title: "General", content: "These Terms of Service govern your use of the OKAIBI website and services. By using our website, you agree to these terms. If you do not agree, please do not use our services." },
        { title: "Use of Service", content: "Our services are intended for business-to-business (B2B) transactions. You agree to provide accurate information when using our inquiry forms and to use our services for legitimate business purposes only." },
        { title: "Intellectual Property", content: "All content on this website, including text, images, logos, and product information, is owned by OKAIBI or our partners. You may not reproduce, distribute, or use our content without written permission." },
        { title: "Limitation of Liability", content: "OKAIBI shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or services. We make no warranties regarding the accuracy of product information provided by third-party suppliers." },
        { title: "Contact", content: "For questions about these terms, please contact us at info@okaibiglobal.com." },
      ],
    },
    zh: {
      h1: "服务条款",
      lastUpdated: "最后更新：2025年1月",
      sections: [
        { title: "总则", content: "本服务条款适用于您使用 OKAIBI 网站和服务的行为。使用本网站即表示您同意这些条款。如不同意，请勿使用我们的服务。" },
        { title: "服务使用", content: "我们的服务面向企业对企业（B2B）交易。您需确保在使用询盘表单时提供准确的信息，并仅将我们的服务用于合法的商业目的。" },
        { title: "知识产权", content: "本网站所有内容，包括文字、图片、标志和产品信息，归 OKAIBI 或我们的合作伙伴所有。未经书面许可，不得复制、分发或使用我们的内容。" },
        { title: "责任限制", content: "对于因使用本网站或服务而产生的任何间接、附带或后果性损害，OKAIBI 概不负责。我们不对第三方供应商提供的产品信息准确性作出保证。" },
        { title: "联系我们", content: "如有关于这些条款的问题，请发送邮件至 info@okaibiglobal.com。" },
      ],
    },
    ar: {
      h1: "شروط الخدمة",
      lastUpdated: "آخر تحديث: يناير 2025",
      sections: [
        { title: "عام", content: "تحكم شروط الخدمة هذه استخدامك لموقع OKAIBI وخدماتها. باستخدام موقعنا، فإنك توافق على هذه الشروط." },
        { title: "استخدام الخدمة", content: "خدماتنا مخصصة للمعاملات التجارية بين الشركات (B2B). توافق على تقديم معلومات دقيقة عند استخدام نماذج الاستفسار." },
        { title: "الملكية الفكرية", content: "جميع المحتويات على هذا الموقع، بما في ذلك النصوص والصور والشعارات، مملوكة لـ OKAIBI أو شركائنا. لا يجوز النسخ أو التوزيع دون إذن كتابي." },
        { title: "حدود المسؤولية", content: "OKAIBI غير مسؤولة عن أي أضرار غير مباشرة أو تبعية ناتجة عن استخدامك لموقعنا أو خدماتنا." },
        { title: "اتصل بنا", content: "للاستفسار عن هذه الشروط، يرجى التواصل على info@okaibiglobal.com" },
      ],
    },
  };

  const data = content[locale] || content.en;

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
