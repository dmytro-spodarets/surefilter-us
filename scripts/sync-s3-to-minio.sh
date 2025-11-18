#!/usr/bin/env bash

#
# Sync S3 to MinIO - Development Data Sync
# 
# This script syncs production S3 buckets to local MinIO for development.
# Uses AWS profile: surefilter-local
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_PROFILE="surefilter-local"
MINIO_ALIAS="local-minio"
MINIO_ENDPOINT="http://localhost:9000"
MINIO_USER="admin"
MINIO_PASSWORD="password123"

# S3 Buckets to sync (source:target pairs)
S3_BUCKETS=(
    "surefilter-files-prod:surefilter-static"
    "surefilter-static-prod:surefilter-static"
)

echo -e "${GREEN}🚀 S3 to MinIO Sync Script${NC}"
echo "======================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Install: brew install awscli"
    exit 1
fi

# Check if MinIO Client is installed
if ! command -v mc &> /dev/null; then
    echo -e "${RED}❌ MinIO Client (mc) is not installed${NC}"
    echo "Install: brew install minio/stable/mc"
    exit 1
fi

# Check if AWS profile exists
if ! aws configure list-profiles | grep -q "^${AWS_PROFILE}$"; then
    echo -e "${RED}❌ AWS profile '${AWS_PROFILE}' not found${NC}"
    echo ""
    echo "Create profile with:"
    echo "  aws configure --profile ${AWS_PROFILE}"
    exit 1
fi

# Check if MinIO is running
if ! curl -s -f "${MINIO_ENDPOINT}/minio/health/live" > /dev/null 2>&1; then
    echo -e "${RED}❌ MinIO is not running${NC}"
    echo ""
    echo "Start MinIO with:"
    echo "  cd docker"
    echo "  docker compose up -d minio"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Configure MinIO client alias
echo -e "${YELLOW}🔧 Configuring MinIO client...${NC}"
mc alias set ${MINIO_ALIAS} ${MINIO_ENDPOINT} ${MINIO_USER} ${MINIO_PASSWORD} > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MinIO client configured${NC}"
else
    echo -e "${RED}❌ Failed to configure MinIO client${NC}"
    exit 1
fi
echo ""

# Create local bucket if it doesn't exist
TARGET_BUCKET="surefilter-static"
echo -e "${YELLOW}📦 Checking local bucket: ${TARGET_BUCKET}${NC}"

if ! mc ls ${MINIO_ALIAS}/${TARGET_BUCKET} > /dev/null 2>&1; then
    echo "  Creating bucket..."
    mc mb ${MINIO_ALIAS}/${TARGET_BUCKET}
    mc anonymous set download ${MINIO_ALIAS}/${TARGET_BUCKET}
    echo -e "${GREEN}  ✅ Bucket created with public read access${NC}"
else
    echo -e "${GREEN}  ✅ Bucket already exists${NC}"
fi
echo ""

# Sync each S3 bucket
for BUCKET_PAIR in "${S3_BUCKETS[@]}"; do
    S3_BUCKET="${BUCKET_PAIR%%:*}"
    MINIO_BUCKET="${BUCKET_PAIR##*:}"
    
    echo -e "${YELLOW}📥 Syncing S3 bucket: ${S3_BUCKET}${NC}"
    echo "   Target MinIO bucket: ${MINIO_BUCKET}"
    
    # Check if S3 bucket exists and is accessible
    if ! AWS_PROFILE=${AWS_PROFILE} aws s3 ls "s3://${S3_BUCKET}" > /dev/null 2>&1; then
        echo -e "${RED}   ⚠️  Cannot access S3 bucket (might be empty or no permissions)${NC}"
        echo ""
        continue
    fi
    
    # Count files in S3 bucket
    FILE_COUNT=$(AWS_PROFILE=${AWS_PROFILE} aws s3 ls "s3://${S3_BUCKET}" --recursive 2>/dev/null | wc -l | xargs)
    
    if [ "$FILE_COUNT" -eq "0" ]; then
        echo -e "${YELLOW}   ℹ️  Bucket is empty, skipping...${NC}"
        echo ""
        continue
    fi
    
    echo "   Found ${FILE_COUNT} files"
    echo "   Starting sync..."
    echo ""
    
    # Sync using AWS CLI to temp directory, then upload to MinIO
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf ${TEMP_DIR}" EXIT
    
    echo "   1️⃣  Downloading from S3..."
    AWS_PROFILE=${AWS_PROFILE} aws s3 sync "s3://${S3_BUCKET}" "${TEMP_DIR}/${S3_BUCKET}" --no-progress
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ Downloaded from S3${NC}"
    else
        echo -e "${RED}   ❌ Failed to download from S3${NC}"
        continue
    fi
    
    echo ""
    echo "   2️⃣  Uploading to MinIO..."
    mc mirror --overwrite "${TEMP_DIR}/${S3_BUCKET}" "${MINIO_ALIAS}/${MINIO_BUCKET}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ Uploaded to MinIO${NC}"
    else
        echo -e "${RED}   ❌ Failed to upload to MinIO${NC}"
        continue
    fi
    
    # Clean up temp directory for this bucket
    rm -rf "${TEMP_DIR}/${S3_BUCKET}"
    
    echo ""
    echo -e "${GREEN}✅ Sync completed for ${S3_BUCKET}${NC}"
    echo "======================================"
    echo ""
done

# Summary
echo ""
echo -e "${GREEN}🎉 Sync process completed!${NC}"
echo ""
echo "You can now access files at:"
echo "  - MinIO Console: ${MINIO_ENDPOINT%:9000}:9001"
echo "  - Direct URL: ${MINIO_ENDPOINT}/surefilter-static/{file-path}"
echo ""
echo "File count in MinIO:"
mc ls ${MINIO_ALIAS}/${TARGET_BUCKET} --recursive 2>/dev/null | wc -l | xargs | awk '{print "  " $1 " files"}'
echo ""

