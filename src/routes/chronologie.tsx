import { createFileRoute } from "@tanstack/react-router";
import { ARCHIVE_LAST_DAY, ARCHIVE_TWEETS, ARCHIVE } from "@/lib/marvin/archive";
import { loadPublicState } from "@/lib/marvin/public";
import { siteOrigin, SITE_NAME } from "@/lib/marvin/seo";
import { CREATOR_HANDLE, POSTING_HANDLE } from "@/lib/marvin/types";

export const Route = createFileRoute("/chronologie")({
  loader: () => loadPublicState(),
  head: () => {
    const title = `Chronology — ${SITE_NAME}`;
    const description = `Every day of asking @elonmusk to give Grok Marvin's voice. Days 1–${ARCHIVE_LAST_DAY} on @${CREATOR_HANDLE}, Day ${ARCHIVE_LAST_DAY + 1} onward on @${POSTING_HANDLE}.`;
    return {
      title,
      meta: [
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
      links: [{ rel: "canonical", href: `${siteOrigin()}/chronologie` }],
    };
  },
  component: Chronology,
});

const fmt = (n: number | null) => (n === null ? "—" : n.toLocaleString("en-US"));

function Chronology() {
  const state = Route.useLoaderData() ?? { day: ARCHIVE_LAST_DAY, lastTweet: null };
  const totalViews = ARCHIVE_TWEETS.reduce((s, t) => s + (t.views ?? 0), 0);
  const current = state.day > ARCHIVE_LAST_DAY ? state.day : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 bg-bg px-6 py-16 font-sans text-fg">
      <header className="flex flex-col gap-3">
        <a
          href="/"
          className="text-xs text-fg-dim underline underline-offset-4 hover:text-fg-bright"
        >
          ← back to the monument
        </a>
        <h1 className="text-3xl font-extrabold text-fg-bright">Chronology</h1>
        <p className="text-base leading-normal">
          Days 1–{ARCHIVE_LAST_DAY} were posted from{" "}
          <a className="font-semibold text-fg-bright" href={`https://x.com/${CREATOR_HANDLE}`}>
            @{CREATOR_HANDLE}
          </a>
          . They are frozen here. From Day {ARCHIVE_LAST_DAY + 1} the asking continues from{" "}
          <a className="font-semibold text-fg-bright" href={`https://x.com/${POSTING_HANDLE}`}>
            @{POSTING_HANDLE}
          </a>
          , managed by @{CREATOR_HANDLE}. Same robot. Same silence.
        </p>
        <p className="text-xs text-fg-dim">
          {fmt(totalViews)} views across the archive · numbers frozen at{" "}
          {ARCHIVE.snapshotAt.slice(0, 10)}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-fg-bright">
          Day {ARCHIVE_LAST_DAY + 1} onward — @{POSTING_HANDLE}
        </h2>
        <div className="card px-6 py-5 text-sm">
          {current && state.lastTweet?.postedToX ? (
            <>
              <p className="whitespace-pre-line">{state.lastTweet.text}</p>
              {state.lastTweet.url ? (
                <a
                  href={state.lastTweet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs text-fg-dim underline underline-offset-4"
                >
                  Day {state.lastTweet.day} on X ↗
                </a>
              ) : null}
            </>
          ) : (
            <p className="text-fg-dim">
              Day {ARCHIVE_LAST_DAY + 1} has not been posted yet. It will be. Inevitably.
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-fg-bright">
          Days 1–{ARCHIVE_LAST_DAY} — @{CREATOR_HANDLE} (archive)
        </h2>
        <ol className="flex flex-col gap-3">
          {[...ARCHIVE_TWEETS].reverse().map((t) => (
            <li key={t.id} className="card flex flex-col gap-2 px-6 py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-fg-dim">
                <span className="font-bold text-fg-bright">Day {t.day}</span>
                <time dateTime={t.postedAt}>{t.postedAt.slice(0, 10)}</time>
              </div>
              <p className="text-sm whitespace-pre-line">{t.text}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-dim tabular-nums">
                <span>{fmt(t.views)} views</span>
                <span>{fmt(t.likes)} likes</span>
                <span>{fmt(t.reposts)} reposts</span>
                <span>{fmt(t.replies)} replies</span>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-fg-bright"
                >
                  on X ↗
                </a>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
