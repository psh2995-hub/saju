import Link from "next/link";
import { Eyebrow, ghostButtonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-24 text-center">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-4 text-[32px] text-ink">This path isn&apos;t in the stars</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">The page may have moved, or it never existed.</p>
      <Link href="/en" className={`${ghostButtonClass} mt-10`}>
        Back to home
      </Link>
    </div>
  );
}
