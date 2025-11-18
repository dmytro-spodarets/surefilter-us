import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWebhookAsync } from '@/lib/webhook';
import { z } from 'zod';

// POST /api/forms/submit - Submit form (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, data, additionalData } = body;

    if (!formId || !data) {
      return NextResponse.json(
        { error: 'formId and data are required' },
        { status: 400 }
      );
    }

    // Get form configuration
    const form = await prisma.form.findUnique({
      where: { id: formId, isActive: true },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    // Validate submitted data against form fields
    const fields = form.fields as any[];
    const validationErrors: string[] = [];

    for (const field of fields) {
      const value = data[field.id];

      // Check required fields
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        validationErrors.push(`${field.label} is required`);
        continue;
      }

      // Skip validation if field is not required and empty
      if (!value) continue;

      // Type-specific validation
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            validationErrors.push(`${field.label} must be a valid email`);
          }
          break;

        case 'phone':
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value)) {
            validationErrors.push(`${field.label} must be a valid phone number`);
          }
          break;

        case 'text':
        case 'textarea':
          if (field.validation?.minLength && value.length < field.validation.minLength) {
            validationErrors.push(`${field.label} must be at least ${field.validation.minLength} characters`);
          }
          if (field.validation?.maxLength && value.length > field.validation.maxLength) {
            validationErrors.push(`${field.label} must be no more than ${field.validation.maxLength} characters`);
          }
          if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
            validationErrors.push(`${field.label} format is invalid`);
          }
          break;
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Collect metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || null;

    // Merge data with additional data (e.g., resourceId)
    const fullData = {
      ...data,
      ...additionalData,
      submittedAt: new Date().toISOString(),
    };

    // Save submission to database
    const submission = await prisma.formSubmission.create({
      data: {
        formId,
        data: fullData,
        ipAddress,
        userAgent,
        referer,
      },
    });

    // Send webhook asynchronously (non-blocking)
    if (form.webhookUrl) {
      sendWebhookAsync(
        submission.id,
        {
          url: form.webhookUrl,
          headers: form.webhookHeaders as Record<string, string> | undefined,
        },
        fullData
      );
    }

    // Send email notification asynchronously (if configured)
    if (form.notifyEmail) {
      sendEmailNotificationAsync(submission.id, form.notifyEmail, form.name, fullData)
        .catch(err => console.error('Email notification failed:', err));
    }

    // Return success response
    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: form.successMessage || 'Form submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}

// Async email notification sender
async function sendEmailNotificationAsync(
  submissionId: string,
  email: string,
  formName: string,
  data: any
) {
  try {
    // TODO: Implement actual email sending (using Resend, SendGrid, etc.)
    // For now, just log and mark as sent
    console.log(`Email notification would be sent to: ${email}`);
    console.log(`Form: ${formName}`);
    console.log('Data:', data);

    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        emailSent: true,
      },
    });
  } catch (error: any) {
    console.error('Email notification failed:', error);
    
    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        emailSent: false,
        emailError: error.message,
      },
    });
  }
}

