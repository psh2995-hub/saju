import type { Metadata } from "next";
import { EnGunghapForm } from "@/components/en/forms";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "K-Compatibility",
  description: "Korean compatibility (gunghap): two Four Pillars read side by side — attraction, friction and the years ahead.",
};

export default function CompatibilityPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <PageHeader eyebrow="K-COMPATIBILITY" title="Are we a match, the Korean way?">
        In Korea, couples check their gunghap (궁합) — how two birth charts fit together. Enter both birthdays to see what draws you together and
        where you might clash, free. Please only enter someone else&apos;s details with their consent.
      </PageHeader>
      <EnGunghapForm />
    </div>
  );
}
