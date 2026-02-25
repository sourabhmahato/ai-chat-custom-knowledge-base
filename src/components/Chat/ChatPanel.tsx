"use client";

import React, { useRef, useEffect } from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import { Message, Provider } from "@/hooks/useChat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  provider: Provider;
  onProviderChange: (provider: Provider) => void;
  onSendMessage: (message: string) => void;
  onStopGenerating: () => void;
  onClearMessages: () => void;
  hasDocuments: boolean;
}

const SUGGESTIONS = [
  "What are the main topics covered?",
  "Summarize the key points",
  "What are the most important takeaways?",
  "Explain the core concepts",
];

export default function ChatPanel({
  messages,
  isLoading,
  provider,
  onProviderChange,
  onSendMessage,
  onStopGenerating,
  hasDocuments,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-logo">
            <Sparkles size={18} />
          </div>
          <div>
            <h1>NexusAI</h1>
            <div className="chat-header-subtitle">Chat with your documents</div>
          </div>
        </div>

        <div className="provider-toggle">
          <button
            className={`provider-btn ${provider === "gemini" ? "active" : ""}`}
            onClick={() => onProviderChange("gemini")}
          >
            ✦ Gemini
          </button>
          <button
            className={`provider-btn ${provider === "ollama" ? "active" : ""}`}
            onClick={() => onProviderChange("ollama")}
          >
            🦙 Ollama
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <MessageSquare size={32} />
            </div>
            <h2>Start a conversation</h2>
            <p>
              {hasDocuments
                ? "Your documents are ready! Ask me anything about them."
                : "Upload documents in the sidebar, then ask me questions about their content."}
            </p>
            {hasDocuments && (
              <div className="suggestion-chips">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="suggestion-chip"
                    onClick={() => onSendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={
                  isLoading &&
                  index === messages.length - 1 &&
                  message.role === "assistant"
                }
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        isLoading={isLoading}
        onStop={onStopGenerating}
      />
    </div>
  );
}
