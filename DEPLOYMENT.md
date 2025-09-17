# Production Deployment Guide

## Pre-deployment Checklist

### 1. Local Testing
```bash
# Run health check locally
cd surefilter-ui
node scripts/prod-health-check.js

# Run fix script locally (if needed)
node scripts/prod-fix.js
```

### 2. Code Changes Summary
- ✅ Fixed pageSlug sync in page update API
- ✅ Fixed filter-types API to include pageSlug
- ✅ Added automatic cleanup of pageSlug references
- ✅ Created monitoring scripts

## Production Deployment Steps

### Step 1: Deploy Code
```bash
# Build and deploy to production
npm run build
# Deploy using your CI/CD pipeline or manual deployment
```

### Step 2: Web-based Health Check
1. **Open browser** and go to: `https://your-domain.com/admin/system-health`
2. **Login** to admin panel if needed
3. **Click "Refresh"** to run health check
4. **Review results** - check for any issues

**Alternative**: Go to `https://your-domain.com/admin/settings` for system overview and quick access to all tools

### Step 3: Fix Issues (if any)
1. **If issues found**, click **"Fix Issues"** button
2. **Wait for completion** - the page will show fix results
3. **Click "Refresh"** again to verify fixes
4. **Repeat** if needed until all issues are resolved

### Step 4: Test Critical Functionality
1. **Admin Panel**: Check `/admin/filter-types` - links should work
2. **Page Editing**: Try editing a page slug - pageSlug should sync
3. **Filter Types**: Verify all FilterTypes have correct pageSlug

## Web-based Monitoring

All monitoring and maintenance tools are now available through the web interface:

### System Health Check
- **URL**: `/admin/system-health`
- **Features**:
  - Database connection status
  - Duplicate pages detection
  - Orphaned FilterTypes detection
  - Critical pages verification
  - FilterTypes pageSlug status
  - One-click issue fixing

### System Settings
- **URL**: `/admin/settings`
- **Features**:
  - System information overview
  - Quick access to all admin tools
  - Application settings status
  - Recent changes tracking

## Rollback Plan

If issues occur:
1. Revert to previous code version
2. Run health check to verify state
3. Fix any data inconsistencies
4. Re-deploy

## Post-deployment Verification

1. **Admin Panel**: All links work correctly
2. **Page Management**: Slug changes sync properly
3. **Filter Types**: All have correct pageSlug
4. **No Duplicates**: Clean database state
5. **Performance**: No degradation in response times

## Troubleshooting

### Common Issues
- **Broken links in admin**: Run `prod-fix.js`
- **Duplicate pages**: Run `find-duplicates.js` then `prod-fix.js`
- **Sync issues**: Check API logs for errors

### Logs to Check
- Application logs
- Database logs
- API response logs
