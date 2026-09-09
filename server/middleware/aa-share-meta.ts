/**
 * The Grok PWA injector strips og:image on *.vercel.app hosts on purpose.
 * This app lives on Vercel. Re-stamp the share card after that pass.
 */
function shareOrigin(event: { url: URL; req: { headers: Headers } }): string {
  const explicit = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return prod.startsWith("http") ? prod : `https://${prod}`;
  const host =
    event.req.headers.get("x-forwarded-host") ?? event.req.headers.get("host") ?? event.url.host;
  return `https://${host.split(",")[0]!.trim()}`;
}

function inject(response: Response, origin: string): Response {
  if (!response.body) return response;
  const image = `${origin}/api/og`;
  const tags = [
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:secure_url" content="${image}">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:image" content="${image}">`,
  ].join("");

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let leftover = "";
  let done = false;

  const transformed = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        if (done) {
          controller.enqueue(chunk);
          return;
        }
        leftover += decoder.decode(chunk, { stream: true });
        const idx = leftover.toLowerCase().indexOf("</head>");
        if (idx === -1) {
          if (leftover.length > 24_000) {
            controller.enqueue(encoder.encode(leftover));
            leftover = "";
          }
          return;
        }
        const out = leftover.slice(0, idx) + tags + leftover.slice(idx);
        leftover = "";
        done = true;
        controller.enqueue(encoder.encode(out));
      },
      flush(controller) {
        if (leftover) controller.enqueue(encoder.encode(leftover));
      },
    }),
  );

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(transformed, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default async function shareMetaMiddleware(
  event: { url: URL; req: { method: string; headers: Headers } },
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET") return next();
  const path = event.url.pathname;
  if (path.startsWith("/api/") || path.startsWith("/assets/") || path.includes(".")) return next();

  const result = await next();
  if (!(result instanceof Response)) return result;
  const type = result.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) return result;
  return inject(result, shareOrigin(event));
}
