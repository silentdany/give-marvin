import { useEffect, useState } from "react";

export function Typewriter({ text, active = true }: { text: string; active?: boolean }) {
  const [n, setN] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setN(0);
  }, [text]);

  useEffect(() => {
    if (!active || reduce) return;
    if (n >= text.length) return;
    const step = text[n] === "\n" ? 70 : 18;
    const t = window.setTimeout(() => setN((v) => v + 1), step);
    return () => window.clearTimeout(t);
  }, [active, n, reduce, text]);

  const shown = reduce || !active ? text : text.slice(0, n);
  const done = reduce || n >= text.length;

  return (
    <pre className="m-0 whitespace-pre-wrap break-words font-mono text-sm leading-normal text-fg-bright md:text-base">
      {shown}
      <span className="cursor-block" aria-hidden="true" data-done={done ? "1" : "0"} />
    </pre>
  );
}
