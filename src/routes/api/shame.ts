import { createFileRoute } from "@tanstack/react-router";
import {
  CREATOR_HANDLE,
  type ShameResult,
} from "@/lib/marvin/types";
import {
  getState,
  normalizeHandle,
  saveState,
  toPublicState,
  upsertShame,
} from "@/lib/marvin/store";
import {
  shameRoastCreator,
  shameRoastInvalid,
  shameRoastNew,
  shameRoastRepeat,
} from "@/lib/marvin/copy";

export const Route = createFileRoute("/api/shame")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let handleRaw = "";
        try {
          const body = (await request.json()) as { handle?: unknown };
          handleRaw = typeof body.handle === "string" ? body.handle : "";
        } catch {
          handleRaw = "";
        }

        const handle = normalizeHandle(handleRaw);
        if (!handle) {
          const result: ShameResult = {
            ok: false,
            error: "invalid",
            roast: shameRoastInvalid(),
          };
          return Response.json(result, { status: 400 });
        }

        if (handle.toLowerCase() === CREATOR_HANDLE.toLowerCase()) {
          const result: ShameResult = {
            ok: false,
            error: "creator",
            roast: shameRoastCreator(),
          };
          return Response.json(result, { status: 403 });
        }

        const state = await getState();
        const { hall, status } = upsertShame(state.hallOfShame, handle);
        if (status === "repeat") {
          const result: ShameResult = {
            ok: false,
            error: "repeat",
            roast: shameRoastRepeat(handle),
          };
          return Response.json(result, { status: 409 });
        }

        state.hallOfShame = hall;
        await saveState(state);
        const publicState = toPublicState(state);
        const rank =
          publicState.hallOfShame.findIndex(
            (e) => e.handle.toLowerCase() === handle.toLowerCase(),
          ) + 1;
        const result: ShameResult = {
          ok: true,
          state: publicState,
          roast: shameRoastNew(handle, rank || publicState.hallOfShame.length),
        };
        return Response.json(result);
      },
    },
  },
});
