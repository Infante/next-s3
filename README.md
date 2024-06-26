# rebuilt-next-s3

Simplify file uploads from your Next.js app to S3 and DigitalOcean Spaces.

## Installation

```bash
npm install rebuilt-next-s3
```
or 
```bash
yarn add rebuilt-next-s3
```

## Environment Variables

You’ll need to set up the following environment variables for this package to work correctly:

```bash
REBUILT_S3_ACCESS_KEY_ID=your-access-key-id
REBUILT_S3_SECRET_ACCESS_KEY=your-secret-access-key
REBUILT_S3_REGION=your-region
REBUILT_S3_BUCKET_NAME=your-bucket-name
```

Refer to the Next.js documentation for more information on how to set up environment variables in your app.
https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables

## S3 Bucket Setup

To use this package, you’ll need to create an S3 bucket and configure it to allow public access. Here are the steps to do that:

### Create an S3 bucket
Go to the S3 Management Console and create a new bucket. Ensure the name matches the `REBUILT_S3_BUCKET_NAME` environment variable.

### Bucket permissions
Once the bucket is created you'll need to go to the permissions tab and make sure that public access is not blocked.

### Bucket policy
Next, you'll need to create a bucket policy that allows public access. Copy this policy and replace the BUCKET_NAME  with your bucket name:

```JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}
```

### CORS configuration
Next, you'll need to configure CORS to allow cross-origin requests.

### IAM and API keys
Finally, you'll need to create an IAM user to get your ACCESS_KEY_ID and SECRET_ACCESS_KEY. You can do this by going to the IAM Management Console and creating a new user with programmatic access.

For the permissions step you'll need to add the following policy:

```JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}
```

Replace BUCKET_NAME with your bucket name.

## Usage

Once you have set up the environment variables and configured the S3 bucket, you can use the `useUpload` hook to upload files to S3. Here's an example of how to use it:

```tsx
import { useUpload } from "rebuilt-next-s3";

const MyComponent = () => {
  const { uploadFile, progress } = useUpload();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const response = await uploadFile(file);
      if (response.success) {
        console.log("File uploaded successfully:", response.src);
      } else {
        console.log("Error uploading file:", response.error);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {progress && (
        <div>
          Upload progress: {progress.progress}% ({progress.status})
        </div>
      )}
    </div>
  );
};
``` 

