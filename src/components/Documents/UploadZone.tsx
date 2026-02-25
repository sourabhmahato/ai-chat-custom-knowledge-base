"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CloudUpload } from "lucide-react";

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

const ACCEPTED_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

export default function UploadZone({
  onUpload,
  isUploading,
  uploadProgress,
}: UploadZoneProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        try {
          await onUpload(acceptedFiles[0]);
        } catch {
          // Error handled by hook
        }
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`upload-zone ${isDragActive ? "drag-active" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="upload-icon">
        {isDragActive ? <CloudUpload size={28} /> : <Upload size={28} />}
      </div>
      {isUploading ? (
        <>
          <div className="upload-text">Processing document...</div>
          <div className="upload-progress">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </>
      ) : isDragActive ? (
        <div className="upload-text">Drop your file here</div>
      ) : (
        <>
          <div className="upload-text">
            <strong>Click to upload</strong> or drag & drop
          </div>
          <div className="upload-hint">PDF, TXT, MD, DOCX</div>
        </>
      )}
    </div>
  );
}
