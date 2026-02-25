"use client";

import React from "react";
import { FileText, Trash2, Loader } from "lucide-react";
import { DocumentInfo } from "@/hooks/useDocuments";

interface DocumentCardProps {
  document: DocumentInfo;
  onDelete: (id: string) => void;
}

function getFileExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() || "txt";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentCard({
  document: doc,
  onDelete,
}: DocumentCardProps) {
  const ext = getFileExtension(doc.name);

  return (
    <div className="document-card">
      <div className={`doc-icon ${ext}`}>
        <FileText size={16} />
      </div>

      <div className="doc-info">
        <div className="doc-name" title={doc.name}>
          {doc.name}
        </div>
        <div className="doc-meta">
          <span>{formatFileSize(doc.size)}</span>
          {doc.status === "ready" && <span>{doc.chunkCount} chunks</span>}
        </div>
        {doc.status === "error" && doc.error && (
          <div className="doc-error-msg" title={doc.error}>
            {doc.error}
          </div>
        )}
      </div>

      <div className={`doc-status ${doc.status}`}>
        {doc.status === "processing" && (
          <Loader size={10} className="processing-spinner" />
        )}
        {doc.status === "processing"
          ? "Processing"
          : doc.status === "ready"
            ? "Ready"
            : "Error"}
      </div>

      <button
        className="doc-delete"
        onClick={() => onDelete(doc.id)}
        title="Delete document"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
