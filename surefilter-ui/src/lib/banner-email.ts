import 'server-only';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { prisma } from './prisma';
import { getFormNotificationFromEmail } from './site-settings';

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://surefilter.us';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmails(emailStr: string): string[] {
  return emailStr
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && EMAIL_REGEX.test(e));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface BuildArgs {
  bannerName: string;
  email: string;
  pageUrl: string | null;
  utmParams: Record<string, string> | null;
  referer: string | null;
  ip: string | null;
  submittedAt: string;
}

function buildBannerLeadEmail(args: BuildArgs): { subject: string; html: string; text: string } {
  const { bannerName, email, pageUrl, utmParams, referer, ip, submittedAt } = args;
  const subject = `SURE FILTER — New Lead from "${bannerName}" Banner`;

  const utmRows = utmParams
    ? Object.entries(utmParams)
        .map(([k, v]) => `<tr><td style="padding:6px 14px;color:#475569;font-size:13px;">${escapeHtml(k)}</td><td style="padding:6px 14px;color:#0f172a;font-size:13px;">${escapeHtml(v)}</td></tr>`)
        .join('')
    : '';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <table align="center" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;margin:24px auto;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#1e3a5f;padding:24px 32px;color:#ffffff;">
      <h1 style="margin:0;font-size:20px;">New Banner Lead</h1>
      <p style="margin:6px 0 0;font-size:14px;color:#cbd5e1;">${escapeHtml(bannerName)}</p>
    </td></tr>
    <tr><td style="padding:24px 32px;">
      <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">A visitor submitted their email through the popup banner.</p>
      <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0;border-radius:8px;">
        <tr><td style="padding:12px 14px;color:#475569;font-size:13px;width:30%;">Email</td><td style="padding:12px 14px;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(email)}</td></tr>
        ${pageUrl ? `<tr><td style="padding:12px 14px;color:#475569;font-size:13px;border-top:1px solid #e2e8f0;">Page</td><td style="padding:12px 14px;color:#0f172a;font-size:13px;border-top:1px solid #e2e8f0;"><a href="${escapeHtml(pageUrl)}" style="color:#1e3a5f;">${escapeHtml(pageUrl)}</a></td></tr>` : ''}
        ${referer ? `<tr><td style="padding:12px 14px;color:#475569;font-size:13px;border-top:1px solid #e2e8f0;">Referer</td><td style="padding:12px 14px;color:#0f172a;font-size:13px;border-top:1px solid #e2e8f0;">${escapeHtml(referer)}</td></tr>` : ''}
        ${ip ? `<tr><td style="padding:12px 14px;color:#475569;font-size:13px;border-top:1px solid #e2e8f0;">IP</td><td style="padding:12px 14px;color:#0f172a;font-size:13px;border-top:1px solid #e2e8f0;">${escapeHtml(ip)}</td></tr>` : ''}
        <tr><td style="padding:12px 14px;color:#475569;font-size:13px;border-top:1px solid #e2e8f0;">Submitted</td><td style="padding:12px 14px;color:#0f172a;font-size:13px;border-top:1px solid #e2e8f0;">${escapeHtml(submittedAt)}</td></tr>
      </table>
      ${utmRows ? `<h3 style="margin:24px 0 8px;font-size:14px;color:#0f172a;">UTM</h3><table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0;border-radius:8px;">${utmRows}</table>` : ''}
    </td></tr>
    <tr><td style="padding:16px 32px;background:#f8fafc;color:#64748b;font-size:12px;text-align:center;">
      <a href="${SITE_URL}" style="color:#1e3a5f;text-decoration:none;">surefilter.us</a>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `New Banner Lead — ${bannerName}`,
    '',
    `Email: ${email}`,
    pageUrl ? `Page: ${pageUrl}` : '',
    referer ? `Referer: ${referer}` : '',
    ip ? `IP: ${ip}` : '',
    `Submitted: ${submittedAt}`,
    utmParams ? `\nUTM: ${JSON.stringify(utmParams)}` : '',
  ].filter(Boolean).join('\n');

  return { subject, html, text };
}

export async function sendBannerLeadNotificationEmail(submissionId: string): Promise<void> {
  const submission = await prisma.bannerSubmission.findUnique({
    where: { id: submissionId },
    include: { banner: { include: { campaign: true } } },
  });
  if (!submission) throw new Error('Banner submission not found');

  // Fallback chain: banner.notifyEmail → campaign.notifyEmail → skip
  const notifyEmail = submission.banner.notifyEmail || submission.banner.campaign?.notifyEmail || null;
  if (!notifyEmail) {
    await prisma.bannerSubmission.update({
      where: { id: submissionId },
      data: { emailSent: false, emailError: 'No notify email configured for this banner or campaign' },
    });
    return;
  }

  const recipients = parseEmails(notifyEmail);
  if (recipients.length === 0) {
    await prisma.bannerSubmission.update({
      where: { id: submissionId },
      data: { emailSent: false, emailError: 'No valid recipient emails' },
    });
    return;
  }

  const { subject, html, text } = buildBannerLeadEmail({
    bannerName: submission.banner.name,
    email: submission.email,
    pageUrl: submission.pageUrl,
    utmParams: (submission.utmParams as Record<string, string> | null) || null,
    referer: submission.referer,
    ip: submission.ipAddress,
    submittedAt: submission.createdAt.toISOString(),
  });

  const fromEmail = await getFormNotificationFromEmail();

  try {
    await sesClient.send(
      new SendEmailCommand({
        FromEmailAddress: fromEmail,
        Destination: { ToAddresses: recipients },
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: html, Charset: 'UTF-8' },
              Text: { Data: text, Charset: 'UTF-8' },
            },
          },
        },
      })
    );

    await prisma.bannerSubmission.update({
      where: { id: submissionId },
      data: { emailSent: true, emailError: null },
    });
  } catch (error: any) {
    await prisma.bannerSubmission.update({
      where: { id: submissionId },
      data: { emailSent: false, emailError: error?.message || 'Unknown email error' },
    });
    throw error;
  }
}

export function sendBannerLeadNotificationEmailAsync(submissionId: string): void {
  sendBannerLeadNotificationEmail(submissionId).catch((err) => {
    console.error('[banner-email] async send failed:', err);
  });
}
