import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { formatPrice, SITE_NAME_EN } from "@/lib/i18n";
import { FOLLOWUP_PRICE_USD, PRICES_USD, PRODUCT_NAMES_EN, type ReadingKind } from "@/lib/products";
import { BUSINESS } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service" };

const PENDING = "to be announced";

export default function EnTermsPage() {
  const company = BUSINESS.companyName ?? SITE_NAME_EN;
  const prices = (Object.keys(PRICES_USD) as ReadingKind[]).map((k) => `${PRODUCT_NAMES_EN[k]} ${formatPrice(PRICES_USD[k], "en", "USD")}`);
  return (
    <LegalPage title="Terms of Service" effectiveDate="November 1, 2026" lang="en">
      <p className="mt-4 text-xs">
        This is an English translation of our Korean Terms of Service. If the two versions differ, the Korean version prevails.
      </p>

      <h2>1. Purpose</h2>
      <p>
        These terms set out the conditions, procedures, rights, obligations and responsibilities that apply when you use the saju (Korean
        astrology), tarot and zodiac reading content offered on {SITE_NAME_EN} (the &quot;Service&quot;), operated by {company} (the
        &quot;Company&quot;).
      </p>

      <h2>2. Definitions</h2>
      <ol>
        <li>&quot;User&quot; means anyone who uses the Service under these terms.</li>
        <li>
          &quot;Free content&quot; means content provided at no charge, such as birth charts, five-element balance, luck cycles, basic tarot card
          meanings and zodiac birth charts.
        </li>
        <li>
          &quot;Paid content&quot; means digital content provided after payment, such as in-depth birth chart, compatibility, yearly forecast and
          zodiac readings, in-depth tarot readings, and follow-up answers.
        </li>
      </ol>

      <h2>3. Posting and changes</h2>
      <ol>
        <li>The Company posts these terms on the Service.</li>
        <li>
          The Company may change these terms within the limits of applicable law, and will announce changes on the Service at least 7 days before
          they take effect (30 days for changes unfavorable to users).
        </li>
      </ol>

      <h2>4. The Service</h2>
      <ol>
        <li>The Company provides reading content based on the birth date, time, place, gender and questions you enter.</li>
        <li>Paid content is written by artificial intelligence (AI) drawing on Korean astrology, tarot and Western astrology. We tell you this before payment.</li>
        <li>
          All readings are for entertainment and reflection. They do not guarantee the future and do not replace professional medical, legal, tax
          or financial advice.
        </li>
      </ol>

      <h2>5. Use and restrictions</h2>
      <ol>
        <li>No sign-up is needed. An agreement is formed when you request a reading and the Company provides the result.</li>
        <li>
          If you are under the age of majority where you live, you need a parent or guardian&apos;s consent to buy paid content; without it, you
          or your guardian may cancel the purchase.
        </li>
        <li>We may restrict use by anyone who uses another person&apos;s payment method or disrupts the Service.</li>
      </ol>

      <h2>6. Prices and payment</h2>
      <ol>
        <li>
          Prices are shown on each payment screen. Current prices: {prices.join(", ")}, and follow-up questions{" "}
          {formatPrice(FOLLOWUP_PRICE_USD, "en", "USD")} each.
        </li>
        <li>Payment is processed by our payment partners. Depending on the payment method, the charge may be processed in Korean won (KRW).</li>
      </ol>

      <h2>7. Delivery</h2>
      <ol>
        <li>Paid content starts being written as soon as payment completes and usually appears on your result page within 1–3 minutes.</li>
        <li>You can reopen your reading at its result page URL, which we keep available for one year from creation.</li>
        <li>Anyone who knows the result page URL can open it, so please keep it private.</li>
        <li>Share links and images created with &quot;Share my result&quot; contain only the free summary, without names, birth dates or questions.</li>
      </ol>

      <h2>8. Cancellations and refunds</h2>
      <p>Cancellations and refunds follow our separate Refund Policy.</p>

      <h2>9. Company obligations</h2>
      <ol>
        <li>The Company complies with applicable law and these terms and works to provide the Service reliably.</li>
        <li>The Company protects your personal information under its Privacy Policy.</li>
      </ol>

      <h2>10. User obligations</h2>
      <ol>
        <li>Please enter accurate information; the Company is not responsible for results based on incorrect input.</li>
        <li>You may not copy, distribute or sell paid content for commercial purposes without the Company&apos;s consent.</li>
      </ol>

      <h2>11. Limitation of liability</h2>
      <ol>
        <li>Readings are for reference. You are responsible for decisions you make based on them.</li>
        <li>The Company is not liable for interruptions it did not cause, such as natural disasters or network failures.</li>
      </ol>

      <h2>12. Disputes</h2>
      <ol>
        <li>
          You can send complaints or feedback to {BUSINESS.email ?? PENDING}, and we will handle them without delay.
        </li>
        <li>These terms are governed by the laws of the Republic of Korea, and the competent court is determined by the Korean Civil Procedure Act.</li>
      </ol>
    </LegalPage>
  );
}
