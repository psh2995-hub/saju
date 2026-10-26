import { renderShareImage } from "@/lib/share-image";
import { shareSummary } from "@/lib/share";
import { SITE_NAME } from "@/lib/site";
import { getReadingByShareId } from "@/lib/supabase";

/** 공유 카드 이미지. ?format=og 이면 링크 미리보기용, ?download=1 이면 파일로 내려받기. */
export async function GET(request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const reading = await getReadingByShareId(shareId);
  if (!reading) return new Response("not found", { status: 404 });
  const url = new URL(request.url);
  return renderShareImage(shareSummary(reading), {
    og: url.searchParams.get("format") === "og",
    headers: {
      "Cache-Control": "public, max-age=86400, immutable",
      ...(url.searchParams.get("download")
        ? { "Content-Disposition": `attachment; filename="share-${shareId.slice(0, 8)}.png"; filename*=UTF-8''${encodeURIComponent(SITE_NAME)}-${shareId.slice(0, 8)}.png` }
        : {}),
    },
  });
}
