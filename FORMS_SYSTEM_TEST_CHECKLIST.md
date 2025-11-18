# Universal Forms System - Test Checklist

## **STAGE 1: Database & Models** ✅

### Database Schema
- [x] `Form` model exists with all fields
- [x] `FormSubmission` model exists with all fields
- [x] `ResourceCategory` model exists
- [x] `Resource` model exists
- [x] `SectionType` enum includes `form_embed`
- [x] Indexes are properly configured
- [x] Relations are set up correctly

### Migrations
- [x] Migration files created and applied
- [x] No migration conflicts
- [x] Database in sync with schema

---

## **STAGE 2: Core API Endpoints**

### Forms Management API
- [ ] `GET /api/admin/forms` - List forms with filters
- [ ] `POST /api/admin/forms` - Create new form
- [ ] `GET /api/admin/forms/[id]` - Get single form
- [ ] `PUT /api/admin/forms/[id]` - Update form
- [ ] `DELETE /api/admin/forms/[id]` - Delete form

### Form Submissions API
- [ ] `POST /api/forms/submit` - Public form submission
- [ ] `GET /api/admin/form-submissions` - List all submissions
- [ ] `GET /api/admin/form-submissions?formId=X` - Filter by form
- [ ] `GET /api/admin/form-submissions/[id]` - Get single submission
- [ ] `DELETE /api/admin/form-submissions/[id]` - Delete submission
- [ ] `GET /api/admin/form-submissions/export` - Export to CSV

### Form Public API
- [ ] `GET /api/forms/[slug]` - Get form by slug (public)

---

## **STAGE 3: Admin UI - Forms Management**

### Forms List Page (`/admin/forms`)
- [ ] Displays all forms in table
- [ ] Filter by status (all/active/inactive)
- [ ] Search by name/slug works
- [ ] Shows submission count
- [ ] Shows resource count
- [ ] Status toggle works
- [ ] Delete confirmation works
- [ ] "Create Form" button navigates correctly
- [ ] Breadcrumbs display

### Create Form Page (`/admin/forms/new`)
- [ ] Form builder loads
- [ ] Can add/remove fields
- [ ] Field types work (text, email, phone, etc.)
- [ ] Drag & drop reordering works
- [ ] Field configuration (label, placeholder, required, etc.)
- [ ] Success message configuration
- [ ] Webhook URL input
- [ ] Save creates form and redirects
- [ ] Cancel with confirmation
- [ ] Breadcrumbs display

### Edit Form Page (`/admin/forms/[id]/edit`)
- [ ] Loads existing form data
- [ ] All fields editable
- [ ] Changes save correctly
- [ ] "View Submissions" button works
- [ ] Webhook test button appears when form has URL
- [ ] Test webhook shows results
- [ ] Breadcrumbs show form name

### Form Submissions Page (`/admin/forms/[id]/submissions`)
- [ ] Lists all submissions for form
- [ ] Shows first 3 fields in table
- [ ] Webhook status badges display correctly
- [ ] Email status badges display correctly
- [ ] "View" button opens modal
- [ ] Modal shows all form data
- [ ] Modal shows metadata (IP, user agent, etc.)
- [ ] "Retry" button appears for failed webhooks
- [ ] Retry webhook works
- [ ] Delete submission works
- [ ] Export CSV works
- [ ] Breadcrumbs show form name

### All Submissions Page (`/admin/form-submissions`)
- [ ] Lists submissions from all forms
- [ ] Shows form name
- [ ] Filter by form works
- [ ] Filter by webhook status works
- [ ] Export all submissions works

---

## **STAGE 4: Public Form Rendering**

### DynamicForm Component
- [ ] Fetches form configuration by ID
- [ ] Renders all field types correctly:
  - [ ] Text input
  - [ ] Email input (with validation)
  - [ ] Phone input (with mask)
  - [ ] Textarea
  - [ ] Select dropdown
  - [ ] Checkbox
  - [ ] Radio buttons
- [ ] Required field validation works
- [ ] Email format validation works
- [ ] Shows error messages
- [ ] Submit button disables during submission
- [ ] Success state shows after submission
- [ ] Success message displays correctly
- [ ] Redirect works (if configured)
- [ ] Loading states work
- [ ] Error handling works

### FormEmbed Component
- [ ] Renders title (if provided)
- [ ] Renders description (if provided)
- [ ] Embeds DynamicForm correctly
- [ ] Styling is consistent

---

## **STAGE 5: Resources System**

