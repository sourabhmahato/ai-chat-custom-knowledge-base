"use client";

import React from "react";
import { FolderOpen, FileStack } from "lucide-react";
import { DocumentInfo } from "@/hooks/useDocuments";
import UploadZone from "./UploadZone";
import DocumentCard from "./DocumentCard";

interface DocumentSidebarProps {
  documents: DocumentInfo[];
  isUploading: boolean;
  uploadProgress: number;
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => void;
  isOpen: boolean;
}

export default function DocumentSidebar({
  documents,
  isUploading,
  uploadProgress,
  onUpload,
  onDelete,
  isOpen,
}: DocumentSidebarProps) {
  const readyCount = documents.filter((d) => d.status === "ready").length;

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
          <FileStack size={16} />
          Knowledge Base
        </div>
        <div className="sidebar-stats">
          {documents.length === 0
            ? "No documents uploaded"
            : `${readyCount} of ${documents.length} document${documents.length !== 1 ? "s" : ""} ready`}
        </div>
      </div>

      <div className="sidebar-content">
        <UploadZone
          onUpload={onUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        {documents.length > 0 ? (
          <div className="document-list">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <div className="empty-docs">
            <FolderOpen size={32} />
            <p>
              Upload PDFs, text files, markdown, or Word documents to build your
              knowledge base.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
