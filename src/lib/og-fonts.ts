import "server-only";

/**
 * 공유 이미지에 쓸 글꼴을 Google Fonts에서 필요한 글자만 잘라 받아 온다.
 * User-Agent 없이 요청하면 Satori가 읽을 수 있는 TrueType으로 내려 준다.
 */
async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`글꼴을 불러오지 못했습니다: ${family}`);
  return (await fetch(src)).arrayBuffer();
}

export async function ogFonts(text: string) {
  const unique = [...new Set(text)].join("");
  const [regular, bold, hanja] = await Promise.all([
    loadGoogleFont("Noto Sans KR", 400, unique),
    loadGoogleFont("Noto Sans KR", 700, unique),
    loadGoogleFont("Noto Serif KR", 700, unique),
  ]);
  return [
    { name: "Sans", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Sans", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Hanja", data: hanja, weight: 700 as const, style: "normal" as const },
  ];
}
