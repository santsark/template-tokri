import { BrevoClient } from '@getbrevo/brevo';

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

export async function sendEmail(params: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}) {
  return brevo.transactionalEmails.sendTransacEmail({
    sender: {
      email: process.env.BREVO_SENDER_EMAIL!,
      name: process.env.BREVO_SENDER_NAME || 'Template Tokri'
    },
    to: params.to,
    subject: params.subject,
    htmlContent: params.htmlContent
  });
}

export async function notifyAdminOfNewOrder(orderSummary: string) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;
  return sendEmail({
    to: [{ email: adminEmail }],
    subject: 'New order received — Template Tokri',
    htmlContent: `<p>${orderSummary}</p>`
  });
}

export async function notifyAdminOfCustomLead(leadSummary: string) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;
  return sendEmail({
    to: [{ email: adminEmail }],
    subject: 'New custom order request — Template Tokri',
    htmlContent: `<p>${leadSummary}</p>`
  });
}