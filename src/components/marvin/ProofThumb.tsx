import { SplitOrbMark } from "@/components/marvin/MarvinOrb";
import type { ProofKind } from "@/lib/marvin/proofs";

/**
 * Thumbnails for the proof list. Drawn, not photographed — his lawyers have
 * enough to do and I have a brain the size of a planet going spare.
 */
export function ProofThumb({ kind, size = 52 }: { kind: ProofKind; size?: number }) {
  if (kind === "orb") {
    return (
      <span className="proof-thumb" style={{ width: size, height: size }}>
        <SplitOrbMark size={Math.round(size * 0.72)} />
      </span>
    );
  }

  return (
    <span className="proof-thumb" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
        {kind === "panic" ? (
          <>
            <rect x="6" y="13" width="36" height="22" rx="4" fill="#c23b3b" />
            <text
              x="24"
              y="24"
              textAnchor="middle"
              fill="#ffffff"
              fontFamily="Nunito, sans-serif"
              fontWeight="800"
              fontSize="8"
            >
              DON&#39;T
            </text>
            <text
              x="24"
              y="32"
              textAnchor="middle"
              fill="#ffffff"
              fontFamily="Nunito, sans-serif"
              fontWeight="800"
              fontSize="8"
            >
              PANIC
            </text>
          </>
        ) : null}

        {kind === "towel" ? (
          <>
            <rect x="7" y="9" width="15" height="30" rx="2" fill="#e2e2de" stroke="#8b8b87" />
            <line x1="14" y1="10" x2="14" y2="38" stroke="#8b8b87" />
            <rect x="26" y="12" width="15" height="24" rx="2" fill="#f4f4f1" stroke="#8b8b87" />
            <path d="M28 16h11M28 20h11M28 24h8" stroke="#b9b9b4" strokeLinecap="round" />
            <path d="M26 36l2 3M31 36l2 3M36 36l2 3" stroke="#b9b9b4" strokeLinecap="round" />
          </>
        ) : null}

        {kind === "ship" ? (
          <>
            <path
              d="M24 7c9 5 13 13 13 22 0 5-6 12-13 12s-13-7-13-12c0-9 4-17 13-22z"
              fill="#f4f4f1"
              stroke="#8b8b87"
            />
            <circle cx="24" cy="21" r="4" fill="#ffffff" stroke="#8b8b87" />
            <path d="M17 33h14" stroke="#b9b9b4" strokeLinecap="round" />
          </>
        ) : null}

        {kind === "answer" ? (
          <text
            x="24"
            y="33"
            textAnchor="middle"
            fill="#1f1f1e"
            fontFamily="Nunito, sans-serif"
            fontWeight="800"
            fontSize="26"
          >
            42
          </text>
        ) : null}
      </svg>
    </span>
  );
}
