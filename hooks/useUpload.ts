"use client";

// hooks/useUpload.ts
import { useState } from "react";
import { generatePresignedUrl } from "../lib/upload";

interface FileUploadProgress {
	progress: number;
	status: "uploading" | "completed" | "failed";
	error?: string;
}
interface UploadResponse {
	success: boolean;
	src?: string;
	error?: string;
}
interface UseUploadReturn {
	uploadFile: (file: File) => Promise<UploadResponse>;
	progress: FileUploadProgress | null;
}

export const useUpload = (): UseUploadReturn => {
	const [progress, setProgress] = useState<FileUploadProgress | null>(null);

	const uploadFile = async (file: File): Promise<UploadResponse> => {
		setProgress({ progress: 0, status: "uploading" });

		try {
			const presignedUrlResponse = await generatePresignedUrl(file.name, file.type);

			if (!presignedUrlResponse.success || !presignedUrlResponse.url) {
				setProgress((prev) => (prev ? { ...prev, status: "failed", error: presignedUrlResponse.error } : prev));
				return { success: false, error: presignedUrlResponse.error };
			}

			const { url } = presignedUrlResponse;

			const response = await uploadToS3(url, file, setProgress);

			return response;
		} catch (error) {
			setProgress((prev) => (prev ? { ...prev, status: "failed", error: "Failed to upload file." } : prev));
			return { success: false, error: "Failed to upload file." };
		}
	};

	return {
		uploadFile,
		progress,
	};
};

interface FileUploadProgress {
	progress: number;
	status: "uploading" | "completed" | "failed";
	error?: string;
}

interface UploadResponse {
	success: boolean;
	src?: string;
	error?: string;
}

export const uploadToS3 = (
	url: string,
	file: File,
	setProgress: (progress: FileUploadProgress | null) => void
): Promise<UploadResponse> => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.upload.onprogress = (event: ProgressEvent) => {
			if (event.lengthComputable) {
				const progressValue = (event.loaded / event.total) * 100;
				setProgress({ progress: progressValue, status: "uploading" });
			}
		};

		xhr.onload = () => {
			if (xhr.status === 200) {
				setProgress({ progress: 100, status: "completed" });
				resolve({ success: true, src: url.split("?")[0] });
			} else {
				const errorText = xhr.statusText;
				setProgress({ progress: 100, status: "failed", error: errorText });
				reject({ success: false, error: errorText });
			}
		};

		xhr.onerror = () => {
			const errorText = xhr.statusText;
			setProgress({ progress: 100, status: "failed", error: errorText });
			reject({ success: false, error: errorText });
		};

		xhr.open("PUT", url, true);
		xhr.setRequestHeader("Content-Type", file.type);
		xhr.send(file);
	});
};
