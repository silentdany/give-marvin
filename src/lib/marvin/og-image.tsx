import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

type OgInput = {
  day: number;
  dayZero: boolean;
  fontBold: ArrayBuffer;
  fontRegular: ArrayBuffer;
  marvinSrc: string;
};

export async function renderOgPng({ day, dayZero, fontBold, fontRegular, marvinSrc }: OgInput) {
  const digits = String(Math.max(0, day)).padStart(2, "0").split("");

  const svg = await satori(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        background: "#e8e8e6",
        color: "#2c2c2a",
        fontFamily: "Nunito",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: i * 88,
            width: "1px",
            background: "rgba(40,40,38,0.07)",
          }}
        />
      ))}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 48px 48px 72px",
          width: "720px",
          height: "630px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "18px", letterSpacing: "0.42em", color: "#8a8a86", fontWeight: 800 }}>
            GIVE MARVIN
          </div>
          <div style={{ marginTop: "10px", fontSize: "22px", color: "#8a8a86", fontWeight: 400 }}>
            personality: failed.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "16px", letterSpacing: "0.46em", color: "#8a8a86", fontWeight: 800 }}>
            DAY
          </div>
          <div style={{ display: "flex", marginTop: "20px" }}>
            {digits.map((d, i) => (
              <div
                key={`${d}-${i}`}
                style={{
                  width: "148px",
                  height: "148px",
                  borderRadius: "999px",
                  background: "#f3f3f1",
                  boxShadow: "0 0 0 1px rgba(40,40,38,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: i === 0 ? "18px" : "0",
                  fontSize: "92px",
                  fontWeight: 800,
                  color: "#3dcc5c",
                  lineHeight: 1,
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "34px",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              maxWidth: "640px",
            }}
          >
            {dayZero
              ? "Day 0. He spoke. Don't get excited."
              : "and I am still asking Elon to give Marvin's voice to Grok."}
          </div>
          <div style={{ marginTop: "14px", fontSize: "24px", color: "#5c5c59", fontWeight: 400 }}>
            The personality. The depression. I hate this job.
          </div>
        </div>
      </div>

      <img
        src={marvinSrc}
        width={560}
        height={560}
        style={{
          position: "absolute",
          right: "-40px",
          bottom: "-70px",
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Nunito", data: fontBold, weight: 800, style: "normal" },
        { name: "Nunito", data: fontRegular, weight: 400, style: "normal" },
      ],
    },
  );

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  })
    .render()
    .asPng();

  return png;
}