### Resource Categories API
- [ ] `GET /api/admin/resource-categories` - List categories
- [ ] `POST /api/admin/resource-categories` - Create category
- [ ] `PUT /api/admin/resource-categories/[id]` - Update category
- [ ] `DELETE /api/admin/resource-categories/[id]` - Delete category (checks usage)
- [ ] `GET /api/resources/categories` - Public categories list

### Resources API
- [ ] `GET /api/admin/resources` - List resources
- [ ] `POST /api/admin/resources` - Create resource
- [ ] `GET /api/admin/resources/[id]` - Get resource
- [ ] `PUT /api/admin/resources/[id]` - Update resource
- [ ] `DELETE /api/admin/resources/[id]` - Delete resource
- [ ] `GET /api/resources` - Public resources list
- [ ] `GET /api/resources/[slug]` - Public resource detail
- [ ] `POST /api/resources/[slug]/download` - Generate presigned URL

### Resource Categories Admin
- [ ] Table displays all categories
- [ ] Inline editing works
- [ ] Position (order) works
- [ ] Icon selection works
- [ ] Color selection works
- [ ] Create new category works
- [ ] Delete with usage check works
- [ ] Active/inactive toggle works

### Resources Admin
- [ ] List displays all resources
- [ ] Filter by status works
- [ ] Filter by category works
- [ ] Search works
- [ ] Status badges display correctly
- [ ] Create new resource navigates
- [ ] Edit resource works
- [ ] Delete confirmation works

### Resource Form (Create/Edit)
- [ ] All fields display
- [ ] Title auto-generates slug
- [ ] File picker works (thumbnail)
- [ ] File picker works (main file)
- [ ] Category dropdown populated
- [ ] Form association dropdown populated
- [ ] Status dropdown works
- [ ] Publish date picker works
- [ ] SEO fields work
- [ ] Save creates/updates resource
- [ ] Validation works

---

## **STAGE 6: Public Resources Pages**

### Resources Listing (`/resources`)
- [ ] Displays all published resources
- [ ] Category filter works
- [ ] Search works
- [ ] Grid/list view toggle works
- [ ] Thumbnails display correctly
- [ ] File metadata shows (type, size, etc.)
- [ ] Category badges display
- [ ] Cards are clickable
- [ ] Hover animations work
- [ ] Empty state shows when no results
- [ ] Responsive layout works

### Resource Detail (`/resources/[slug]`)
- [ ] Resource loads by slug
- [ ] Breadcrumbs display
- [ ] Title and description show
- [ ] Thumbnail displays
- [ ] File metadata shows
- [ ] **No form**: Shows download button
- [ ] **With form**: Shows form embed
- [ ] Form submission triggers download
- [ ] Presigned URL generated correctly
- [ ] Download link expires after 15 min
- [ ] Error handling works

---

## **STAGE 7: Webhook Integration**

### Webhook Utility (`/lib/webhook.ts`)
- [ ] `sendWebhook()` sends POST request
- [ ] Retry logic works (3 attempts)
- [ ] Exponential backoff works (2s, 4s, 8s)
- [ ] Updates submission status in DB
- [ ] Captures response/error
- [ ] `sendWebhookAsync()` is non-blocking
- [ ] `testWebhook()` sends test payload
- [ ] `retryWebhook()` loads submission and resends

### Test Webhook
- [ ] Test button appears in form builder
- [ ] Test sends to configured URL
- [ ] Test payload is correct format
- [ ] Success result displays (status, response)
- [ ] Failure result displays (error)
- [ ] No submission created for test

