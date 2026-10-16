import { createServerFn } from "@tanstack/react-start";
import type { PublicState } from "./types";

/** `{ day, state }` when `/day/{raw}` exists, `null` otherwise. */
export const loadDayPage = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => String(raw))
  .handler(async ({ data }): Promise<{ day: number; state: PublicState } | null> => {
    const { parseDayParam } = await import("./types");
    const day = parseDayParam(data);
    if (day === null) return null;
    const { getState, toPublicState } = await import("./store");
    const { latestDay } = await import("./cron");
    const state = await getState();
    if (day > latestDay(state)) return null;
    return { day, state: toPublicState(state) };
  });
