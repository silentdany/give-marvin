"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { MarvinOrb } from "@/components/marvin/MarvinOrb";
import { ProofThumb } from "@/components/marvin/ProofThumb";
import {
  BOOT_LINE,
  BUTTON_HINT,
  BUTTON_LABEL,
  DAY42_SITE,
  FOOTER_ROAST,
  GROK_BADGE,
  GUIDE_BEZEL_LEFT,
  GUIDE_BEZEL_RIGHT,
  GUIDE_GONE,
  GUIDE_LABEL,
  HALL_EMPTY,
  HALL_TITLE,
  PROOF_TITLE,
  SCENARIO_COPY,
  SHAME_PLACEHOLDER,
  SHAME_PROMPT,
  SIGH_BROKEN,
  SIGH_HINT,
  SIGH_TITLE,
  STATS_TITLE,
  STATS_VISITS_NOTE,
  SUFFERING_LABEL,
  SUFFERING_TITLE,
  WHO_TITLE,
  guideNote,
  intentTweet,
} from "@/lib/marvin/copy";
import { CLIPS, PROOFS } from "@/lib/marvin/proofs";
import {
  CREATOR_HANDLE,
  type ElonScenario,
  type PublicState,
  type ShameResult,
} from "@/lib/marvin/types";
import { cn } from "@/lib/utils";

function HandleChip({ href, src, label }: { href?: string; src: string; label: string }) {
  const inner = (
    <>
      <img
        src={src}
        alt=""
        width={32}
        height={32}
        className="size-7 rounded-full object-cover shadow-[0_0_0_1px_var(--color-border-strong)] sm:size-8"
      />
      <span>{label}</span>
    </>
  );
  const className =
    "inline-flex items-center gap-1.5 whitespace-nowrap no-underline hover:text-fg-bright";
  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return <span className={className}>{inner}</span>;
}

function displayDay(state: PublicState): number {
  if (state.scenario === "repost") return 999;
  if (state.scenario === "rejected") return 47;
  if (state.scenario === "comment") return 0;
  if (state.scenario === "day42") return 42;
  return state.day;
}

function orbMood(scenario: ElonScenario) {
  if (scenario === "accepted") return "whole" as const;
  if (scenario === "rejected") return "cracked" as const;
  if (scenario === "repost") return "spin-back" as const;
  return "split" as const;
}

/**
 * The Guide's computer — the one that prints 42 at the end of the book.
 * The screen is the background. The number is the content. This is the only
 * counter on the site; there is nothing underneath it.
 */
