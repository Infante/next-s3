// lib/config.ts

interface Config {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	bucketName: string;
	domain?: string;
}

export const getConfig = (): Config => {
	const {
		REBUILT_S3_ACCESS_KEY_ID: ACCESS_KEY_ID,
		REBUILT_S3_SECRET_ACCESS_KEY: SECRET_ACCESS_KEY,
		REBUILT_S3_REGION: REGION,
		REBUILT_S3_BUCKET_NAME: BUCKET_NAME,
		REBUILT_S3_DOMAIN: DOMAIN,
	} = process.env;

	if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !REGION || !BUCKET_NAME) {
		throw new Error("Missing required environment variables");
	}

	return {
		accessKeyId: ACCESS_KEY_ID,
		secretAccessKey: SECRET_ACCESS_KEY,
		region: REGION,
		bucketName: BUCKET_NAME,
		domain: DOMAIN,
	};
};
