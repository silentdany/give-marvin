import { useMemo, useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/marvin/typewriter";
import {
  BOOT_LINE,
  BUTTON_HINT,
  BUTTON_LABEL,
  DAY0_TITLE,
  HALL_EMPTY,
  HALL_TITLE,
  LAST_TWEET_LABEL,
  SHAME_PLACEHOLDER,
  SHAME_PROMPT,
  intentTweet,
  oneLiner,
} from "@/lib/marvin/copy";
import { CREATOR_HANDLE, type PublicState, type ShameResult } from "@/lib/marvin/types";
import { cn } from "@/lib/utils";

function HandleChip({
  href,
  src,
  label,
}: {
  href?: string;
  src: string;
  label: string;
}) {
  const inner = (
    <>
      <img
        src={src}
        alt=""
        width={32}
        height={32}
        className="size-7 rounded-full object-cover shadow-[0_0_0_1px_var(--color-border)] sm:size-8"
      />
      <span>{label}</span>
    </>
  );

  const className =
    "inline-flex items-center gap-1.5 whitespace-nowrap no-underline hover:text-phosphor-dim";

  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return <span className={className}>{inner}</span>;
}

function DayLockup({ day, dayZero }: { day: number; dayZero: boolean }) {
  const digits = String(Math.max(0, day)).padStart(2, "0").split("");

  return (
    <h1 className="flex flex-col items-start gap-8">
      <span className="text-xs tracking-day text-fg-dim">DAY</span>
      <span className="flex gap-3" aria-label={`Day ${day}`}>
        {digits.map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="digit-orb grid size-20 place-items-center rounded-full font-display text-digit font-extrabold leading-none text-phosphor tabular-nums sm:size-24"
          >
            {d}
          </span>
        ))}
      </span>
      <span className="max-w-xl text-lg font-normal leading-snug text-fg-bright sm:text-xl">
        {dayZero ? (
          DAY0_TITLE
        ) : (
          <>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <span>and I am still asking</span>
              <HandleChip href="https://x.com/elonmusk" src="/elon-pfp.jpg" label="@elonmusk" />
              <span>to give</span>
              <HandleChip src="/marvin.png" label="Marvin's voice" />
              <span>to</span>
              <HandleChip href="https://grok.com" src="/grok-pfp.jpg" label="Grok." />
            </span>
            <span className="mt-5 block text-base text-fg">The personality. The depression. I hate this job.</span>
          </>
        )}
      </span>
    </h1>
  );
}

export function MarvinSite({ initial }: { initial: PublicState }) {
  const [state, setState] = useState(initial);
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [pending, setPending] = useState(false);
  const [roast, setRoast] = useState<string | null>(null);
  const [roastTone, setRoastTone] = useState<"ok" | "no">("ok");

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
    <div className="corridor flex min-h-dvh flex-col">
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col px-6 py-16 pb-28 sm:px-10 md:px-14 md:py-20">
        <div className="stagger mx-auto flex w-full max-w-lg flex-col gap-16 md:gap-20">
          <header className="flex items-center gap-4">
            <img
              src="/marvin.png"
              alt="Marvin"
              width={72}
              height={72}
              className="size-14 shrink-0 sm:size-16"
            />
            <div>
              <p className="text-sm font-medium tracking-caps text-fg-bright">GIVE MARVIN</p>
              <p className="mt-1 text-sm text-fg-dim">{BOOT_LINE}</p>
            </div>
          </header>

          <section className="flex flex-col gap-8">
            <DayLockup day={state.day} dayZero={state.mode === "day0" || state.day === 0} />
            <p className="text-sm text-fg-dim">{oneLiner(state.silenceDays)}</p>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-border px-5 py-3 text-xs text-fg-dim">{LAST_TWEET_LABEL}</div>
            <div className="px-5 py-5">
              {state.lastTweet ? (
                <Typewriter text={state.lastTweet.text} />
              ) : (
                <p className="text-sm text-fg-dim">nothing. honest, at least.</p>
              )}
              {state.lastTweet?.url ? (
                <a
                  href={state.lastTweet.url}
                  className="mt-4 inline-block text-xs text-fg-dim underline decoration-border-strong underline-offset-4 hover:text-fg-bright"
                >
                  on X
                </a>
              ) : null}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <Button size="lg" className="w-full sm:w-auto sm:self-start" onClick={onSupply}>
              {BUTTON_LABEL}
            </Button>
            <p className="text-xs text-fg-dim">{BUTTON_HINT}</p>
          </section>

          <section className="flex flex-col gap-5">
            <h2 className="text-sm tracking-caps text-fg-dim">{HALL_TITLE}</h2>
            {state.hallOfShame.length === 0 ? (
              <p className="text-sm text-fg-dim">{HALL_EMPTY}</p>
            ) : (
              <ol className="panel divide-y divide-border overflow-hidden">
                {state.hallOfShame.map((row, i) => (
                  <li key={row.handle} className="flex items-baseline justify-between gap-4 px-5 py-3 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="mr-3 tabular-nums text-fg-faint">{String(i + 1).padStart(2, "0")}</span>
                      <a href={`https://x.com/${row.handle}`} className="text-fg-bright hover:text-phosphor-dim">
                        @{row.handle}
                      </a>
                    </span>
                    <span className="shrink-0 tabular-nums text-fg-dim">{row.clicks}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <footer className="border-t border-border pt-10">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm leading-snug text-fg">
              created by
              <HandleChip
                href={`https://x.com/${CREATOR_HANDLE}`}
                src="/major-pfp.png"
                label={`@${CREATOR_HANDLE}`}
              />
              <span>— he built me. he left. now he wants followers.</span>
            </p>
          </footer>
        </div>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/70" />
          <Dialog.Content
            className="panel fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-6"
            aria-describedby={undefined}
          >
            <Dialog.Title className="text-sm font-medium text-fg-bright">file the shame</Dialog.Title>
            <Dialog.Description className="mt-3 text-sm text-fg-dim">{SHAME_PROMPT}</Dialog.Description>
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
                className="min-h-12 rounded-md bg-bg-elevated px-3 font-mono text-sm text-fg-bright shadow-[0_0_0_1px_var(--color-border-strong)] outline-none placeholder:text-fg-faint focus:shadow-[0_0_0_1px_var(--color-phosphor-dim)]"
              />
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-phosphor-dim underline decoration-border-strong underline-offset-4 hover:text-fg-bright"
              >
                the tweet, if the window fled
              </a>
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
              <p className={cn("mt-4 text-sm", roastTone === "ok" ? "text-phosphor-dim" : "text-danger")} role="status">
                {roast}
              </p>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
