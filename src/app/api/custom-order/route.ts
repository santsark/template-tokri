import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyAdminOfCustomLead, sendEmail } from '@/lib/brevo';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, phone, email, preferredLanguage, occasion, occasionDetails, freeText, referenceFileUrl } = body;

  if (!name || !phone || !occasion) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const lead = await prisma.customOrderLead.create({
    data: { name, phone, email, preferredLanguage, occasion, occasionDetails, freeText, referenceFileUrl }
  });

  await notifyAdminOfCustomLead(
    `New ${occasion} request from ${name} (${phone}). Details: ${freeText || 'see occasion fields'}`
  );

  if (email) {
    await sendEmail({
      to: [{ email, name }],
      subject: 'We received your custom order request — Template Tokri',
      htmlContent: `<p>Hi ${name},</p><p>Thanks for reaching out about your ${occasion.toLowerCase()} design! Our team has received your request and will get back to you within a day with next steps and a quote.</p><p>If anything's urgent, feel free to WhatsApp us directly.</p><p>— Team Template Tokri</p>`
    });
  }

  return NextResponse.json({ success: true, leadId: lead.id });
}
