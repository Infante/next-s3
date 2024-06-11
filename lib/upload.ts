// lib/upload.ts
"use server";

import { HttpRequest } from "@aws-sdk/protocol-http";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { formatUrl } from "@aws-sdk/util-format-url";

import { getConfig } from "./config";

const { accessKeyId, secretAccessKey, region, bucketName } = getConfig();

interface GeneratePresignedUrlResponse {
	success: boolean;
	error?: string;
	url?: string;
}

export const generatePresignedUrl = async (
	fileName: string,
	fileType: string
): Promise<GeneratePresignedUrlResponse> => {
	const key = `${fileName}`;
	const endpoint = `https://${bucketName}.s3.${region}.amazonaws.com`;
	const s3ObjectUrl = parseUrl(`${endpoint}/${key}`);

	const presigner = new S3RequestPresigner({
		credentials: { accessKeyId, secretAccessKey },
		region: region,
		sha256: Sha256,
	});

	const httpRequest = new HttpRequest({
		...s3ObjectUrl,
		method: "PUT",
		headers: {
			"content-type": fileType,
			host: s3ObjectUrl.hostname,
		},
	});

	const signedUrl = await presigner.presign(httpRequest, { expiresIn: 3600 });

	const formattedUrl = formatUrl(signedUrl);

	return {
		success: true,
		url: formattedUrl,
	};
};
