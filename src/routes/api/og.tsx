import { createFileRoute } from "@tanstack/react-router";
import { getState } from "@/lib/marvin/store";

async function loadAsset(request: Request, path: string): Promise<ArrayBuffer> {
  const res = await fetch(new URL(path, request.url));
  if (!res.ok) throw new Error(`asset missing: ${path}`);
  return res.arrayBuffer();
}

export const Route = createFileRoute("/api/og")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const raw = url.searchParams.get("day");
        const param = raw === null || raw === "" ? Number.NaN : Number(raw);
        const hasDay = Number.isFinite(param) && param >= 0;
        const state = hasDay ? null : await getState();
        const day = hasDay ? Math.floor(param) : (state?.day ?? 1);
        const dayZero = day === 0 || state?.mode === "day0";

        const [fontBold, fontRegular, marvin] = await Promise.all([
          loadAsset(request, "/fonts/Nunito-ExtraBold.ttf"),
          loadAsset(request, "/fonts/Nunito-Regular.ttf"),
          loadAsset(request, "/marvin.png"),
        ]);

        const { renderOgPng } = await import("@/lib/marvin/og-image");
        const png = await renderOgPng({
          day,
          dayZero,
          fontBold,
          fontRegular,
          marvinSrc: `data:image/png;base64,${Buffer.from(marvin).toString("base64")}`,
        });

        return new Response(Buffer.from(png), {
          headers: {
            "content-type": "image/png",
            "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
