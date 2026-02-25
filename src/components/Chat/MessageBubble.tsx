"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Bot, User } from "lucide-react";
import { Message } from "@/hooks/useChat";
import SourceCard from "./SourceCard";
import LoadingDots from "@/components/ui/LoadingDots";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({
  message,
  isStreaming,
}: MessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">
        {message.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div>
        <div className="message-content">
          {message.role === "assistant" ? (
            message.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            ) : isStreaming ? (
              <LoadingDots />
            ) : null
          ) : (
            <p>{message.content}</p>
          )}
        </div>

        {/* Source citations */}
        {message.sources && message.sources.length > 0 && (
          <div className="sources-container">
            {message.sources.map((source) => (
              <SourceCard key={source.sourceIndex} source={source} />
            ))}
          </div>
        )}

        {/* Actions */}
        {message.role === "assistant" && message.content && (
          <div className="message-actions">
            <button className="message-action-btn" onClick={handleCopy}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
