import { prisma } from './prisma';

interface WebhookConfig {
  url: string;
  headers?: Record<string, string>;
}

interface WebhookResult {
  success: boolean;
  attempts: number;
  error?: string;
  response?: any;
}

/**
 * Send webhook with retry logic
 * @param submissionId - Form submission ID
 * @param config - Webhook configuration (URL and headers)
 * @param data - Data to send in webhook payload
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns WebhookResult with success status and details
 */
export async function sendWebhook(
  submissionId: string,
  config: WebhookConfig,
  data: any,
  maxRetries: number = 3
): Promise<WebhookResult> {
  let lastError: string | null = null;
  let lastResponse: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Webhook attempt ${attempt}/${maxRetries} for submission ${submissionId}`);

      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SureFilter-Forms/1.0',
          ...config.headers,
        },
        body: JSON.stringify({
          submissionId,
          timestamp: new Date().toISOString(),
          data,
        }),
      });

      const responseText = await response.text();
      let responseJson;
      
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = { raw: responseText };
      }

      lastResponse = responseJson;

      // Update submission with webhook status
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: {
          webhookSent: response.ok,
          webhookError: response.ok ? null : `HTTP ${response.status}: ${responseText}`,
          webhookResponse: responseJson,
          webhookAttempts: attempt,
          lastWebhookTry: new Date(),
        },
      });

      if (response.ok) {
        console.log(`Webhook sent successfully on attempt ${attempt}`);
        return {
          success: true,
          attempts: attempt,
          response: responseJson,
        };
      } else {
        lastError = `HTTP ${response.status}: ${responseText}`;
        console.error(`Webhook attempt ${attempt} failed:`, lastError);
      }
    } catch (error: any) {
      lastError = error.message;
      console.error(`Webhook attempt ${attempt} failed:`, error);
    }

    // Exponential backoff before retry (except on last attempt)
    if (attempt < maxRetries) {
      const backoffMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s, etc.
      console.log(`Waiting ${backoffMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // All retries failed
  await prisma.formSubmission.update({
    where: { id: submissionId },
    data: {
      webhookSent: false,
      webhookError: `Failed after ${maxRetries} attempts: ${lastError}`,
      webhookAttempts: maxRetries,
      lastWebhookTry: new Date(),
    },
  });

  return {
    success: false,
    attempts: maxRetries,
    error: lastError || 'Unknown error',
    response: lastResponse,
  };
}

/**
 * Send webhook asynchronously (fire and forget)
 * Useful for non-blocking webhook calls
 */
export function sendWebhookAsync(
  submissionId: string,
  config: WebhookConfig,
  data: any
): void {
  sendWebhook(submissionId, config, data)
    .then(result => {
      if (result.success) {
        console.log(`Async webhook sent successfully for ${submissionId}`);
      } else {
        console.error(`Async webhook failed for ${submissionId}:`, result.error);
      }
    })
    .catch(error => {
      console.error(`Async webhook error for ${submissionId}:`, error);
    });
}

/**
 * Test webhook endpoint
 * Sends a test payload to verify webhook configuration
 */
export async function testWebhook(
  url: string,
  headers?: Record<string, string>
): Promise<{ success: boolean; statusCode?: number; error?: string; response?: any }> {
  try {
    const testPayload = {
      test: true,
      submissionId: 'test_' + Date.now(),
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from SureFilter Forms',
        testField1: 'Test Value 1',
        testField2: 'Test Value 2',
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SureFilter-Forms/1.0',
        ...headers,
      },
      body: JSON.stringify(testPayload),
    });

    const responseText = await response.text();
    let responseJson;

    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { raw: responseText };
    }

    return {
      success: response.ok,
      statusCode: response.status,
      response: responseJson,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Retry failed webhook
 * Useful for manually retrying webhooks that failed
 */
export async function retryWebhook(submissionId: string): Promise<WebhookResult> {
  // Get submission with form details
  const submission = await prisma.formSubmission.findUnique({
    where: { id: submissionId },
    include: {
      form: {
        select: {
          webhookUrl: true,
          webhookHeaders: true,
        },
      },
    },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  if (!submission.form.webhookUrl) {
    throw new Error('No webhook URL configured for this form');
  }

  return sendWebhook(
    submissionId,
    {
      url: submission.form.webhookUrl,
      headers: submission.form.webhookHeaders as Record<string, string> | undefined,
    },
    submission.data
  );
}

