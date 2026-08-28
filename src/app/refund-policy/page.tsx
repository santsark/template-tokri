import { PolicyPage } from '@/components/PolicyPage';

export default function RefundPolicyPage() {
  return (
    <PolicyPage title="Refund Policy">
      <h2>Ready-made Templates (Track A)</h2>
      <p>All sales of ready-made templates are final and non-refundable once personalisation work has begun, except where you received a corrupted/unusable file, a duplicate charge, or the wrong product entirely.</p>
      <p>Refunds are not available for change of mind after purchase, or difficulty editing/using the file (we're happy to help — contact us).</p>
      <p><strong>How to request:</strong> Email us within 2 days of purchase with your order ID.</p>

      <h2>Custom Design Orders (Track B)</h2>
      <p>An advance payment (full or partial, as agreed) is required to begin work.</p>
      <ul>
        <li>Before design work begins: full advance refund available, minus any payment gateway fee already incurred.</li>
        <li>After a first draft has been shared: the advance becomes non-refundable, since it covers design time already spent.</li>
        <li>After final files are delivered: no refund, as the work is complete and unique to your order.</li>
      </ul>
      <p>2 rounds of revisions are included; additional revisions may carry an extra charge, communicated before starting.</p>

      <h2>General</h2>
      <p>Refunds are issued to the original payment method via Razorpay. Processing typically takes 7 business days, depending on your bank/UPI provider.</p>

      <h2>Contact us</h2>
      <p>For any refund questions: hello@templatetokri.in</p>
    </PolicyPage>
  );
}