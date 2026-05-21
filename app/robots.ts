import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
      ],
    },

    sitemap: "https://www.freellabrasil.com.br/sitemap.xml",
  };
}