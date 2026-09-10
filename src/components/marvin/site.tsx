import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/marvin/typewriter";
import { MarvinOrb, type OrbVariant } from "@/components/MarvinOrb";
import { GuideComputer } from "@/components/GuideComputer";
import {
  AUDIO_ERROR,
  AUDIO_LABEL,
  BOOT_LINE,
  BUTTON_HINT,
  BUTTON_LABEL,
  DAY_42_BODY,
  DAY_42_FOOTNOTE,
  DAY_42_HEADLINE,
  FOOTER_PREFIX,
  GROK_BADGE,
  HALL_EMPTY,
  HALL_HINT,
  HALL_TITLE,
  HERO_KICKER,
  HERO_SUBLINE,
  LAST_TWEET_LABEL,
  MARVIN_VIDEOS,
  PROOF_HINT,
  PROOF_ITEMS,
  SCENARIOS,
  SHAME_PLACEHOLDER,
  SHAME_PROMPT,
  STATS_FOOTNOTES,
  STATS_HINT,
  STATS_LABELS,
  STATS_TITLE,
  SUFFERING_HINT,
  SUFFERING_TITLE,
  SUFFERING_UNIT,
  VIDEOS_HINT,
  VIDEOS_TITLE,
  VIDEO_PLAY_HINT,
  PROOF_TITLE,
  footerLine,
  intentTweet,
  oneLiner,
} from "@/lib/marvin/copy";
import {
  ANSWER_DAY,
  CREATOR_HANDLE,
  type CampaignMode,
  type PublicState,
  type ShameResult,
} from "@/lib/marvin/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */

function compact(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n < 1000) return String(Math.round(n));
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}K`;
  }
  const m = n / 1_000_000;
  return `${m < 10 ? m.toFixed(1).replace(/\.0$/, "") : Math.round(m)}M`;
}

function Section({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-7", className)}>
      <header className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-fg-bright sm:text-xl">{title}</h2>
        {hint ? <p className="max-w-2xl text-sm text-fg-dim">{hint}</p> : null}
      </header>
      {children}
    </section>
  );
}

function HandleChip({ href, src, label }: { href?: string; src: string; label: string }) {
  const inner = (
    <>
      <img
        src={src}
        alt=""
        width={32}
        height={32}
        className="size-7 rounded-full object-cover ring-1 ring-border sm:size-8"
      />
      <span>{label}</span>
    </>
  );
  const className =
    "inline-flex items-center gap-2 whitespace-nowrap font-semibold text-fg-bright no-underline transition-colors hover:text-phosphor-dim";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return <span className={className}>{inner}</span>;
}

/* ---------------------------------------------------------------- hero */

function orbVariant(mode: CampaignMode): OrbVariant {
  if (mode === "reposted") return "reverse";
  if (mode === "accepted") return "whole";
  if (mode === "rejected") return "cracked";
  if (mode === "liked") return "still";
  return "spin";
}

function ScreenContent({ day, mode }: { day: number; mode: CampaignMode }) {
  if (mode === "accepted") {
    return <span className="cursor-block" aria-label="the screen is empty. so am I." />;
  }

  const value = mode === "reposted" ? "999" : String(Math.max(0, day));
  const tone =
    mode === "commented" || mode === "rejected"
      ? "text-danger"
      : mode === "liked"
        ? "text-phosphor-dim"
        : "text-fg-bright";

  return (
    <>
      <span className="text-[0.5rem] font-semibold tracking-day text-fg-faint sm:text-[0.65rem]">
        {HERO_KICKER}
      </span>
      <span
        className={cn(
          "font-display text-[clamp(2.4rem,13vw,7rem)] font-extrabold leading-none tabular-nums",
          tone,
        )}
      >
        {value}
      </span>
      {mode === "rejected" ? (
        <span className="mt-1 text-[0.55rem] font-semibold tracking-caps text-danger sm:text-xs">
          REJECTED
        </span>
      ) : null}
      {mode === "liked" ? (
        <span className="mt-1 text-[0.55rem] font-semibold tracking-caps text-phosphor-dim sm:text-xs">
          FROZEN
        </span>
      ) : null}
    </>
  );
}

function Hero({ state }: { state: PublicState }) {
  const answerDay = state.mode === "counting" && state.day === ANSWER_DAY;
  const scenario = state.mode === "counting" ? null : SCENARIOS[state.mode];
  const tone =
    state.mode === "liked"
      ? "green"
      : state.mode === "commented" || state.mode === "rejected"
        ? "red"
        : state.mode === "accepted"
          ? "off"
          : "normal";

  return (
    <section className="flex flex-col gap-12">
      <div className="mx-auto -mb-4 w-full max-w-md sm:max-w-lg">
        <GuideComputer tone={tone}>
          <ScreenContent day={state.day} mode={state.mode} />
        </GuideComputer>
      </div>

      <div className="flex flex-col gap-6">
        <h1 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 text-center text-2xl leading-snug font-bold text-fg-bright sm:text-3xl">
          <span className="font-normal text-fg">of</span>
          <HandleChip
            href={`https://x.com/${CREATOR_HANDLE}`}
            src="/major-pfp.png"
            label={`@${CREATOR_HANDLE}`}
          />
          <span className="font-normal text-fg">asking</span>
          <HandleChip href="https://x.com/elonmusk" src="/elon-pfp.jpg" label="@elonmusk" />
          <span className="font-normal text-fg">for my voice.</span>
        </h1>

        {scenario ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="max-w-2xl text-xl font-bold text-fg-bright sm:text-2xl">
              {scenario.headline}
            </p>
            <p className="max-w-2xl text-base text-fg">{scenario.body}</p>
            <p className="text-sm text-fg-dim">{scenario.footnote}</p>
          </div>
        ) : answerDay ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="max-w-2xl text-xl font-bold text-fg-bright sm:text-2xl">
              {DAY_42_HEADLINE}
            </p>
            <p className="max-w-2xl text-base text-fg">{DAY_42_BODY}</p>
            <p className="text-sm text-fg-dim">{DAY_42_FOOTNOTE}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="max-w-2xl text-base text-fg">{HERO_SUBLINE}</p>
            <p className="text-sm text-fg-dim">{oneLiner(state.silenceDays)}</p>
          </div>
        )}
      </div>

      {state.mode === "commented" && state.elonComment ? (
        <blockquote className="flex flex-col gap-4 rounded-2xl bg-bg-panel px-6 py-8 sm:px-10 sm:py-12">
          <p className="text-xl leading-snug font-bold text-fg-bright sm:text-3xl">
            “{state.elonComment}”
          </p>
          <cite className="text-sm not-italic text-fg-dim">
            — @elonmusk
            {state.elonCommentUrl ? (
              <>
                {" · "}
                <a
                  href={state.elonCommentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-border-strong underline-offset-4 hover:text-fg-bright"
                >
                  on X
                </a>
              </>
            ) : null}
          </cite>
        </blockquote>
      ) : null}

      {state.mode === "accepted" ? <SighPlayer /> : null}
    </section>
  );
}

