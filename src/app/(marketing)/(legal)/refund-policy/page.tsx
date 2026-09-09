import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = { title: "Refund policy" };

export default function RefundPage() {
  return (
    <>
      <h1>Refund & cancellation policy</h1>
      <p><em>Last updated: 1 September 2026</em></p>
      <h2>Free trial</h2>
      <p>Every new account receives a free 48-hour trial so you can evaluate the platform before paying. No card details are taken.</p>
      <h2>7-day guarantee</h2>
      <p>If you purchase a plan and are not satisfied, you may request a full refund within <strong>7 days of purchase</strong> provided you have answered fewer than <strong>50 questions</strong> and have not completed a past paper or mock exam. Email <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a> from your account email address.</p>
      <h2>After 7 days</h2>
      <p>Refunds are not normally available after 7 days or once significant use has occurred, because the digital content has been delivered. We will consider exceptional circumstances (e.g. documented illness preventing you from sitting the exam) on a case-by-case basis.</p>
      <h2>Cancellation</h2>
      <p>Plans do not renew automatically, so there is nothing to cancel. Your access simply ends on the expiry date shown in your account.</p>
      <h2>Processing</h2>
      <p>Approved refunds are returned to the original payment method within 5–10 working days.</p>
    </>
  );
}
