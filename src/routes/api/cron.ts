import { createFileRoute } from "@tanstack/react-router";
import { cronAuthorizedLenient, runDailyCron } from "@/lib/marvin/cron";

async function handle(request: Request): Promise<Response> {
  if (!cronAuthorizedLenient(request)) {
    return Response.json(
      {
        ok: false,
        message: "Unauthorized. Even my misery is behind a door.",
      },
      { status: 401 },
    );
  }

  try {
    const result = await runDailyCron();
    return Response.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "cron exploded, as expected";
    console.error("[marvin] cron", err);
    return Response.json({ ok: false, action: "error", message }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/cron")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});