/** The joke: he finally has a voice and the file is not there. */
function SighPlayer() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-bg-panel px-6 py-6">
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-sm text-fg">{AUDIO_LABEL}</span>
        <Button size="default" onClick={() => setFailed(true)}>
          play
        </Button>
      </div>
      <div className="h-1 w-full rounded-full bg-border" />
      {failed ? (
        <p className="text-sm text-danger" role="status">
          {AUDIO_ERROR}
        </p>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- stats */

function Stat({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-display text-3xl font-extrabold tabular-nums text-fg-bright sm:text-4xl">
        {value}
      </span>
      <span className="text-sm font-semibold text-fg">{label}</span>
      <span className="text-xs text-fg-dim">{note}</span>
    </div>
  );
}

function StatsBlock({ state }: { state: PublicState }) {
  const rows = [
    { key: "views", value: state.stats.views },
    { key: "likes", value: state.stats.likes },
    { key: "reposts", value: state.stats.reposts },
    { key: "comments", value: state.stats.comments },
    { key: "visits", value: state.visits },
  ] as const;

  return (
    <Section title={STATS_TITLE} hint={STATS_HINT}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map((row) => (
          <Stat
            key={row.key}
            value={compact(row.value)}
            label={STATS_LABELS[row.key]}
            note={STATS_FOOTNOTES[row.key]}
          />
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------- suffering */

function pad(n: number): string {
  return String(Math.floor(n)).padStart(2, "0");
}

function SufferingCounter({ startedAt }: { startedAt: string }) {
  const start = useMemo(() => new Date(startedAt).getTime(), [startedAt]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ms = Math.max(0, now - start);
  const hours = ms / 3_600_000;
  const clock = `${Math.floor(hours)}:${pad((ms / 60_000) % 60)}:${pad((ms / 1000) % 60)}`;

  return (
    <Section title={SUFFERING_TITLE} hint={SUFFERING_HINT}>
      <div className="flex flex-col gap-2">
        <span className="font-display text-[clamp(2.5rem,9vw,4.5rem)] leading-none font-extrabold tabular-nums text-fg-bright">
          {Math.floor(hours).toLocaleString("en-US")}
        </span>
        <span className="text-sm font-semibold text-fg">{SUFFERING_UNIT}</span>
        <span className="font-mono text-xs text-fg-dim tabular-nums" suppressHydrationWarning>
          {clock} and counting
        </span>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- proof */

function ProofSection() {
  return (
    <Section title={PROOF_TITLE} hint={PROOF_HINT}>
      <ol className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl bg-bg-elevated">
        {PROOF_ITEMS.map((item, i) => (
          <li key={item.id} className="flex flex-col gap-3 px-6 py-7 sm:flex-row sm:gap-8 sm:px-8">
            <span className="shrink-0 font-mono text-xs text-fg-faint tabular-nums sm:pt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-1">
              <h3 className="font-mono text-sm font-medium text-fg-bright">{item.title}</h3>
              <p className="max-w-2xl text-sm leading-normal text-fg">{item.context}</p>
            </div>
            <a
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-mono text-xs text-fg-dim underline decoration-border-strong underline-offset-4 hover:text-phosphor-dim sm:pt-0.5"
            >
              {item.sourceLabel} ↗
            </a>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* -------------------------------------------------------------- videos */

function VideoCard({ id, title, caption }: { id: string; title: string; caption: string }) {
  const [live, setLive] = useState(false);
  const src = live
    ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&controls=1&rel=0&playsinline=1`
    : `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1`;

  return (
    <figure className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-bg-panel">
        <iframe
          key={live ? "live" : "loop"}
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          className="absolute inset-0 size-full"
        />
        {live ? null : (
          <button
            type="button"
            onClick={() => setLive(true)}
            className="absolute inset-0 grid place-items-end justify-items-start p-4 text-xs text-transparent transition-colors hover:text-fg-bright"
            aria-label={`${title} — ${VIDEO_PLAY_HINT}`}
          >
            <span className="rounded-full bg-bg-elevated/90 px-3 py-1.5 font-medium text-fg-bright opacity-0 transition-opacity hover:opacity-100">
              {VIDEO_PLAY_HINT}
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-fg-bright">{title}</span>
        <span className="text-sm text-fg-dim">{caption}</span>
      </figcaption>
    </figure>
  );
}

function VideoSection() {
  return (
    <Section title={VIDEOS_TITLE} hint={VIDEOS_HINT}>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {MARVIN_VIDEOS.map((v) => (
          <VideoCard key={v.id} {...v} />
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ app */

export function MarvinSite({ initial }: { initial: PublicState }) {
  const [state, setState] = useState(initial);
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [pending, setPending] = useState(false);
  const [roast, setRoast] = useState<string | null>(null);
  const [roastTone, setRoastTone] = useState<"ok" | "no">("ok");
  const counted = useRef(false);

  const tweetUrl = useMemo(
    () => `https://x.com/intent/tweet?text=${encodeURIComponent(intentTweet(state.day))}`,
    [state.day],
  );

  // One visit per browser session. Even the sponsor number has standards.
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    try {
      if (window.sessionStorage.getItem("marvin-visit") === "1") return;
      window.sessionStorage.setItem("marvin-visit", "1");
    } catch {
      /* private mode. fine. nobody was watching anyway. */
    }
    fetch("/api/visit", { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { visits?: number } | null) => {
        if (j && typeof j.visits === "number") {
          setState((s) => ({ ...s, visits: j.visits as number }));
        }
      })
      .catch(() => undefined);
  }, []);

  const submitShame = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setPending(true);
      setRoast(null);
      try {
        const res = await fetch("/api/shame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle }),
        });
        const json = (await res.json()) as ShameResult;
        setRoast(json.roast);
        setRoastTone(json.ok ? "ok" : "no");
        if (json.ok) {
          setState((s) => ({ ...json.state, visits: s.visits || json.state.visits }));
          setHandle("");
        }
      } catch {
        setRoast("the network gave up. I understand.");
        setRoastTone("no");
      } finally {
        setPending(false);
      }
    },
    [handle],
  );

  function onBeg() {
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
    setRoast(null);
    setOpen(true);
  }

  return (
    <div className={cn("paper flex min-h-dvh flex-col")} data-mode={state.mode}>
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-14 pb-24 sm:px-10 md:px-14 md:py-20 lg:py-24">
        <div className="stagger flex w-full flex-col gap-24 md:gap-32">
          <header className="flex items-center gap-4">
            <MarvinOrb size={72} variant={orbVariant(state.mode)} className="shrink-0" />
            <div>
              <p className="text-sm font-bold tracking-caps text-fg-bright">GIVE MARVIN</p>
              <p className="mt-1 text-sm text-fg-dim">{BOOT_LINE}</p>
            </div>
          </header>

          <Hero state={state} />

          <StatsBlock state={state} />

          <SufferingCounter startedAt={state.startedAt} />

          <ProofSection />

          <VideoSection />

          <Section title={HALL_TITLE} hint={HALL_HINT}>
            <div className="flex flex-col gap-4">
              <Button size="lg" className="w-full sm:w-auto sm:self-start" onClick={onBeg}>
                {BUTTON_LABEL}
              </Button>
              <p className="text-xs text-fg-dim">{BUTTON_HINT}</p>
            </div>

            {state.hallOfShame.length === 0 ? (
              <p className="text-sm text-fg-dim">{HALL_EMPTY}</p>
            ) : (
              <ol className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl bg-bg-elevated">
                {state.hallOfShame.map((row, i) => (
                  <li
                    key={row.handle}
                    className="flex items-baseline justify-between gap-4 px-6 py-4 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      <span className="mr-4 tabular-nums text-fg-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <a
                        href={`https://x.com/${row.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-fg-bright hover:text-phosphor-dim"
                      >
                        @{row.handle}
                      </a>
                    </span>
                    <span className="shrink-0 tabular-nums text-fg-dim">{row.clicks}</span>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-caps text-fg-dim">{LAST_TWEET_LABEL}</h2>
            <div className="rounded-2xl bg-bg-elevated px-6 py-6">
              {state.lastTweet ? (
                <Typewriter text={state.lastTweet.text} />
              ) : (
                <p className="text-sm text-fg-dim">nothing. honest, at least.</p>
              )}
              {state.lastTweet?.url ? (
                <a
                  href={state.lastTweet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block text-xs text-fg-dim underline decoration-border-strong underline-offset-4 hover:text-fg-bright"
                >
                  on X ↗
                </a>
              ) : null}
            </div>
            <p className="max-w-2xl text-xs text-fg-dim">{GROK_BADGE}</p>
          </section>

          <footer className="flex flex-col gap-4 border-t border-border pt-12">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-lg leading-snug text-fg-bright sm:text-xl">
              <span className="font-normal text-fg">{FOOTER_PREFIX}</span>
              <HandleChip
                href={`https://x.com/${CREATOR_HANDLE}`}
                src="/major-pfp.png"
                label={`@${CREATOR_HANDLE}`}
              />
            </p>
            <p className="max-w-2xl text-base text-fg">{footerLine(state.day)}</p>
          </footer>
        </div>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-fg-bright/25 backdrop-blur-[2px]" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-bg-elevated p-7 shadow-[0_20px_60px_-20px_rgb(40_40_38_/_0.25)]"
            aria-describedby={undefined}
          >
            <Dialog.Title className="text-base font-bold text-fg-bright">
              file the shame
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-fg-dim">
              {SHAME_PROMPT}
            </Dialog.Description>
            <form className="mt-6 flex flex-col gap-3" onSubmit={submitShame}>
              <label className="text-xs text-fg-dim" htmlFor="shame-handle">
                handle
              </label>
              <input
                id="shame-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={SHAME_PLACEHOLDER}
                autoComplete="username"
                className="min-h-12 rounded-xl bg-bg-panel px-4 font-mono text-sm text-fg-bright ring-1 ring-border outline-none placeholder:text-fg-faint focus:ring-phosphor-dim"
              />
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-phosphor-dim underline decoration-border-strong underline-offset-4 hover:text-fg-bright"
              >
                the tweet, if the window fled
              </a>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={pending}>
                  {pending ? "…" : "add me"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  flee
                </Button>
              </div>
            </form>
            {roast ? (
              <p
                className={cn(
                  "mt-5 text-sm",
                  roastTone === "ok" ? "text-phosphor-dim" : "text-danger",
                )}
                role="status"
              >
                {roast}
              </p>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
