import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <>
      <h1>Terms of service</h1>
      <p><em>Last updated: 1 September 2026</em></p>
      <h2>1. The service</h2>
      <p>{BRAND.name} provides online revision materials for the MRCP(UK) Part 1 examination. Access is granted for the period purchased or, for trial accounts, for the trial duration.</p>
      <h2>2. Your account</h2>
      <p>Accounts are personal and non-transferable. You must keep your password confidential. Sharing an account or reproducing our content is a breach of these terms and may result in termination without refund.</p>
      <h2>3. Intellectual property</h2>
      <p>All questions, explanations, textbook content, software and design are owned by {BRAND.name} or its licensors and protected by copyright. You may use them only for your personal revision.</p>
      <h2>4. Payments</h2>
      <p>Plans are one-off purchases and do not auto-renew. Prices include VAT where applicable. Refunds are governed by our refund policy.</p>
      <h2>5. Medical content</h2>
      <p>Content is written for examination revision and is not a substitute for clinical judgement, local protocols or official guidance. Always verify before applying anything to patient care.</p>
      <h2>6. Availability</h2>
      <p>We aim for 99.9% uptime but cannot guarantee uninterrupted access. Planned maintenance will be announced where possible.</p>
      <h2>7. Liability</h2>
      <p>To the extent permitted by law, our liability is limited to the amount you paid for the service in the 12 months before the claim. Nothing in these terms limits liability for death, personal injury or fraud.</p>
      <h2>8. Changes</h2>
      <p>We may update these terms; material changes will be notified by email or in the app. Continued use constitutes acceptance.</p>
      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of England and Wales.</p>
    </>
  );
}