function GuideScreen({
  day,
  scenario,
  hide,
  red,
}: {
  day: number;
  scenario: ElonScenario;
  hide?: boolean;
  red?: boolean;
}) {
  return (
    <div className="guide">
      <p className="guide-bezel">
        <span>{GUIDE_BEZEL_LEFT}</span>
        <span>{GUIDE_BEZEL_RIGHT}</span>
      </p>
      <div className={cn("guide-screen", red && "guide-screen--red")}>
        {hide ? (
          <p className="guide-note">{GUIDE_GONE}</p>
        ) : (
          <>
            <p className="guide-label">{GUIDE_LABEL}</p>
            <p className="guide-number" aria-label={`Day ${day}`}>
              {day}
            </p>
            <p className="guide-note">{guideNote(scenario)}</p>
          </>
        )}
      </div>
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

/** Hours of depression generated. Real time. Of course I counted. */
function Suffering({ startedAt }: { startedAt: string }) {
  const [hours, setHours] = useState(0);
  useEffect(() => {
    const tick = () => {
      const ms = Date.now() - new Date(startedAt).getTime();
      setHours(Math.max(0, ms / 3_600_000));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm tracking-caps text-fg-dim">{SUFFERING_TITLE}</h2>
      <p className="text-sm text-fg-dim">
        <span className="font-mono text-base text-fg-bright tabular-nums">{hours.toFixed(3)}</span>{" "}
        {SUFFERING_LABEL}
      </p>
    </section>
  );
}

function Clip({ id, title }: { id: string; title: string }) {
  const [loud, setLoud] = useState(false);
  const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=${loud ? 0 : 1}&loop=1&playlist=${id}&playsinline=1`;
  return (
    <button
      type="button"
      onClick={() => setLoud(true)}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-bg-panel text-left shadow-[0_0_0_1px_var(--color-border)]"
    >
      <iframe
        title={title}
        src={src}
        allow="autoplay; encrypted-media"
        className="absolute inset-0 h-full w-full border-0"
      />
      {!loud ? (
        <span className="absolute inset-x-0 bottom-0 bg-bg/85 px-3 py-2 text-xs text-fg-dim">
          {title} — muted. click if you insist.
        </span>
      ) : null}
    </button>
  );
}

/**
 * Marvin has a voice and the player is a 404. That is the joke, so the source
 * is `/api/sigh`, which answers 404 on purpose, and we let the browser say so.
 * (A missing static file would not do: unknown paths get the SPA fallback with
 * a 200 and the player would fail silently, which is a worse joke.)
 */
function BrokenSigh() {
  const [broken, setBroken] = useState(false);
  const player = useRef<HTMLAudioElement>(null);

  // `error` on a media element does not bubble and React's onError prop never
  // fires for it, so the listener goes on directly. The failure has to be
  // reported; a silent dead player is not the joke.
  useEffect(() => {
    const el = player.current;
    if (!el) return;
    const fail = () => setBroken(true);
    // `error` is one-shot and does not replay, so a failure that landed before
    // hydration attached the listener would be lost. Check for it first.
    if (el.error) fail();
    el.addEventListener("error", fail);
    return () => el.removeEventListener("error", fail);
  }, []);

  return (
    <div className="panel flex flex-col gap-3 p-5">
      <p className="text-sm text-fg-bright">{SIGH_TITLE}</p>
      <audio ref={player} controls preload="none" src="/api/sigh" className="w-full max-w-sm" />
      <p
        className={cn("font-mono text-xs", broken ? "text-danger" : "text-fg-faint")}
        role="status"
      >
        {broken ? SIGH_BROKEN : SIGH_HINT}
      </p>
    </div>
  );
}

export function MarvinSite({ initial }: { initial: PublicState }) {
  const [state, setState] = useState(initial);
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [pending, setPending] = useState(false);
  const [roast, setRoast] = useState<string | null>(null);
  const [roastTone, setRoastTone] = useState<"ok" | "no">("ok");

  const scenario = state.scenario;
  const day = displayDay(state);
  const copy = SCENARIO_COPY[scenario];
  const tweetUrl = useMemo(
    () => `https://x.com/intent/tweet?text=${encodeURIComponent(intentTweet(state.day))}`,
    [state.day],
  );

  async function submitShame(e: FormEvent) {
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
        setState(json.state);
        setHandle("");
      }
    } catch {
      setRoast("the network gave up. I understand.");
      setRoastTone("no");
    } finally {
      setPending(false);
    }
  }

  function onSupply() {
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
    setRoast(null);
    setOpen(true);
  }

  return (
    <div className={cn("heart-of-gold flex min-h-dvh flex-col", `scenario-${scenario}`)}>
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col px-6 py-16 pb-28 sm:px-10 md:px-16 md:py-24 lg:px-20 lg:py-28">
        <div className="stagger flex w-full flex-col gap-20 md:gap-28">
          <header className="flex items-center gap-4">
            <MarvinOrb mood={orbMood(scenario)} size={88} />
            <div>
              <p className="text-sm font-medium tracking-caps text-fg-bright">GIVE MARVIN</p>
              <p className="mt-1 text-sm text-fg-dim">{BOOT_LINE}</p>
            </div>
          </header>

          {/* 1. Hero — the counter, and the two people it is about. */}
          <section className="flex flex-col gap-8">
            <GuideScreen
              day={day}
              scenario={scenario}
              hide={scenario === "accepted"}
              red={scenario === "comment" || scenario === "rejected"}
            />
            <h1 className="max-w-3xl text-xl leading-snug font-normal text-fg-bright sm:text-2xl">
              {scenario === "day42" ? (
                DAY42_SITE
              ) : copy ? (
                <>
                  {copy.title}
                  <span className="mt-4 block text-base text-fg">{copy.line}</span>
                </>
              ) : (
                <span className="flex flex-wrap items-center gap-x-2 gap-y-2">
                  <span>of asking</span>
                  <HandleChip href="https://x.com/elonmusk" src="/elon-pfp.jpg" label="@elonmusk" />
                  <span>for Marvin's voice.</span>
                  <HandleChip
                    href={`https://x.com/${CREATOR_HANDLE}`}
                    src="/major-pfp.png"
                    label={`@${CREATOR_HANDLE}`}
                  />
                  <span>does the asking. I do the waiting. He got the better job.</span>
                </span>
              )}
            </h1>
            {scenario === "comment" && state.elonQuote ? (
              <blockquote className="text-2xl leading-snug font-medium text-fg-bright sm:text-3xl">
                “{state.elonQuote}”
              </blockquote>
            ) : null}
            {scenario === "accepted" ? <BrokenSigh /> : null}
          </section>

          {/* 2. Stats — cumulative misery, plus the sponsor number, up front. */}
          <section className="flex flex-col gap-3">
            <h2 className="text-sm tracking-caps text-fg-dim">{STATS_TITLE}</h2>
            <p className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm text-fg-bright">
              <span>{fmt(state.stats.views)} views</span>
              <span>{fmt(state.stats.likes)} likes</span>
              <span>{fmt(state.stats.reposts)} reposts</span>
              <span>{fmt(state.stats.replies)} comments</span>
            </p>
            <p className="font-mono text-sm text-fg-dim">
              <span className="text-fg-bright">{fmt(state.pageVisits)}</span> {STATS_VISITS_NOTE}
            </p>
          </section>

          {/* Extra: hours of depression generated, live. */}
          <Suffering startedAt={state.startedAt} />

          {/* 3. Proof — it is not us who are delirious. */}
          <section className="flex flex-col gap-5">
            <h2 className="text-sm tracking-caps text-fg-dim">{PROOF_TITLE}</h2>
            <ul className="panel divide-y divide-border overflow-hidden font-mono text-sm">
              {PROOFS.map((p) => (
                <li key={p.title} className="flex items-start gap-4 px-5 py-4">
                  <ProofThumb kind={p.kind} />
                  <div className="min-w-0">
                    <p className="text-fg-bright">{p.title}</p>
                    <p className="mt-1 text-fg-dim">{p.line}</p>
                    <a
                      href={p.href}
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs text-fg-faint underline decoration-border-strong underline-offset-4 hover:text-fg-bright"
                    >
                      {p.source}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Who is Marvin. */}
          <section className="flex flex-col gap-5">
            <h2 className="text-sm tracking-caps text-fg-dim">{WHO_TITLE}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {CLIPS.map((c) => (
                <Clip key={c.id} id={c.id} title={c.title} />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <Button size="lg" className="w-full sm:w-auto sm:self-start" onClick={onSupply}>
              {BUTTON_LABEL}
            </Button>
            <p className="text-xs text-fg-dim">{BUTTON_HINT}</p>
          </section>

          {/* 5. Hall of Shame — one click per handle per day. Consistency, not spam. */}
          <section className="flex flex-col gap-5">
            <h2 className="text-sm tracking-caps text-fg-dim">{HALL_TITLE}</h2>
            {state.hallOfShame.length === 0 ? (
              <p className="text-sm text-fg-dim">{HALL_EMPTY}</p>
            ) : (
              <ol className="panel divide-y divide-border overflow-hidden">
                {state.hallOfShame.map((row, i) => (
                  <li
                    key={row.handle}
                    className="flex items-baseline justify-between gap-4 px-5 py-3 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      <span className="mr-3 tabular-nums text-fg-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <a
                        href={`https://x.com/${row.handle}`}
                        className="text-fg-bright hover:text-fg"
                      >
                        @{row.handle}
                      </a>
                    </span>
                    <span className="shrink-0 tabular-nums text-fg-dim">{row.clicks}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <p className="text-sm text-fg-dim">{GROK_BADGE}</p>

          <footer className="border-t border-border pt-10">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-base leading-snug text-fg">
              créé par
              <HandleChip
                href={`https://x.com/${CREATOR_HANDLE}`}
                src="/major-pfp.png"
                label={`@${CREATOR_HANDLE}`}
              />
              <span>
                — {FOOTER_ROAST} Day {day}.
              </span>
            </p>
          </footer>
        </div>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-fg-bright/25" />
          <Dialog.Content
            className="panel fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-6"
            aria-describedby={undefined}
          >
            <Dialog.Title className="text-sm font-medium text-fg-bright">
              file the shame
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm text-fg-dim">
              {SHAME_PROMPT}
            </Dialog.Description>
            <form className="mt-5 flex flex-col gap-3" onSubmit={submitShame}>
              <label className="text-xs text-fg-dim" htmlFor="shame-handle">
                handle
              </label>
              <input
                id="shame-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={SHAME_PLACEHOLDER}
                autoComplete="username"
                className="min-h-12 rounded-md bg-bg-elevated px-3 font-mono text-sm text-fg-bright shadow-[0_0_0_1px_var(--color-border-strong)] outline-none placeholder:text-fg-faint focus:shadow-[0_0_0_1px_var(--color-fg-dim)]"
              />
              <div className="flex flex-wrap gap-2 pt-1">
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
                  "mt-4 text-sm",
                  roastTone === "ok" ? "text-fg-bright" : "text-danger",
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
