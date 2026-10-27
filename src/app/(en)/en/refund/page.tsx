import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BUSINESS } from "@/lib/site";

export const metadata: Metadata = { title: "Refund Policy" };

const PENDING = "to be announced";

export default function EnRefundPage() {
  return (
    <LegalPage title="Refund Policy" effectiveDate="November 1, 2026" lang="en">
      <p className="mt-4 text-xs">This is an English translation of our Korean Refund Policy. If the two versions differ, the Korean version prevails.</p>

      <h2>1. Digital content cannot be cancelled once writing starts</h2>
      <p>
        A paid reading is digital content written for you alone as soon as you pay. Under Article 17(2)(5) of the Korean Act on Consumer
        Protection in Electronic Commerce, we tell you this on the payment screen and ask for your consent, and once writing has started, the
        purchase can no longer be cancelled.
      </p>

      <h2>2. When we give a full refund</h2>
      <p>Ask within 7 days of payment and we will refund you in full if:</p>
      <ul>
        <li>a system error prevented your reading from being written, and &quot;Try again&quot; didn&apos;t fix it</li>
        <li>you were charged twice for the same reading (for the duplicate charge)</li>
        <li>the reading differs substantially from what was described, or most of it is missing</li>
        <li>a minor paid without a parent or guardian&apos;s consent and the purchase is being cancelled</li>
      </ul>
      <p>
        If the content differs from how it was described or advertised, you may cancel within 3 months of receiving it, and within 30 days of when
        you knew or could have known about it.
      </p>

      <h2>3. When refunds are not possible</h2>
      <ul>
        <li>a change of mind, such as the reading not matching your expectations</li>
        <li>a reading based on an incorrect birth date, time or place that you entered</li>
      </ul>

      <h2>4. How to request a refund</h2>
      <ol>
        <li>Email {BUSINESS.email ?? PENDING} with your result page URL, payment date and the reason.</li>
        <li>We will reply within 3 business days.</li>
        <li>
          Approved refunds are cancelled back to your payment method; it can take 3–7 business days to appear, depending on your card issuer.
          Refunded readings can no longer be opened.
        </li>
      </ol>
    </LegalPage>
  );
}
