# 🗄️ AWS S3 File Storage Setup Guide

## 📦 Required Dependencies

Add these dependencies to your `package.json`:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner react-dropzone
```

### Dependencies Breakdown:
- `@aws-sdk/client-s3`: AWS SDK v3 for S3 operations
- `@aws-sdk/s3-request-presigner`: Generate presigned URLs for secure file access
- `react-dropzone`: Drag and drop file upload component

## 🔧 AWS S3 Bucket Setup

### 1. Create S3 Bucket
```bash
# Using AWS CLI
aws s3 mb s3://hospital-management-files --region us-east-1
```

### 2. Configure Bucket Policy
Create a bucket policy for secure access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowHospitalAppAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/hospital-app-user"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::hospital-management-files",
        "arn:aws:s3:::hospital-management-files/*"
      ]
    }
  ]
}
```

### 3. Configure CORS Policy
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://yourhospital.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 4. Enable Server-Side Encryption
```bash
aws s3api put-bucket-encryption \
  --bucket hospital-management-files \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'
```

## 🔐 IAM User Setup

### 1. Create IAM User
```bash
aws iam create-user --user-name hospital-app-user
```

### 2. Create IAM Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetObjectVersion",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::hospital-management-files",
        "arn:aws:s3:::hospital-management-files/*"
      ]
    }
  ]
}
```

### 3. Attach Policy to User
```bash
aws iam put-user-policy \
  --user-name hospital-app-user \
  --policy-name HospitalS3Access \
  --policy-document file://s3-policy.json
```

### 4. Create Access Keys
```bash
aws iam create-access-key --user-name hospital-app-user
```

## 🌍 Environment Variables

Add these to your `.env.local`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=hospital-management-files
```

## 📁 S3 Folder Structure

The system creates this folder structure automatically:

```
hospital-management-files/
├── medical-records/
│   └── {patientId}/
│       └── {timestamp}_{random}_{filename}.{ext}
├── prescriptions/
│   └── {patientId}/
│       └── {timestamp}_{random}_{filename}.{ext}
├── test-reports/
│   └── {patientId}/
│       └── {timestamp}_{random}_{filename}.{ext}
├── discharge-summaries/
│   └── {patientId}/
│       └── {timestamp}_{random}_{filename}.{ext}
├── patient-documents/
│   └── {patientId}/
│       └── {timestamp}_{random}_{filename}.{ext}
├── profile-pictures/
│   └── {userId}/
│       └── {timestamp}_{random}_{filename}.{ext}
├── aftercare-instructions/
│   └── {patientId}/
│       └── {timestamp}_{random}_{filename}.{ext}
└── temp-uploads/
    └── {timestamp}_{random}_{filename}.{ext}
```

## 🔒 Security Features

### 1. **File Access Control**
- Patient files are organized by patient ID
- Role-based access control for downloads
- Presigned URLs with expiration (1 hour default)
- Patient-accessible flag for each file

### 2. **File Validation**
- File type validation by category
- File size limits per category
- Malicious file detection
- Sanitized file names

### 3. **Audit Trail**
- All file uploads logged
- Download access tracked
- User activity monitoring
- IP address logging

### 4. **Encryption**
- Server-side encryption (AES-256)
- Encrypted file metadata
- Secure file key generation

## 📊 File Categories & Limits

| Category | Max Size | Allowed Types | Max Files | Patient Access |
|----------|----------|---------------|-----------|----------------|
| Medical Records | 50MB | PDF, JPG, PNG, DICOM | 10 | ✅ |
| Prescriptions | 10MB | PDF, JPG, PNG | 5 | ✅ |
| Test Reports | 100MB | PDF, JPG, PNG, DICOM | 20 | ✅ (Approved) |
| Discharge Summaries | 20MB | PDF, DOC, DOCX | 3 | ✅ |
| Patient Documents | 10MB | PDF, JPG, PNG | 5 | ❌ (Requires Approval) |
| Profile Pictures | 5MB | JPG, PNG | 1 | ✅ |
| Aftercare Instructions | 200MB | PDF, JPG, PNG, MP4, MP3 | 10 | ✅ |

## 🚀 Usage Examples

### 1. **Upload Medical Records**
```typescript
// In your component
import { MedicalRecordUpload } from '@/components/FileUpload';

function PatientRecords({ patientId }: { patientId: string }) {
  const handleUploadSuccess = (files: UploadedFile[]) => {
    console.log('Uploaded files:', files);
    // Update UI or database
  };

  return (
    <MedicalRecordUpload
      patientId={patientId}
      onSuccess={handleUploadSuccess}
    />
  );
}
```

### 2. **Download Files Securely**
```typescript
// Generate secure download URL
const downloadFile = async (fileKey: string) => {
  const response = await fetch(`/api/files/patient-download/${fileKey}`);
  const data = await response.json();
  
  if (data.success) {
    window.open(data.downloadUrl, '_blank');
  }
};
```

### 3. **Batch Upload with Progress**
```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

function BatchUpload() {
  const { uploadFiles, isUploading, uploadProgress } = useFileUpload({
    category: 'test-reports',
    patientId: 'patient-123',
    maxFiles: 5
  });

  const handleFileSelect = (files: FileList) => {
    uploadFiles(files);
  };

  return (
    <div>
      <input 
        type="file" 
        multiple 
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
      />
      {isUploading && <div>Progress: {uploadProgress}%</div>}
    </div>
  );
}
```

## 🔧 API Endpoints

### Upload Endpoints:
- `POST /api/files/upload/medical-records`
- `POST /api/files/upload/prescriptions`
- `POST /api/files/upload/test-reports`
- `POST /api/files/upload/discharge-summaries`
- `POST /api/files/upload/patient-documents`
- `POST /api/files/upload/profile-pictures`
- `POST /api/files/upload/aftercare-instructions`

### Download Endpoints:
- `GET /api/files/download/[...fileKey]` (Staff access)
- `GET /api/files/patient-download/[...fileKey]` (Patient access)

## 🧹 Maintenance

### 1. **Cleanup Temporary Files**
Run this as a scheduled job:
```typescript
import { cleanupTempFiles } from '@/lib/aws-s3';

// Clean files older than 24 hours
await cleanupTempFiles(24);
```

### 2. **Monitor Storage Usage**
```bash
aws s3 ls s3://hospital-management-files --recursive --human-readable --summarize
```

### 3. **Backup Strategy**
- Enable S3 versioning
- Configure lifecycle policies
- Set up cross-region replication for critical files

## 🚨 Error Handling

The system handles these common errors:
- File too large
- Invalid file type
- Network timeouts
- AWS service errors
- Access denied errors
- Quota exceeded errors

All errors are logged and user-friendly messages are displayed.

## 📈 Performance Optimization

1. **Multipart Upload**: Large files (>100MB) use multipart upload
2. **CDN Integration**: Use CloudFront for faster downloads
3. **Compression**: Images are optimized before upload
4. **Caching**: Presigned URLs are cached for repeated access
5. **Lazy Loading**: File lists are paginated and lazy-loaded

This AWS S3 integration provides a secure, scalable, and compliant file storage solution for your Hospital Management System! 🏥✨
