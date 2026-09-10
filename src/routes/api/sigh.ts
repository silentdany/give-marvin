import { createFileRoute } from "@tanstack/react-router";

/**
 * The 47-second sigh. It is a 404, on purpose — that is the joke, and it has to
 * be a real one: an unknown static path gets the SPA fallback with a 200, so
 * the player would just sit there in silence, which is a worse joke. This way
 * the audio element reliably fails and says so.
 *
 * Marvin has a voice. Nobody hears it.
 */
export const Route = createFileRoute("/api/sigh")({
  server: {
    handlers: {
      GET: async () =>
        new Response("404. Marvin has a voice. Nobody hears it.", {
          status: 404,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
          },
        }),
    },
  },
});
