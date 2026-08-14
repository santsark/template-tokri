import { PolicyPage } from '@/components/PolicyPage';

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>Template Tokri ("we," "us," "our") operates this Site. This policy explains what personal data we collect, why, and what rights you have — under India's Digital Personal Data Protection (DPDP) Act, 2023.</p>

      <h2>What we collect</h2>
      <p>Contact details (name, phone, email), order details (products, personalisation inputs, reference images), and communications you send us. We do <strong>not</strong> collect or store your card/UPI details — those are handled directly by Razorpay.</p>

      <h2>Why we collect it</h2>
      <p>To fulfil your order, respond to custom requests, communicate with you about your order, and improve the Site. We only use data for the purpose it was collected.</p>

      <h2>Who we share it with</h2>
      <p>Razorpay (payments), Brevo (order/notification emails), and Vercel/Neon (secure hosting and database). We never sell your data.</p>

      <h2>Your rights</h2>
      <p>Under the DPDP Act, you can request access, correction, or deletion of your data, and withdraw consent at any time. Contact our Grievance Officer below — we aim to resolve requests within 7 days.</p>

      <h2>Grievance Officer</h2>
      <p>Name: [FILL IN]<br/>Email: [FILL IN]<br/>Postal address: [FILL IN]</p>

      <h2>International visitors</h2>
      <p>While anyone can order from Template Tokri, our business and data processing are based in India, and this policy is governed by Indian law.</p>

      <h2>Contact us</h2>
      <p>For privacy questions: [FILL IN email/phone]</p>
    </PolicyPage>
  );
}
