"use client";

import React, { useRef, useEffect } from "react";
import { Send, ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

export default function ChatInput({
  onSend,
  isLoading,
  onStop,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = React.useState("");

  const handleSubmit = () => {
    if (value.trim() && !isLoading) {
      onSend(value);
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-grow textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Ask anything about your documents..."
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        {isLoading ? (
          <button
            className="chat-send-btn"
            onClick={onStop}
            title="Stop generating"
            style={{ background: "var(--accent-red)" }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>■</span>
          </button>
        ) : (
          <button
            className="chat-send-btn"
            onClick={handleSubmit}
            disabled={!value.trim()}
            title="Send message"
          >
            <ArrowUp size={18} />
          </button>
        )}
      </div>
      <div className="chat-input-hint">
        Press Enter to send · Shift+Enter for new line
      </div>
    </div>
  );
}
