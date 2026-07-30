import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyAdminOfCustomLead } from '@/lib/brevo';

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

  return NextResponse.json({ success: true, leadId: lead.id });
}
