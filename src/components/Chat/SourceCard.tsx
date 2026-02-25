"use client";

import React, { useState } from "react";
import { Source } from "@/hooks/useChat";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

interface SourceCardProps {
  source: Source;
}

export default function SourceCard({ source }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`source-card ${expanded ? "expanded" : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="source-card-header">
        <span className="source-badge">Source {source.sourceIndex}</span>
        <FileText size={12} />
        <span className="source-doc-name">{source.documentName}</span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </div>
      <div className="source-preview">{source.content}</div>
      <div className="source-similarity">
        {Math.round(source.similarity * 100)}% match
      </div>
    </div>
  );
}
