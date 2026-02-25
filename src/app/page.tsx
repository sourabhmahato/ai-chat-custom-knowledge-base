"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";
import ChatPanel from "@/components/Chat/ChatPanel";
import DocumentSidebar from "@/components/Documents/DocumentSidebar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chat = useChat();
  const docs = useDocuments();

  const hasReadyDocs = docs.documents.some((d) => d.status === "ready");

  return (
    <div className="app-layout">
      {/* Mobile Toggle */}
      <button
        className="mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={20} />
      </button>

      {/* Document Sidebar */}
      <DocumentSidebar
        documents={docs.documents}
        isUploading={docs.isUploading}
        uploadProgress={docs.uploadProgress}
        onUpload={docs.uploadDocument}
        onDelete={docs.deleteDocument}
        isOpen={sidebarOpen}
      />

      {/* Chat Panel */}
      <ChatPanel
        messages={chat.messages}
        isLoading={chat.isLoading}
        provider={chat.provider}
        onProviderChange={chat.setProvider}
        onSendMessage={chat.sendMessage}
        onStopGenerating={chat.stopGenerating}
        onClearMessages={chat.clearMessages}
        hasDocuments={hasReadyDocs}
      />
    </div>
  );
}
