# SureFilter File Manager Setup Guide

## Overview
The SureFilter admin panel includes a comprehensive file management system for handling S3 bucket files, including browsing, uploading, deleting, and copying links for images, videos, and PDFs.

## Local Development Setup

### 1. Prerequisites
- Docker and Docker Compose installed
- Node.js and npm installed
- PostgreSQL database running

### 2. Start MinIO (Local S3 Emulation)
```bash
cd docker/
docker compose up -d
```

This starts:
- MinIO server on `http://localhost:9000`
- MinIO console on `http://localhost:9001` (admin/password123)
- PostgreSQL database on `localhost:5432`

### 3. Initialize MinIO Bucket
```bash
cd docker/
./init-minio.sh
```

Or manually:
```bash
docker exec surefilter-minio mc alias set local http://localhost:9000 admin password123
docker exec surefilter-minio mc mb local/surefilter-static --ignore-existing
docker exec surefilter-minio mc anonymous set public local/surefilter-static
```

### 4. Environment Variables
Create `.env.local` in `surefilter-ui/` directory:

```env
# Database
DATABASE_URL="postgresql://surefilter:devpassword@localhost:5432/surefilter?schema=public"

# MinIO (local S3 replacement)
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123

# AWS S3 (production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# CDN URL
NEXT_PUBLIC_CDN_URL=https://new.surefilter.us

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 5. Database Migration
```bash
cd surefilter-ui/
npx prisma db push
```

### 6. Start Development Server
```bash
cd surefilter-ui/
npm run dev
```

## File Manager Features

### Supported File Types
- **Images**: JPG, PNG, WebP, GIF, SVG (up to 50MB)
- **Videos**: MP4, WebM (up to 50MB)
- **Documents**: PDF (up to 50MB)

### Folder Structure
```
surefilter-static/
├── images/
│   ├── hero/
│   ├── products/
│   └── industries/
├── videos/
└── documents/
```

### Admin Interface
Access the file manager at: `http://localhost:3000/admin/files`

Features:
- **Drag & Drop Upload**: Drop files directly into the interface
- **Folder Navigation**: Browse through folder structure with breadcrumbs
- **File Grid**: View files with previews and metadata
- **Actions**: Copy CDN URLs, delete files
- **Progress Tracking**: Real-time upload progress

## API Endpoints

### File Management APIs
- `GET /api/admin/files/list?folder=path` - List files and folders
- `POST /api/admin/files/upload` - Upload files
- `DELETE /api/admin/files/delete` - Delete files
- `POST /api/admin/files/presigned-url` - Generate presigned upload URLs

### Authentication
All file management APIs require admin authentication via NextAuth session.

## Production Deployment

### AWS S3 Setup
1. Create S3 bucket: `surefilter-static`
2. Configure IAM role with file manager permissions
3. Set up CloudFront CDN distribution
4. Update environment variables with production AWS credentials

### Environment Variables (Production)
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=production_access_key
AWS_SECRET_ACCESS_KEY=production_secret_key
NEXT_PUBLIC_CDN_URL=https://cdn.surefilter.us
```

## Components

### Frontend Components
- `ManagedImage`: Wrapper for Next.js Image with S3/CDN URL resolution
- `FileUploader`: Drag & drop upload interface with progress
- `FileGrid`: File and folder display with actions
- `FolderBreadcrumbs`: Navigation breadcrumbs

### Backend Services
- `lib/s3.ts`: S3 client wrapper supporting MinIO and AWS S3
- Prisma `MediaAsset` model for file metadata storage

## Troubleshooting

### Common Issues
1. **MinIO not accessible**: Check Docker containers are running
2. **Upload fails**: Verify bucket permissions and environment variables
3. **Images not loading**: Check CDN URL configuration in Next.js config

### Logs
- MinIO logs: `docker logs surefilter-minio`
- Next.js logs: Check terminal running `npm run dev`

### MinIO Console
Access MinIO web interface at `http://localhost:9001` with credentials:
- Username: `admin`
- Password: `password123`

## Security

### File Validation
- MIME type validation on upload
- File size limits (50MB max)
- Admin-only access to file management APIs

### S3 Security
- IAM policies restrict access to specific bucket operations
- CloudFront origin access identity for secure CDN delivery
- Public read access for static assets only

## Next Steps
- Test file upload functionality through admin interface
- Verify image optimization with Next.js
- Test CDN URL generation and copying
- Monitor performance with large file sets
