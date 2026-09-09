import { createFileRoute } from "@tanstack/react-router";
import { siteOrigin } from "@/lib/marvin/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const origin = siteOrigin();
        const body = `User-agent: *
Allow: /
Allow: /api/og

Disallow: /api/cron
Disallow: /api/shame

Sitemap: ${origin}/sitemap.xml
`;
        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
