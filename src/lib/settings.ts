import { getDb } from "./db";

export interface SiteSettings {
  // Site Identity
  site_name: string;
  site_tagline: string;
  site_logo: string;
  site_favicon: string;
  site_description: string;
  site_keywords: string;

  // Hero Section
  hero_title_en: string;
  hero_title_zh: string;
  hero_subtitle_en: string;
  hero_subtitle_zh: string;
  hero_cta_en: string;
  hero_cta_zh: string;

  // Contact
  contact_email: string;
  contact_phone: string;
  contact_address_en: string;
  contact_address_zh: string;
  whatsapp_number: string;

  // Footer
  footer_tagline_en: string;
  footer_tagline_zh: string;
  footer_copyright: string;

  // About
  about_title_en: string;
  about_title_zh: string;
  about_intro_en: string;
  about_intro_zh: string;
  about_mission_title_en: string;
  about_mission_title_zh: string;
  about_mission_desc_en: string;
  about_mission_desc_zh: string;

  // SEO / Analytics
  google_analytics_id: string;
  google_tag_manager: string;

  // Maintenance
  maintenance_mode: string;
  admin_password_hash: string;
}

const DEFAULTS: SiteSettings = {
  site_name: "OKAIBI — Global Trading",
  site_tagline: "Your trusted partner in global trade",
  site_logo: "",
  site_favicon: "",
  site_description: "Your trusted partner in global trade since 2024.",
  site_keywords: "global trading, import, export, wholesale, B2B, sourcing",

  hero_title_en: "Your Trusted Partner in Global Trade",
  hero_title_zh: "您值得信赖的全球贸易伙伴",
  hero_subtitle_en: "Connecting quality manufacturers with global buyers across consumer electronics, automotive parts, furniture, textiles, and vapor products.",
  hero_subtitle_zh: "连接优质制造商与全球买家，涵盖消费电子、汽车配件、家具建材、纺织品和蒸汽产品。",
  hero_cta_en: "Explore Products",
  hero_cta_zh: "浏览产品",

  contact_email: "info@okaibiglobal.com",
  contact_phone: "+86-571-8888-8888",
  contact_address_en: "Hangzhou, Zhejiang Province, China",
  contact_address_zh: "中国浙江省杭州市",
  whatsapp_number: "+861234567890",

  footer_tagline_en: "Your trusted partner in global trade since 2024.",
  footer_tagline_zh: "您自2024年以来值得信赖的全球贸易伙伴。",
  footer_copyright: "© 2024 OKAIBI. All rights reserved.",

  about_title_en: "About OKAIBI",
  about_title_zh: "关于 OKAIBI",
  about_intro_en: "OKAIBI is a global trading company dedicated to bridging the gap between quality manufacturers and international buyers.",
  about_intro_zh: "OKAIBI 是一家致力于连接优质制造商与国际买家的全球贸易公司。",
  about_mission_title_en: "Our Mission",
  about_mission_title_zh: "我们的使命",
  about_mission_desc_en: "To simplify global trade by providing reliable sourcing, quality assurance, and seamless logistics to businesses worldwide.",
  about_mission_desc_zh: "通过提供可靠的采购、质量保证和无缝的物流，简化全球贸易。",

  google_analytics_id: "",
  google_tag_manager: "",
  maintenance_mode: "0",
  admin_password_hash: "",
};

let cache: SiteSettings | null = null;

function parseBool(val: string): string {
  return val === "1" ? "1" : "0";
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cache) return cache;

  try {
    const db = getDb();
    const result = await db.execute("SELECT key, value FROM settings");
    const raw: Record<string, string> = {};
    for (const row of result.rows) {
      raw[row.key as string] = row.value as string;
    }

    const settings = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS) as (keyof SiteSettings)[]) {
      if (raw[key] !== undefined && raw[key] !== null) {
        (settings as any)[key] = raw[key];
      }
    }

    cache = settings;
    return settings;
  } catch {
    return DEFAULTS;
  }
}

export function invalidateCache() {
  cache = null;
}

export function getDefaultSettings(): SiteSettings {
  return { ...DEFAULTS };
}
