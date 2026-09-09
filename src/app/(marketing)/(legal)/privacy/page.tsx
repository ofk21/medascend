import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy policy</h1>
      <p><em>Last updated: 1 September 2026</em></p>
      <p>{BRAND.name} (“we”, “us”) respects your privacy. This policy explains what personal data we collect, why, and your rights.</p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data</strong> – name, email address and a hashed password.</li>
        <li><strong>Learning data</strong> – questions answered, scores, flags, notes and session history, used to power your analytics.</li>
        <li><strong>Payment data</strong> – processed by our payment provider (Stripe). We never see or store full card numbers.</li>
        <li><strong>Technical data</strong> – IP address, browser type and pages visited, for security and to keep the service running.</li>
      </ul>
      <h2>How we use it</h2>
      <p>To provide the service, personalise your revision analytics, process payments, respond to support requests and improve our content. Aggregated, anonymised performance statistics (e.g. the percentage of users who answer a question correctly) are shown to other users; these never identify you.</p>
      <h2>Legal basis</h2>
      <p>Performance of our contract with you, our legitimate interest in improving the service, and your consent where required (e.g. marketing emails, which you can withdraw at any time).</p>
      <h2>Sharing</h2>
      <p>We share data only with processors necessary to run the service (hosting, database, payments, email delivery) under data-processing agreements. We do not sell personal data.</p>
      <h2>Retention</h2>
      <p>Account and learning data are kept while your account exists and for up to 24 months afterwards, unless you ask us to delete them sooner.</p>
      <h2>Your rights</h2>
      <p>You may access, correct, export or delete your personal data, and object to or restrict processing. Contact <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>. You may also complain to your local data-protection authority.</p>
      <h2>Cookies</h2>
      <p>We use a strictly necessary session cookie to keep you logged in and a preference cookie to remember your theme. We do not use third-party advertising cookies.</p>
    </>
  );
}
