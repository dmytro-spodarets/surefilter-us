import 'server-only';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { prisma } from '@/lib/prisma';
import { getFormNotificationFromEmail } from '@/lib/site-settings';

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://surefilter.us';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function send(opts: { to: string[]; subject: string; html: string; text: string }) {
  if (opts.to.length === 0) return;
  const from = await getFormNotificationFromEmail();
  try {
    await sesClient.send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: opts.to },
        Content: {
          Simple: {
            Subject: { Data: opts.subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: opts.html, Charset: 'UTF-8' },
              Text: { Data: opts.text, Charset: 'UTF-8' },
            },
          },
        },
      })
    );
  } catch (e) {
    console.error('[mcp-alerts] SES send failed:', e);
  }
}

/** All active ADMIN users' email addresses. Used as the alert audience. */
async function getAdminEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', isActive: true },
    select: { email: true },
  });
  return admins.map((a) => a.email).filter(Boolean);
}

// ─────────── alert: token revoked by someone other than the owner ───────────
export async function alertTokenRevokedNotSelf(opts: {
  tokenId: string;
  tokenName: string;
  tokenPrefix: string;
  ownerEmail: string | null;
  revokedByEmail: string;
  reason: string | null;
}): Promise<void> {
  if (!opts.ownerEmail) return; // orphaned token — no owner to notify
  if (opts.ownerEmail === opts.revokedByEmail) return; // self-revoke

  const subject = `SURE FILTER — Your API token "${opts.tokenName}" was revoked`;
  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;color:#1f2937;padding:24px;max-width:560px;">
<h2 style="color:#dc2626;margin-top:0;">API token revoked</h2>
<p>Your Sure Filter US API token <strong>${escapeHtml(opts.tokenName)}</strong> (<code>${escapeHtml(opts.tokenPrefix)}…</code>) was just revoked by <strong>${escapeHtml(opts.revokedByEmail)}</strong>.</p>
${opts.reason ? `<p><strong>Reason:</strong> ${escapeHtml(opts.reason)}</p>` : ''}
<p>If this was unexpected, contact the admin who revoked it. If you need a new token, sign in and create one at <a href="${SITE_URL}/admin/access/tokens">${SITE_URL}/admin/access/tokens</a>.</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
<p style="font-size:12px;color:#6b7280;">This is an automated notification from the Sure Filter US admin. Do not reply.</p>
</body></html>`;
  const text = `Your API token "${opts.tokenName}" (${opts.tokenPrefix}...) was revoked by ${opts.revokedByEmail}.\n${opts.reason ? `Reason: ${opts.reason}\n` : ''}If this was unexpected, contact the admin who revoked it. Manage tokens at ${SITE_URL}/admin/access/tokens`;

  await send({ to: [opts.ownerEmail], subject, html, text });
}

// ─────────── alert: admin:* token created (high-privilege) ───────────
export async function alertAdminStarTokenCreated(opts: {
  tokenId: string;
  tokenName: string;
  tokenPrefix: string;
  ownerEmail: string | null;
  createdByEmail: string;
}): Promise<void> {
  const admins = await getAdminEmails();
  if (admins.length === 0) return;

  const subject = `SURE FILTER — admin:* API token created`;
  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;color:#1f2937;padding:24px;max-width:560px;">
<h2 style="color:#dc2626;margin-top:0;">High-privilege API token created</h2>
<p>A new token with the <code>admin:*</code> wildcard scope was just issued.</p>
<ul>
  <li><strong>Name:</strong> ${escapeHtml(opts.tokenName)}</li>
  <li><strong>Prefix:</strong> <code>${escapeHtml(opts.tokenPrefix)}…</code></li>
  <li><strong>Owner:</strong> ${escapeHtml(opts.ownerEmail ?? 'unknown')}</li>
  <li><strong>Created by:</strong> ${escapeHtml(opts.createdByEmail)}</li>
</ul>
<p>This token can read and modify every part of the site. If you don't recognize this, revoke it now at <a href="${SITE_URL}/admin/access/tokens/${escapeHtml(opts.tokenId)}">${SITE_URL}/admin/access/tokens/${escapeHtml(opts.tokenId)}</a>.</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
<p style="font-size:12px;color:#6b7280;">This is an automated notification from the Sure Filter US admin. Do not reply.</p>
</body></html>`;
  const text = `A new admin:* API token was issued.\nName: ${opts.tokenName}\nPrefix: ${opts.tokenPrefix}...\nOwner: ${opts.ownerEmail ?? 'unknown'}\nCreated by: ${opts.createdByEmail}\n\nManage at ${SITE_URL}/admin/access/tokens/${opts.tokenId}`;

  await send({ to: admins, subject, html, text });
}
