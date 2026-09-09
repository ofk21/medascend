import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/session", "/qbank", "/account", "/api", "/checkout"] }],
    sitemap: `${BRAND.url}/sitemap.xml`,
  };
}
