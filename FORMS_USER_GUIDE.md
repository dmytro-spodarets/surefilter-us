# Universal Forms System - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating a Form](#creating-a-form)
3. [Managing Forms](#managing-forms)
4. [Viewing Submissions](#viewing-submissions)
5. [Embedding Forms on Pages](#embedding-forms-on-pages)
6. [Setting Up Webhooks](#setting-up-webhooks)
7. [Managing Resources](#managing-resources)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Admin Panel

1. Navigate to `/admin` on your site
2. Log in with your admin credentials
3. Click on **Forms** in the main navigation

### Navigation Overview

- **Forms** → Manage all forms
  - **All Forms** - View and manage forms
  - **Create Form** - Create a new form
  - **All Submissions** - View all submissions across forms

---

## Creating a Form

### Step 1: Navigate to Create Form

1. Click **Forms** in the main navigation
2. Select **Create Form** from the dropdown
   - OR click the "Create Form" button on the Forms list page

### Step 2: Basic Information

1. **Name** - Enter a descriptive name (e.g., "Contact Us Form")
   - This is shown in the admin panel
2. **Slug** - Auto-generated from the name
   - Used in URLs and for embedding
   - Can be edited if needed
3. **Description** (optional) - Internal notes about the form

### Step 3: Add Fields

Click **Add Field** to create form fields:

#### Field Types:
- **Text Input** - Single-line text (e.g., name, company)
- **Email Input** - Email with validation
- **Phone Input** - Phone with formatting
- **Textarea** - Multi-line text (e.g., message)
- **Select** - Dropdown menu
- **Checkbox** - Yes/no option
- **Radio** - Multiple choice (single selection)

#### Field Configuration:

For each field, configure:
- **Label** - What users see above the field
- **Placeholder** - Hint text inside the field (optional)
- **Required** - Whether the field must be filled
- **Help Text** - Additional guidance below the field (optional)
- **Options** - For Select/Radio fields, add choices (one per line)

#### Field Actions:
- **↑ ↓** - Reorder fields using arrow buttons
- **Edit** - Modify field settings
- **Delete** - Remove field

### Step 4: Success Configuration

Configure what happens after submission:

- **Success Title** - Heading shown after submission (default: "Thank You!")
- **Success Message** - Message shown after submission
- **Redirect URL** (optional) - Send user to another page after submission

### Step 5: Integrations (Optional)

#### Webhook:
- **Webhook URL** - External endpoint to receive submission data
- **Test Webhook** - Test your webhook before going live

#### Email Notifications:
- **Notification Email** - Receive an email for each submission

### Step 6: Save

1. Click **Save Changes**
2. You'll be redirected to the form editor
3. The form is now ready to use!

---

## Managing Forms

### Forms List

View all your forms at `/admin/forms`

**Table Columns:**
- **Name** - Form name
- **Slug** - URL identifier
- **Submissions** - Number of submissions received
- **Resources** - Number of resources using this form
- **Status** - Active (green) or Inactive (gray)
- **Created** - When the form was created
- **Actions** - Edit, View Submissions, Delete

### Filtering Forms

- **Status Filter** - Show All, Active, or Inactive forms
- **Search** - Find forms by name or slug

### Editing a Form

1. Click **Edit** on any form
2. Make your changes
3. Click **Save Changes**

**Note:** Editing a form doesn't affect existing submissions

### Activating/Deactivating

- Click the **status badge** to toggle between Active/Inactive
- Inactive forms:
  - Don't appear in form selectors
  - Can't receive new submissions
  - Existing submissions remain accessible

### Deleting a Form

1. Click **Delete** on any form
2. Confirm the action
3. **Warning:** This cannot be undone!
   - All submissions will be deleted
   - Forms embedded on pages will break

---

## Viewing Submissions

### View Submissions for a Specific Form

1. Go to Forms list (`/admin/forms`)
2. Click **View Submissions** on any form
   - OR Edit the form and click "View Submissions" button

### View All Submissions

Click **Forms** → **All Submissions** to see submissions from all forms

### Submissions Table

**Columns:**
- **Submitted At** - Date and time
- **Form Data** - First 3 fields preview
- **Status** - Webhook/email delivery status
- **Actions** - View, Retry (if failed), Delete

### Status Badges

- **Webhook ✓** (green) - Webhook sent successfully
- **Webhook ✗** (red) - Webhook failed
- **Email ✓** (blue) - Email notification sent

### Viewing Full Submission

1. Click **View** on any submission
2. A modal shows:
   - All form field values
   - IP address, user agent, referrer
   - Webhook status and error (if failed)
   - Timestamp

### Retrying Failed Webhooks

If a webhook fails:
1. A **🔄 Retry** button appears
2. Click to retry sending
3. System attempts 3 retries with exponential backoff
4. Status updates automatically

### Exporting Submissions

1. Click **Export CSV** button
2. CSV file downloads with all submissions
3. Includes:
   - All form fields
   - Submission date
   - Metadata

**Filter Before Export:**
- Use form filter to export specific form
- Use webhook status filter

---

## Embedding Forms on Pages

### Step 1: Open Page Editor

1. Go to **Pages** in admin navigation
2. Select the page where you want to add a form
3. Scroll to the sections list

### Step 2: Add Form Section

1. In the "Add section" dropdown, select:
   - **Forms: Embed Universal Form**
2. Click **Add section**

### Step 3: Configure Form Embed

1. **Select Form** - Choose from dropdown
   - Only active forms appear
   - Shows form name and slug
2. **Section Title** (optional) - Heading above the form
3. **Section Description** (optional) - Text above the form
4. Click **Save Changes**

### Step 4: Preview

1. Visit the public page
2. The form appears with all configured fields
3. Test submission to ensure it works

### Multiple Forms on One Page

You can embed multiple forms on a single page:
- Add multiple "Form Embed" sections
- Select different forms for each section
- Arrange them using section ordering

---

## Setting Up Webhooks

### What is a Webhook?

A webhook sends form submission data to an external URL (like your CRM, email marketing tool, or custom system).

### Configuring a Webhook

1. Edit your form
2. Go to **Integrations** tab
3. Enter **Webhook URL** (e.g., `https://your-crm.com/api/leads`)
4. (Optional) Add custom headers for authentication

### Testing Your Webhook

1. Click **🧪 Test Webhook** button
2. System sends a test payload to your URL
3. Results show:
   - ✅ Success - Status code and response
   - ❌ Failure - Error message

**Test Payload Format:**
```json
{
  "test": true,
  "submissionId": "test_...",
  "timestamp": "2025-10-26T...",
  "data": {
    "message": "This is a test webhook...",
    "testField1": "Test Value 1",
    "testField2": "Test Value 2"
  }
}
```

### Live Webhook Payload

When a real submission occurs:
```json
{
  "submissionId": "clx...",
  "timestamp": "2025-10-26T...",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    ...all form fields
  }
}
```

### Webhook Retry Logic

If a webhook fails:
- System automatically retries **3 times**
- Delays: 2s, 4s, 8s (exponential backoff)
- You can manually retry from submissions page

### Common Webhook Issues

**Webhook fails immediately:**
- Check URL is correct and accessible
- Test in browser or Postman first

**Webhook times out:**
- Your endpoint must respond within 30 seconds
- Use queue/background processing for slow tasks

**Authentication errors:**
- Add custom headers in webhook configuration
- Example: `Authorization: Bearer YOUR_TOKEN`

---

## Managing Resources

### What are Resources?

Resources are downloadable files (PDFs, videos, documents) that users can access, optionally protected by a form (lead generation).

### Creating a Resource Category

1. Go to **Resources** → **Categories**
2. Click **Add Category**
3. Enter:
   - Name (e.g., "Catalogs")
   - Slug (auto-generated)
   - Description
   - Icon (optional)
   - Color theme
4. Click **Save**

### Creating a Resource

1. Go to **Resources** → **Add Resource**
2. Fill in:
   - **Title** - Resource name
   - **Slug** - URL identifier (auto-generated)
   - **Description** - Full description (supports rich text)
   - **Short Description** - For cards/previews
   - **Thumbnail Image** - Preview image
   - **File** - The actual file to download
   - **File Type** - PDF, Video, Document, etc.
   - **File Size** - Display size (e.g., "15.2 MB")
   - **File Meta** - Additional info (e.g., "124 pages")
   - **Category** - Select category
   - **Form** (optional) - Require form submission before download
   - **Status** - Draft, Published, Archived
   - **Publish Date** - When to make visible
   - **SEO Fields** - Meta title, description, OG image
3. Click **Save**

### Gated Downloads (Lead Generation)

To require a form submission before download:

1. Create a form (e.g., "Download Form")
2. Add fields you want to collect (name, email, company, etc.)
3. When creating a resource, select this form
4. Users must fill the form to download

**User Experience:**
1. User clicks resource
2. Sees resource details
3. Fills out form
4. Receives download link (expires in 15 minutes)

### Managing Resources

**Resources List:**
- Filter by status (Draft, Published, Archived)
- Filter by category
- Search by title
- Edit, delete resources

---

## Troubleshooting

### Form Not Showing in Embed Selector

**Problem:** Can't find form in dropdown when adding Form Embed section

**Solution:**
- Check form is **Active** (not Inactive)
- Refresh the page
- Create the form first, then add section

---

### Submissions Not Appearing

**Problem:** User submitted form but no submission in admin

**Possible Causes:**
1. **Form is inactive** - Activate the form
2. **JavaScript error** - Check browser console
3. **Network error** - Check server logs
4. **Form ID mismatch** - Re-embed the form

**Debug Steps:**
1. Open browser console (F12)
2. Submit form
3. Look for errors in Network or Console tabs
4. Check form ID in page source matches admin

---

### Webhook Failing

**Problem:** Webhook shows red "Webhook ✗" badge

**Solution:**
1. Click **View** on the submission
2. Check webhook error message
3. Common fixes:
   - Test webhook URL in browser
   - Check authentication headers
   - Verify endpoint accepts POST requests
   - Check endpoint returns 200 status
4. Click **🔄 Retry** to resend

---

### Images Not Loading

**Problem:** Resource thumbnails or form images not displaying

**Solution:**
1. Check file was uploaded via File Manager
2. Check file path is correct
3. Clear browser cache
4. Check CDN is configured correctly

---

### Form Fields Not Saving

**Problem:** Added fields but they disappeared after save

**Solution:**
1. Don't refresh during save
2. Check for validation errors
3. Ensure all required field properties are filled
4. Try editing existing field instead of adding new

---

### Can't Delete Form

**Problem:** Delete button doesn't work or shows error

**Possible Causes:**
1. **Form is in use** - Check Resources using this form
2. **Permission issue** - Check you're logged in as admin
3. **Database error** - Check server logs

**Solution:**
- Remove form from all resources first
- Then delete the form

---

## Best Practices

### Form Design

✅ **Do:**
- Keep forms short (5-7 fields max for better conversion)
- Use clear, descriptive labels
- Add help text for complex fields
- Use required fields sparingly
- Test form on mobile devices

❌ **Don't:**
- Use ALL CAPS in labels
- Make every field required
- Use technical jargon
- Skip testing before going live

### Field Naming

- Use clear IDs: `fullName`, `email`, `phoneNumber`
- Avoid spaces or special characters in field IDs
- Be consistent across forms

### Webhook Security

- Always use HTTPS endpoints
- Use authentication headers
- Validate incoming data on your endpoint
- Log webhook attempts for debugging

### Resource Management

- Use descriptive file names
- Compress PDFs before upload
- Add accurate file size/page count
- Use high-quality thumbnails
- Write clear descriptions

---

## Quick Reference

### Keyboard Shortcuts (Form Builder)

- **Tab** - Navigate between fields
- **Enter** - Save form (when focused on input)
- **Esc** - Close modal

### Common Field Configurations

**Name Field:**
```
Type: Text
Label: Full Name
Required: Yes
```

**Email Field:**
```
Type: Email
Label: Email Address
Required: Yes
```

**Message Field:**
```
Type: Textarea
Label: Message
Required: Yes
Placeholder: Tell us how we can help...
```

---

## Need Help?

**Questions or Issues?**
- Check this guide first
- Review [API Documentation](./FORMS_API_DOCUMENTATION.md)
- Check [Technical Progress](./FORMS_SYSTEM_PROGRESS.md)
- Contact technical support

---

*Last Updated: 2025-10-26*

