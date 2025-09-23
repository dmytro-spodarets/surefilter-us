#!/bin/bash

# Wait for MinIO to be ready
echo "Waiting for MinIO to start..."
sleep 5

# Install MinIO client if not present
if ! command -v mc &> /dev/null; then
    echo "Installing MinIO client..."
    curl -O https://dl.min.io/client/mc/release/darwin-amd64/mc
    chmod +x mc
    sudo mv mc /usr/local/bin/
fi

# Configure MinIO client
echo "Configuring MinIO client..."
mc alias set local http://localhost:9000 admin password123

# Create bucket
echo "Creating surefilter-static bucket..."
mc mb local/surefilter-static --ignore-existing

# Set bucket policy to public read
echo "Setting bucket policy..."
mc anonymous set public local/surefilter-static

# Create folder structure
echo "Creating folder structure..."
mc mkdir local/surefilter-static/images --ignore-existing
mc mkdir local/surefilter-static/images/hero --ignore-existing
mc mkdir local/surefilter-static/images/products --ignore-existing
mc mkdir local/surefilter-static/images/industries --ignore-existing
mc mkdir local/surefilter-static/videos --ignore-existing
mc mkdir local/surefilter-static/documents --ignore-existing

echo "MinIO setup complete!"
echo "MinIO Console: http://localhost:9001 (admin/password123)"
echo "MinIO API: http://localhost:9000"
