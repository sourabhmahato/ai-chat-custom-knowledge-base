"use client";

import { useState, useCallback, useEffect } from "react";

export interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: "processing" | "ready" | "error";
  chunkCount: number;
  error?: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  }, []);

  const uploadDocument = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadProgress(10);

      try {
        const formData = new FormData();
        formData.append("file", file);

        setUploadProgress(30);

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        setUploadProgress(70);

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Upload failed");
        }

        setUploadProgress(100);

        // Poll for processing completion
        const pollInterval = setInterval(async () => {
          await fetchDocuments();
        }, 2000);

        // Stop polling after 60 seconds
        setTimeout(() => clearInterval(pollInterval), 60000);

        // Refresh immediately
        await fetchDocuments();
      } catch (err) {
        console.error("Upload error:", err);
        throw err;
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      }
    },
    [fetchDocuments],
  );

  const deleteDocument = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }, []);

  // Initial fetch + polling for status updates
  useEffect(() => {
    fetchDocuments();

    const interval = setInterval(() => {
      fetchDocuments();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchDocuments]);

  return {
    documents,
    isUploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    fetchDocuments,
  };
}
