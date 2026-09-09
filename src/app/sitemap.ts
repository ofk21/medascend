import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { BRAND } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = BRAND.url;
  const statics = ["", "/pricing", "/exam-guide", "/blog", "/about", "/help", "/contact", "/privacy", "/terms", "/refund-policy", "/register", "/login"].map((p) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));
  let articles: MetadataRoute.Sitemap = [];
  try {
    const rows = await db.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
    articles = rows.map((a) => ({ url: `${base}/blog/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 }));
  } catch {
    // database unavailable at build time – static entries only
  }
  return [...statics, ...articles];
}
