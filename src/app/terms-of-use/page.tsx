import { PolicyPage } from '@/components/PolicyPage';

export default function TermsOfUsePage() {
  return (
    <PolicyPage title="Terms of Use">
      <p>By using this Site or placing an order, you agree to these Terms. You must be 18 or older, or supervised by a parent/guardian, to place an order.</p>

      <h2>What we offer</h2>
      <p><strong>Track A — Quick-Edit Templates:</strong> personalised with your details, delivered within 24–48 hours. <strong>Track B — Custom Design:</strong> fully custom work, timeline and pricing confirmed individually.</p>

      <h2>Orders and payment</h2>
      <p>Orders are confirmed once payment is processed via Razorpay. You're responsible for the accuracy of details you submit (names, dates, uploaded content) — we personalise based exactly on what you provide.</p>

      <h2>Your content</h2>
      <p>If you upload images or text, you confirm you own the rights to use them, and grant us a limited license to use them solely to create your order. We don't reuse your content for any other purpose.</p>

      <h2>Intellectual property</h2>
      <p>Our template designs are protected by copyright. Purchasing a template gives you a license to use the personalised file for your own event/purpose — not to resell, redistribute, or repurpose the designs as your own product.</p>

      <h2>Limitation of liability</h2>
      <p>Our total liability for any order-related claim is limited to the amount paid for that order. This doesn't limit any liability that can't be excluded under Indian law.</p>

      <h2>Governing law</h2>
      <p>These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts in [FILL IN — jurisdiction city].</p>

      <h2>Contact us</h2>
      <p>For questions about these Terms: [FILL IN email/phone]</p>
    </PolicyPage>
  );
}