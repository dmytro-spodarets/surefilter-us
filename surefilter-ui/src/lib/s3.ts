import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 client configuration
console.log('S3 Client Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  AWS_REGION: process.env.AWS_REGION,
  isDevelopment: process.env.NODE_ENV === 'development'
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.NODE_ENV === 'development' ? {
    // MinIO configuration for local development
    credentials: {
      accessKeyId: process.env.MINIO_ROOT_USER || 'admin',
      secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'password123',
    },
    endpoint: 'http://localhost:9000',
    forcePathStyle: true, // Required for MinIO
  } : {
    // Production: AWS SDK automatically uses IAM role credentials
    // No explicit credentials needed - App Runner provides them via instance role
  }),
});

const BUCKET_NAME = process.env.NODE_ENV === 'development' 
  ? 'surefilter-static' 
  : 'surefilter-static-prod';

export interface S3File {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
}

export interface S3ListResult {
  files: S3File[];
  folders: string[];
  hasMore: boolean;
  nextToken?: string;
}

// List files and folders in S3
export async function listS3Objects(prefix: string = '', maxKeys: number = 50, continuationToken?: string): Promise<S3ListResult> {
  try {
    // Ensure prefix ends with / if not empty
    const normalizedPrefix = prefix && !prefix.endsWith('/') ? `${prefix}/` : prefix;
    
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: normalizedPrefix,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
      Delimiter: '/',
    });

    const response = await s3Client.send(command);
    
    // Get folders (common prefixes) - remove the current prefix to get relative paths
    const folders = response.CommonPrefixes?.map(cp => {
      const fullPath = cp.Prefix?.replace(/\/$/, '') || '';
      // Remove the current prefix to get just the folder name
      return normalizedPrefix ? fullPath.replace(normalizedPrefix, '') : fullPath;
    }).filter(folder => folder.length > 0) || [];
    
    // Get files (contents) - filter out placeholder files
    const files = response.Contents?.filter(obj => !obj.Key?.endsWith('.folder') && !obj.Key?.endsWith('.keep')).map(obj => ({
      key: obj.Key || '',
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date(),
      etag: obj.ETag || '',
    })) || [];

    return {
      files,
      folders,
      hasMore: response.IsTruncated || false,
      nextToken: response.NextContinuationToken,
    };
  } catch (error) {
    console.error('Error listing S3 objects:', error);
    throw new Error('Failed to list files');
  }
}

// Upload file to S3
export async function uploadToS3(
  key: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the CDN URL
    if (process.env.NODE_ENV === 'development') {
      return `http://localhost:9000/${BUCKET_NAME}/${key}`;
    }
    
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://new.surefilter.us';
    return `${cdnUrl}/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file');
  }
}

// Delete file from S3
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete file');
  }
}

// Generate presigned URL for direct upload (for Uppy)
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

// Create folder in S3 (creates a placeholder object for empty folders)
export async function createS3Folder(folderPath: string): Promise<void> {
  try {
    const key = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    const placeholderKey = `${key}.keep`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: placeholderKey,
      Body: '',
      ContentType: 'text/plain',
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error creating S3 folder:', error);
    throw new Error('Failed to create folder in S3');
  }
}

// Delete folder from S3 (removes all objects with the folder prefix)
export async function deleteS3Folder(folderPath: string): Promise<void> {
  const prefix = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
  
  // List all objects with the folder prefix
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  });

  const listResult = await s3Client.send(listCommand);
  
  if (listResult.Contents && listResult.Contents.length > 0) {
    // Delete all objects in the folder
    const deleteObjects = listResult.Contents.map(obj => ({ Key: obj.Key! }));
    
    for (const obj of deleteObjects) {
      const deleteCmd = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: obj.Key,
      });
      await s3Client.send(deleteCmd);
    }
  }
}

// Move S3 objects from one folder to another
export async function moveS3Objects(oldPath: string, newPath: string): Promise<void> {
  const oldPrefix = oldPath.endsWith('/') ? oldPath : `${oldPath}/`;
  const newPrefix = newPath.endsWith('/') ? newPath : `${newPath}/`;
  
  // List all objects with the old prefix
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: oldPrefix,
  });

  const listResult = await s3Client.send(listCommand);
  
  if (listResult.Contents && listResult.Contents.length > 0) {
    for (const obj of listResult.Contents) {
      if (!obj.Key) continue;
      
      // Calculate new key
      const relativePath = obj.Key.substring(oldPrefix.length);
      const newKey = `${newPrefix}${relativePath}`;
      
      // Copy object to new location
      const copyCommand = new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        Key: newKey,
        CopySource: `${BUCKET_NAME}/${obj.Key}`,
      });
      
      await s3Client.send(copyCommand);
      
      // Delete old object
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: obj.Key,
      });
      
      await s3Client.send(deleteCommand);
    }
  }
}
