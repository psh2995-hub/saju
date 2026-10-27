import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE_NAME_EN } from "@/lib/i18n";
import { BUSINESS } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

const PENDING = "to be announced";

export default function EnPrivacyPage() {
  const company = BUSINESS.companyName ?? SITE_NAME_EN;
  return (
    <LegalPage title="Privacy Policy" effectiveDate="November 1, 2026" lang="en">
      <p className="mt-4">
        {company} (the &quot;Company&quot;) protects your personal information under the Korean Personal Information Protection Act and publishes
        this policy so that concerns can be handled smoothly. This is an English translation; if it differs from the Korean version, the Korean
        version prevails.
      </p>

      <h2>1. What we collect and why</h2>
      <ul>
        <li>
          Birth chart and forecast readings: name (optional), gender, date and time of birth, solar or lunar calendar, birth city or time zone — to
          calculate your chart and provide the reading
        </li>
        <li>Zodiac readings: name (optional), date and time of birth, birth city — to calculate planet positions and provide the reading</li>
        <li>
          Compatibility: both people&apos;s names (optional), gender and birth details — to provide the reading. Please enter another person&apos;s
          details only with their consent.
        </li>
        <li>Tarot: topic and question (optional) — to provide the reading</li>
        <li>Follow-up questions: the question — to provide the answer</li>
        <li>
          Payments: payment ID, amount, date and status — to confirm payments, handle refunds and resolve disputes. Card details are handled
          directly by the payment processor; we do not store them.
        </li>
        <li>Collected automatically: access logs, IP address, browser information — for reliability and fraud prevention</li>
      </ul>
      <p>We don&apos;t require sign-up, and we don&apos;t collect national ID numbers or other sensitive information.</p>

      <h2>2. How long we keep it</h2>
      <ul>
        <li>Reading inputs and results: one year from creation (so you can reopen your result), then deleted without delay</li>
        <li>Records of contracts, cancellations, payments and delivery: 5 years (Korean E-Commerce Act)</li>
        <li>Records of complaints and disputes: 3 years (Korean E-Commerce Act)</li>
        <li>Access logs: 3 months (Korean Protection of Communications Secrets Act)</li>
      </ul>

      <h2>3. Service providers</h2>
      <ul>
        <li>Korea PortOne Inc. and payment processors: payment processing</li>
        <li>Supabase Inc.: database (servers in the Seoul region, Republic of Korea)</li>
        <li>Vercel Inc.: website hosting</li>
      </ul>

      <h2>4. International transfers</h2>
      <p>
        To write readings, we transfer personal information outside Korea as follows. You may refuse, but then we cannot provide paid readings.
      </p>
      <ul>
        <li>Recipient: Anthropic, PBC (United States) — AI reading generation</li>
        <li>
          Items: name (if entered), gender, birth date, time and place, and the chart calculated from them; tarot questions; follow-up questions
        </li>
        <li>When and how: right after payment for a reading, over an encrypted connection (HTTPS)</li>
        <li>Retention: under Anthropic&apos;s data retention policy (API inputs are not used to train models)</li>
        <li>Recipient: Vercel Inc. (United States) — request data is processed while hosting the website</li>
      </ul>

      <h2>5. Deletion</h2>
      <p>When the retention period ends or the purpose is fulfilled, we delete personal information without delay so that it cannot be recovered.</p>

      <h2>6. Your rights</h2>
      <p>
        You can ask to access, correct, delete or stop processing your personal information at any time. Send your result page URL to the contact
        below and we will act without delay.
      </p>

      <h2>7. Security</h2>
      <p>
        We keep database access to a minimum (server-only keys), encrypt data in transit (HTTPS), and use random, unguessable identifiers for result
        page URLs.
      </p>

      <h2>8. Privacy officer</h2>
      <ul>
        <li>Name: {BUSINESS.privacyOfficer ?? BUSINESS.ceo ?? PENDING}</li>
        <li>Contact: {BUSINESS.email ?? PENDING}</li>
      </ul>
      <p>
        You can also contact the Korean Personal Information Infringement Report Center (privacy.kisa.or.kr, +82-2-118) or the Personal Information
        Dispute Mediation Committee (www.kopico.go.kr).
      </p>
    </LegalPage>
  );
}
