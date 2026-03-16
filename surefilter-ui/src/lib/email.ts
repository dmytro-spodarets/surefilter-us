import 'server-only';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { prisma } from './prisma';
import { getFormNotificationFromEmail } from './site-settings';

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION || 'us-east-1',
  // Production: AWS SDK automatically uses IAM role credentials
  // No explicit credentials needed - App Runner provides them via instance role
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://surefilter.us';

interface FormFieldMeta {
  id: string;
  label: string;
  type: string;
}

/**
 * Parse comma-separated email string into array of trimmed, valid emails
 */
function parseEmails(emailStr: string): string[] {
  return emailStr
    .split(',')
    .map(e => e.trim())
    .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

/**
 * Build HTML email for form submission notification
 */
function buildNotificationEmail(
  formName: string,
  data: Record<string, any>,
  fields: FormFieldMeta[],
  metadata: { ip?: string; referer?: string; submittedAt: string }
): { subject: string; html: string; text: string } {
  const subject = `SURE FILTER — New "${formName}" Form Submission`;

  // Build field rows — use form field definitions for labels, fall back to raw keys
  const fieldMap = new Map(fields.map(f => [f.id, f.label]));
  const skipKeys = ['submittedAt'];

  const rows: Array<{ label: string; value: string }> = [];

  // First add known fields in order
  for (const field of fields) {
    const val = data[field.id];
    if (val !== undefined && val !== null && val !== '') {
      rows.push({ label: field.label, value: String(val) });
    }
  }

  // Then add any extra keys not in field definitions
  for (const [key, val] of Object.entries(data)) {
    if (skipKeys.includes(key)) continue;
    if (fieldMap.has(key)) continue;
    if (val !== undefined && val !== null && val !== '') {
      rows.push({ label: key, value: String(val) });
    }
  }

  const fieldRowsHtml = rows
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; font-weight: 500; width: 35%; vertical-align: top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; word-break: break-word;">
            ${escapeHtml(value).replace(/\n/g, '<br>')}
          </td>
        </tr>`
    )
    .join('');

  const fieldRowsText = rows.map(({ label, value }) => `${label}: ${value}`).join('\n');

  const submittedAt = new Date(metadata.submittedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 28px 32px; border-radius: 12px 12px 0 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">
                      SURE FILTER
                    </h1>
                    <p style="margin: 6px 0 0; color: #93c5fd; font-size: 13px; font-weight: 400;">
                      New Form Submission
                    </p>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                      New
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px;">

              <!-- Form name -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #eff6ff; border-left: 4px solid #1e3a5f; padding: 14px 18px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #1e3a5f; font-size: 15px; font-weight: 600;">
                      ${escapeHtml(formName)}
                    </p>
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">
                      Submitted on ${submittedAt}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Submission data -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="padding: 12px 16px; background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                    <p style="margin: 0; color: #374151; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Submitted Data
                    </p>
                  </td>
                </tr>
                ${fieldRowsHtml}
              </table>

              <!-- Metadata -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Additional Information
                    </p>
                  </td>
                </tr>
                ${metadata.ip ? `
                <tr>
                  <td style="padding: 2px 0;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      <strong style="color: #6b7280;">IP:</strong> ${escapeHtml(metadata.ip)}
                    </p>
                  </td>
                </tr>` : ''}
                ${metadata.referer ? `
                <tr>
                  <td style="padding: 2px 0;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      <strong style="color: #6b7280;">Page:</strong> ${escapeHtml(metadata.referer)}
                    </p>
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      This is an automated notification from
                      <a href="${SITE_URL}" style="color: #1e3a5f; text-decoration: none; font-weight: 500;">surefilter.us</a>
                    </p>
                    <p style="margin: 4px 0 0; color: #d1d5db; font-size: 11px;">
                      You are receiving this because your email is set as a notification recipient for the "${escapeHtml(formName)}" form.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `SURE FILTER — New "${formName}" Form Submission

Submitted on ${submittedAt}

${fieldRowsText}

${metadata.ip ? `IP: ${metadata.ip}` : ''}
${metadata.referer ? `Page: ${metadata.referer}` : ''}

---
This is an automated notification from surefilter.us`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Send email notification for a form submission.
 * Supports multiple recipients (comma-separated in notifyEmail).
 */
export async function sendFormNotificationEmail(
  submissionId: string,
  notifyEmail: string,
  formName: string,
  data: Record<string, any>,
  fields: FormFieldMeta[],
  metadata: { ip?: string; referer?: string }
): Promise<void> {
  const recipients = parseEmails(notifyEmail);

  if (recipients.length === 0) {
    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: { emailSent: false, emailError: 'No valid email addresses provided' },
    });
    return;
  }

  const { subject, html, text } = buildNotificationEmail(formName, data, fields, {
    ...metadata,
    submittedAt: data.submittedAt || new Date().toISOString(),
  });

  const fromEmail = await getFormNotificationFromEmail();

  try {
    await sesClient.send(
      new SendEmailCommand({
        FromEmailAddress: fromEmail,
        Destination: {
          ToAddresses: recipients,
        },
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

    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: { emailSent: true, emailError: null },
    });

    console.log(`Email notification sent to ${recipients.join(', ')} for submission ${submissionId}`);
  } catch (error: any) {
    console.error('Email notification failed:', error);

    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        emailSent: false,
        emailError: error.message || 'Unknown email error',
      },
    });

    throw error;
  }
}

/**
 * Fire-and-forget email notification
 */
export function sendFormNotificationEmailAsync(
  submissionId: string,
  notifyEmail: string,
  formName: string,
  data: Record<string, any>,
  fields: FormFieldMeta[],
  metadata: { ip?: string; referer?: string }
): void {
  sendFormNotificationEmail(submissionId, notifyEmail, formName, data, fields, metadata)
    .catch(err => console.error(`Async email notification failed for ${submissionId}:`, err));
}

/**
 * Retry sending email for a failed submission
 */
export async function retryEmail(submissionId: string): Promise<{ success: boolean; error?: string }> {
  const submission = await prisma.formSubmission.findUnique({
    where: { id: submissionId },
    include: {
      form: {
        select: {
          name: true,
          notifyEmail: true,
          fields: true,
        },
      },
    },
  });

  if (!submission) throw new Error('Submission not found');
  if (!submission.form.notifyEmail) throw new Error('No notification email configured for this form');

  try {
    await sendFormNotificationEmail(
      submissionId,
      submission.form.notifyEmail,
      submission.form.name,
      submission.data as Record<string, any>,
      submission.form.fields as FormFieldMeta[],
      {
        ip: submission.ipAddress || undefined,
        referer: submission.referer || undefined,
      }
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
