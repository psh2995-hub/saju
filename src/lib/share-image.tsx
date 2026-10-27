import "server-only";
import { ImageResponse } from "next/og";
import { ogFonts } from "./og-fonts";
import { ELEMENT_HEX, type SharePillar, type ShareSummary } from "./share";
import { SITE_NAME_EN } from "./i18n";
import { SITE_NAME } from "./site";

const GOLD = "#ffc000";

function Pillars({ pillars, size }: { pillars: SharePillar[]; size: number }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {pillars.map((p) => (
        <div key={p.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: size * 0.32, color: "#7d7d7d" }}>{p.label}</div>
          {[
            [p.gan, p.ganElement],
            [p.zhi, p.zhiElement],
          ].map(([ch, el]) => (
            <div
              key={ch + el}
              style={{
                display: "flex",
                width: size * 1.6,
                height: size * 1.6,
                alignItems: "center",
                justifyContent: "center",
                background: "#202020",
                fontFamily: "Hanja",
                fontSize: size,
                color: ELEMENT_HEX[el as keyof typeof ELEMENT_HEX],
              }}
            >
              {ch}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** 공유 카드 이미지. og면 링크 미리보기용 1200×630, 아니면 저장용 1080×1350. */
export async function renderShareImage(s: ShareSummary, opts: { og: boolean; headers?: Record<string, string> }) {
  const og = opts.og;
  const width = og ? 1200 : 1080;
  const height = og ? 630 : 1350;

  const siteName = s.lang === "en" ? SITE_NAME_EN : SITE_NAME;
  const [upright, reversed] = s.lang === "en" ? ["upright", "reversed"] : ["정방향", "역방향"];
  const allText = [siteName, s.eyebrow, s.headline, s.hanja ?? "", s.body, ...(s.cards ?? []).flatMap((c) => [c.name, c.position, upright, reversed]), ...(s.pillars ?? []).flatMap((p) => [p.label, p.gan, p.zhi]), ...(s.pillarsB ?? []).flatMap((p) => [p.gan, p.zhi]), "×·—()0123456789"].join("");
  const fonts = await ogFonts(allText);

  const pillarSize = og ? 40 : s.pillarsB ? 46 : 64;
  const image = (
    <div style={{ display: "flex", flexDirection: "column", width, height, background: "#000", color: "#fff", fontFamily: "Sans", padding: og ? 56 : 80 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: og ? 30 : 38, fontWeight: 700 }}>
        <div style={{ display: "flex", width: og ? 30 : 38, height: og ? 30 : 38, border: `4px solid ${GOLD}` }} />
        {siteName}
      </div>
      <div style={{ display: "flex", flexDirection: og ? "row" : "column", flex: 1, gap: og ? 48 : 56, marginTop: og ? 40 : 72 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: og ? 26 : 32, color: GOLD, letterSpacing: 2 }}>{s.eyebrow}</div>
          {s.hanja && <div style={{ fontFamily: "Hanja", fontSize: og ? 76 : 120, marginTop: 16 }}>{s.hanja}</div>}
          <div style={{ fontSize: og ? 38 : 52, marginTop: 16, lineHeight: 1.3 }}>{s.headline}</div>
          <div style={{ fontSize: og ? 24 : 32, marginTop: 24, lineHeight: 1.6, color: "#969696" }}>{s.body}</div>
        </div>
        {s.pillars && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
            <Pillars pillars={s.pillars} size={pillarSize} />
            {s.pillarsB && <Pillars pillars={s.pillarsB} size={pillarSize} />}
          </div>
        )}
        {s.cards && (
          <div style={{ display: "flex", gap: 20 }}>
            {s.cards.map((c) => (
              <div key={c.position} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: og ? 20 : 26, color: GOLD }}>{c.position}</div>
                <div
                  style={{
                    display: "flex",
                    width: og ? 150 : 270,
                    height: og ? 240 : 430,
                    border: `3px solid ${GOLD}`,
                    background: "#181818",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: 12,
                    fontSize: og ? 24 : 36,
                    ...(c.reversed ? { transform: "rotate(180deg)" } : {}),
                  }}
                >
                  {c.name}
                </div>
                <div style={{ fontSize: og ? 18 : 24, color: "#969696" }}>{c.reversed ? reversed : upright}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: og ? 22 : 28, color: "#7d7d7d", marginTop: 24 }}>
        <div>{s.cta.label}</div>
        <div style={{ color: GOLD }}>{siteName}</div>
      </div>
    </div>
  );

  return new ImageResponse(image, { width, height, fonts, headers: opts.headers });
}
