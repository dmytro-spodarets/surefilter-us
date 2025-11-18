# Universal Forms System - API Documentation

## Overview

This document describes the REST API endpoints for the Universal Forms System.

---

## **Forms Management (Admin)**

### List Forms
```
GET /api/admin/forms
```

**Query Parameters:**
- `isActive` (optional): `"true"` or `"false"` - Filter by status
- `search` (optional): Search by name or slug

**Response:**
```json
[
  {
    "id": "clx...",
    "name": "Contact Form",
    "slug": "contact-form",
    "description": "Main contact form",
    "isActive": true,
    "createdAt": "2025-10-26T...",
    "updatedAt": "2025-10-26T...",
    "_count": {
      "submissions": 42,
      "resources": 0
    }
  }
]
```

---

### Create Form
```
POST /api/admin/forms
```

**Request Body:**
```json
{
  "name": "Contact Form",
  "slug": "contact-form",
  "description": "Contact us form",
  "fields": [
    {
      "id": "fullName",
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter your name",
      "required": true,
      "helpText": ""
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email",
      "required": true
    }
  ],
  "successTitle": "Thank You!",
  "successMessage": "We'll get back to you soon.",
  "redirectUrl": "",
  "webhookUrl": "https://example.com/webhook",
  "webhookHeaders": {
    "Authorization": "Bearer token123"
  },
  "notifyEmail": "admin@example.com",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "clx...",
  "name": "Contact Form",
  ...
}
```

---

### Get Form
```
GET /api/admin/forms/[id]
```

**Response:** Same as Create Form response

---

### Update Form
```
PUT /api/admin/forms/[id]
```

**Request Body:** Same as Create Form

**Response:** Updated form object

---

### Delete Form
```
DELETE /api/admin/forms/[id]
```

**Response:**
```json
{
  "success": true
}
```

---

### Test Webhook
```
POST /api/admin/forms/[id]/test-webhook
```

Sends a test payload to the form's webhook URL.

**Response:**
```json
{
  "success": true,
  "message": "Webhook test successful",
  "statusCode": 200,
  "response": { ... }
}
```

---

## **Form Submissions (Admin)**

### List All Submissions
```
GET /api/admin/form-submissions
```