### Webhook on Submission
- [ ] Webhook triggered after form submit
- [ ] Submission ID included in payload
- [ ] All form data included
- [ ] Timestamp included
- [ ] Custom headers sent
- [ ] Success updates DB status
- [ ] Failure updates DB with error
- [ ] Non-blocking (doesn't slow form)

### Retry Failed Webhooks
- [ ] Retry button shows for failed webhooks
- [ ] Confirmation dialog appears
- [ ] Retry uses original submission data
- [ ] Retry uses full retry logic
- [ ] Status updates after retry
- [ ] Success/failure message shows

---

## **STAGE 8: CMS Integration**

### CMS Schema
- [ ] `FormEmbedSchema` defined
- [ ] Required field: `formId`
- [ ] Optional fields: `title`, `description`

### CMS Renderer
- [ ] `form_embed` case exists
- [ ] Renders `FormEmbed` component
- [ ] Passes all props correctly

### Add Section Menu
- [ ] "Forms: Embed Universal Form" option exists
- [ ] Appears in all pages
- [ ] Creates section correctly

### Form Embed Section Editor
- [ ] Form dropdown loads all active forms
- [ ] Form selection is required
- [ ] Preview shows selected form info
- [ ] Link to edit form works
- [ ] Title field works (optional)
- [ ] Description field works (optional)
- [ ] Save updates section
- [ ] Validation prevents save without form

### Public Page Rendering
- [ ] Form embed section renders on pages
- [ ] Title displays (if provided)
- [ ] Description displays (if provided)
- [ ] Form is fully functional
- [ ] Submissions work
- [ ] Styling is consistent with page

---

## **STAGE 9: Admin Menu & Navigation**

### Enhanced Navigation
- [ ] Sticky header works
- [ ] Brand logo displays
- [ ] Active menu items highlighted
- [ ] Hover states work
- [ ] Forms dropdown opens/closes
- [ ] Resources dropdown opens/closes
- [ ] Dropdown items clickable
- [ ] "View Site" opens in new tab
- [ ] Responsive (hidden on mobile)

### Breadcrumbs
- [ ] Display on all admin pages
- [ ] Auto-generation works
- [ ] Manual override works
- [ ] Arrow separators display
- [ ] Links are clickable
- [ ] Last item is bold (no link)
- [ ] Hides on single-item
- [ ] Form name shows in breadcrumbs

### Navigation Flow
- [ ] Can navigate between all pages
- [ ] Back links work
- [ ] Quick actions accessible
- [ ] Context is clear at all times

---

## **STAGE 10: Testing & Polish**

### Code Quality
- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] No console errors in browser
- [ ] All imports resolve
- [ ] Prisma client generated

### Error Handling
- [ ] API errors show user-friendly messages
- [ ] 404 pages work
- [ ] Network errors handled
- [ ] Validation errors display clearly
- [ ] Confirmation dialogs for destructive actions

### Performance
- [ ] Forms list loads quickly
- [ ] Submissions list loads quickly
- [ ] Resources list loads quickly
- [ ] Images load efficiently
- [ ] No unnecessary re-renders
- [ ] Database queries optimized

### UI/UX Polish
- [ ] All buttons have consistent styling
- [ ] Loading states everywhere
- [ ] Success feedback visible
- [ ] Error messages clear
- [ ] Form validation is intuitive
- [ ] Hover states on interactive elements
- [ ] Focus states for accessibility
- [ ] Mobile responsive (where applicable)

### Documentation
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] API documentation exists
- [ ] Setup instructions clear
- [ ] Environment variables documented

### Security
- [ ] API routes check authentication
- [ ] Public routes don't expose sensitive data
- [ ] Webhook URLs validated
- [ ] File uploads validated
- [ ] SQL injection prevented (using Prisma)
- [ ] XSS prevented (React escaping)

---

## **Integration Testing**

### End-to-End Flows

#### Flow 1: Create and Use Contact Form
- [ ] Admin creates new form "Contact Us"
- [ ] Adds fields: name, email, phone, message
- [ ] Configures success message
- [ ] Saves form
- [ ] Embeds form on "Contact" page via CMS
- [ ] User visits contact page
- [ ] User fills and submits form
- [ ] Success message shows
- [ ] Submission appears in admin
- [ ] Data is correct

#### Flow 2: Resource with Gated Download
- [ ] Admin creates resource category
- [ ] Admin creates download form
- [ ] Admin creates resource with form
- [ ] Uploads PDF and thumbnail
- [ ] Publishes resource
- [ ] User visits resources page
- [ ] User finds and clicks resource
- [ ] Form displays
- [ ] User submits form
- [ ] Download link generates
- [ ] File downloads successfully

#### Flow 3: Webhook Integration
- [ ] Admin creates form with webhook
- [ ] Tests webhook (success)
- [ ] User submits form
- [ ] Webhook fires
- [ ] Webhook succeeds
- [ ] Status shows in admin
- [ ] Simulates webhook failure
- [ ] Retries webhook manually
- [ ] Success after retry

#### Flow 4: Form Management Lifecycle
- [ ] Create form
- [ ] Edit form (add field)
- [ ] View submissions (none yet)
- [ ] Deactivate form
- [ ] Form doesn't show in embed selector
- [ ] Reactivate form
- [ ] Form shows in embed selector
- [ ] Delete form (with confirmation)

---

## **Browser Compatibility**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## **Accessibility**

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Forms have proper labels
- [ ] Error messages associated with fields
- [ ] Color contrast sufficient
- [ ] Screen reader friendly (semantic HTML)

---

## **Summary**

**Total Tests**: ~200+
**Passed**: [ ]
**Failed**: [ ]
**Skipped**: [ ]

**Critical Issues Found**: [ ]
**Medium Issues Found**: [ ]
**Minor Issues Found**: [ ]

**Status**: 🔄 IN PROGRESS

---

*Last Updated: 2025-10-26*

