#!/bin/bash

# Fix Next.js 15 params Promise issue in API routes

for file in \
  "src/app/api/admin/categories/[id]/route.ts" \
  "src/app/api/admin/spec-parameters/[id]/route.ts" \
  "src/app/api/admin/products/[id]/route.ts"
do
  echo "Fixing $file..."
  
  # Remove duplicate lines added by sed
  sed -i '' '/const { id } = await params;$/N;s/\n  const { id } = await params;//' "$file"
  
  # Fix GET function
  sed -i '' '/export async function GET(/,/) {/{
    s/{ params }: { params: Promise<{ id: string }> }$/{ params }: { params: Promise<{ id: string }> }\
) {\
  const { id } = await params;/
    /const { id } = await params;$/d
  }' "$file"
  
  # Fix PUT function  
  sed -i '' '/export async function PUT(/,/) {/{
    s/{ params }: { params: Promise<{ id: string }> }$/{ params }: { params: Promise<{ id: string }> }\
) {\
  const { id } = await params;/
    /const { id } = await params;$/d
  }' "$file"
  
  # Fix DELETE function
  sed -i '' '/export async function DELETE(/,/) {/{
    s/{ params }: { params: Promise<{ id: string }> }$/{ params }: { params: Promise<{ id: string }> }\
) {\
  const { id } = await params;/
    /const { id } = await params;$/d
  }' "$file"
  
done

echo "Done!"