**Query Parameters:**
- `formId` (optional): Filter by form ID
- `webhookSent` (optional): `"true"` or `"false"`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "submissions": [
    {
      "id": "clx...",
      "formId": "clx...",
      "form": {
        "name": "Contact Form",
        "slug": "contact-form"
      },
      "data": {
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "referer": "https://example.com/contact",
      "webhookSent": true,
      "webhookError": null,
      "webhookAttempts": 1,
      "emailSent": true,
      "createdAt": "2025-10-26T..."
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 2
}
```

---

### Get Submission
```
GET /api/admin/form-submissions/[id]
```

**Response:** Single submission object (same structure as above)

---

### Delete Submission
```
DELETE /api/admin/form-submissions/[id]
```

**Response:**
```json
{
  "success": true
}
```

---

### Retry Webhook
```
POST /api/admin/form-submissions/[id]/retry-webhook
```

Retries sending the webhook for a failed submission.

**Response:**
```json
{
  "success": true,
  "message": "Webhook sent successfully",
  "attempts": 2
}
```

---

### Export Submissions
```
GET /api/admin/form-submissions/export
```

**Query Parameters:**
- `formId` (optional): Filter by form ID

**Response:** CSV file download

---

## **Forms (Public)**

### Get Form by Slug
```
GET /api/forms/[slug]
```

Returns form configuration for public display.

**Response:**
```json
{
  "id": "clx...",
  "name": "Contact Form",
  "slug": "contact-form",
  "description": "Contact us form",
  "fields": [ ... ],
  "successTitle": "Thank You!",
  "successMessage": "We'll get back to you soon.",
  "redirectUrl": ""
}
```

---

### Submit Form
```
POST /api/forms/submit
```

**Request Body:**
```json
{
  "formId": "clx...",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "message": "Hello world"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "submissionId": "clx..."
}
```

**Side Effects:**
- Creates `FormSubmission` in database
- Sends webhook asynchronously (if configured)
- Sends email notification asynchronously (if configured)

---

## **Resources (Admin)**

### List Resources
```
GET /api/admin/resources
```

**Query Parameters:**
- `status` (optional): `"DRAFT"`, `"PUBLISHED"`, or `"ARCHIVED"`
- `categoryId` (optional): Filter by category
- `search` (optional): Search by title
- `page`, `limit`: Pagination

**Response:**
```json
{
  "resources": [
    {
      "id": "clx...",
      "title": "Product Catalog 2025",
      "slug": "product-catalog-2025",
      "shortDescription": "Complete catalog",
      "thumbnailImage": "catalogs/thumb.jpg",
      "file": "catalogs/catalog-2025.pdf",
      "fileType": "PDF",
      "fileSize": "15.2 MB",
      "fileMeta": "124 pages",
      "categoryId": "clx...",
      "category": {
        "name": "Catalogs",
        "slug": "catalogs"
      },
      "formId": "clx...",
      "status": "PUBLISHED",
      "publishedAt": "2025-10-26T...",
      "createdAt": "2025-10-26T..."
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

---

### Create Resource
```
POST /api/admin/resources
```

**Request Body:**
```json
{
  "title": "Product Catalog 2025",
  "slug": "product-catalog-2025",
  "description": "Full product catalog...",
  "shortDescription": "Complete catalog",
  "thumbnailImage": "catalogs/thumb.jpg",
  "file": "catalogs/catalog-2025.pdf",
  "fileType": "PDF",
  "fileSize": "15.2 MB",
  "fileMeta": "124 pages",
  "categoryId": "clx...",
  "formId": "clx...",
  "status": "PUBLISHED",
  "publishedAt": "2025-10-26T...",
  "metaTitle": "Product Catalog 2025",
  "metaDescription": "Download our catalog",
  "ogImage": "catalogs/og.jpg"
}
```

---

### Update Resource
```
PUT /api/admin/resources/[id]
```

**Request Body:** Same as Create Resource

---

### Delete Resource
```
DELETE /api/admin/resources/[id]
```

---

## **Resources (Public)**

### List Resources
```
GET /api/resources
```

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `search` (optional): Search by title
- `page`, `limit`: Pagination

**Response:** Similar to admin list, but only published resources

---

### Get Resource by Slug
```
GET /api/resources/[slug]
```

**Response:**
```json
{
  "id": "clx...",
  "title": "Product Catalog 2025",
  "slug": "product-catalog-2025",
  "description": "Full description...",
  "shortDescription": "Short desc",
  "thumbnailImage": "catalogs/thumb.jpg",
  "file": "catalogs/catalog-2025.pdf",
  "fileType": "PDF",
  "fileSize": "15.2 MB",
  "fileMeta": "124 pages",
  "category": {
    "id": "clx...",
    "name": "Catalogs",
    "slug": "catalogs"
  },
  "form": {
    "id": "clx...",
    "name": "Download Form",
    "slug": "download-form",
    "fields": [ ... ]
  },
  "publishedAt": "2025-10-26T..."
}
```

---

### Generate Download Link
```
POST /api/resources/[slug]/download
```

Generates a secure presigned URL for downloading the resource file.

**Request Body:**
```json
{
  "submissionId": "clx..."
}
```

**Response:**
```json
{
  "success": true,
  "downloadUrl": "https://s3.amazonaws.com/...",
  "expiresIn": "15 minutes"
}
```

**Notes:**
- Requires a valid `submissionId` (from form submission)
- URL expires after 15 minutes
- Uses S3 presigned URLs for security

---

## **Resource Categories**

### List Categories (Admin)
```
GET /api/admin/resource-categories
```

**Response:**
```json
[
  {
    "id": "clx...",
    "name": "Catalogs",
    "slug": "catalogs",
    "description": "Product catalogs",
    "icon": "DocumentTextIcon",
    "color": "bg-blue-100 text-blue-700",
    "position": 0,
    "isActive": true,
    "_count": {
      "resources": 5
    }
  }
]
```

---

### Create Category
```
POST /api/admin/resource-categories
```

**Request Body:**
```json
{
  "name": "Catalogs",
  "slug": "catalogs",
  "description": "Product catalogs",
  "icon": "DocumentTextIcon",
  "color": "bg-blue-100 text-blue-700",
  "position": 0,
  "isActive": true
}
```

---

### Update Category
```
PUT /api/admin/resource-categories/[id]
```

---

### Delete Category
```
DELETE /api/admin/resource-categories/[id]
```

**Notes:**
- Cannot delete if category has resources
- Returns 400 error if in use

---

### List Categories (Public)
```
GET /api/resources/categories
```

Returns only active categories, ordered by position.

---

## **Webhook Payload Format**

When a form is submitted and a webhook is configured, the following payload is sent:

```json
{
  "submissionId": "clx...",
  "timestamp": "2025-10-26T12:34:56.789Z",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "Hello world"
  }
}
```

**Test Payload:**
```json
{
  "test": true,
  "submissionId": "test_1730000000000",
  "timestamp": "2025-10-26T12:34:56.789Z",
  "data": {
    "message": "This is a test webhook from SureFilter Forms",
    "testField1": "Test Value 1",
    "testField2": "Test Value 2"
  }
}
```

---

## **Error Responses**

All endpoints return standard error responses:

```json
{
  "error": "Error message description",
  "details": { ... }
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., duplicate slug)
- `500` - Internal Server Error

---

## **Authentication**

All `/api/admin/*` endpoints require authentication via NextAuth session.

Public endpoints (`/api/forms/*`, `/api/resources/*`) do not require authentication.

---

## **Rate Limiting**

Currently, there is no rate limiting implemented. Consider adding it for production use, especially for:
- `/api/forms/submit` - Prevent spam submissions
- `/api/resources/[slug]/download` - Prevent abuse

---

## **Field Types**

Supported form field types:

- `text` - Single-line text input
- `email` - Email input with validation
- `phone` - Phone input with formatting
- `textarea` - Multi-line text area
- `select` - Dropdown select
- `checkbox` - Checkbox (boolean)
- `radio` - Radio buttons (single choice)

**Field Configuration:**
```typescript
{
  id: string;          // Unique field identifier
  type: FieldType;     // Field type
  label: string;       // Field label
  placeholder?: string; // Placeholder text
  required?: boolean;  // Is field required
  helpText?: string;   // Help text below field
  options?: string[];  // Options for select/radio
}
```

---

*Last Updated: 2025-10-26*

