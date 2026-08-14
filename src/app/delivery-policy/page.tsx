import { PolicyPage } from '@/components/PolicyPage';

export default function DeliveryPolicyPage() {
  return (
    <PolicyPage title="Delivery Policy">
      <h2>Ready-made Templates (Track A)</h2>
      <p>These are personalised with the details you provide (names, dates, wording) and delivered digitally within <strong>24–48 hours</strong> of payment and receiving your inputs.</p>
      <p>Once ready, your file(s) will be emailed to the address provided at checkout, as a secure download link. This link stays active for 7 days — please save your file within that window. If it expires, contact us and we'll resend it.</p>

      <h2>Custom Design Orders (Track B)</h2>
      <p>First draft is typically delivered within [FILL IN — e.g. 3–5 business days] of receiving the advance payment and all required details. During peak seasons (e.g. Durga Puja, wedding season) we'll proactively inform you of any longer timeline.</p>
      <p>Final files are sent via email after final payment is received.</p>

      <h2>General</h2>
      <p>All products are currently delivered digitally — we do not currently offer physical/printed delivery. Orders are only processed once payment is confirmed via Razorpay.</p>
    </PolicyPage>
  );
}