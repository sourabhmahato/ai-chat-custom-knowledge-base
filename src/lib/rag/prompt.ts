import { RetrievalResult } from "./retriever";

export function buildSystemPrompt(sources: RetrievalResult[]): string {
  if (sources.length === 0) {
    return `You are a helpful AI assistant. The user has uploaded documents to a knowledge base, but no relevant content was found for this query. 

Answer to the best of your ability, and let the user know if their question might not be covered by the uploaded documents.

Be concise, helpful, and conversational.`;
  }

  const contextBlocks = sources
    .map((source, index) => {
      return `[Source ${index + 1}] (from "${source.chunk.documentName}", chunk ${source.chunk.chunkIndex + 1}):\n${source.chunk.content}`;
    })
    .join("\n\n---\n\n");

  return `You are a helpful AI assistant that answers questions based on the user's uploaded documents. 

Use the following document excerpts to answer the user's question. When you use information from a source, cite it using [Source N] notation.

If the sources don't contain enough information to answer fully, say so honestly and provide what you can from the sources.

Be concise, accurate, and conversational. Format your response using markdown when helpful (lists, bold, code blocks, etc).

## Relevant Document Excerpts

${contextBlocks}

## Instructions
- Answer based on the sources above
- Cite sources using [Source 1], [Source 2], etc.
- Be honest if the sources don't fully answer the question
- Be conversational and helpful`;
}

export function buildSourceMetadata(sources: RetrievalResult[]) {
  return sources.map((source, index) => ({
    sourceIndex: index + 1,
    documentName: source.chunk.documentName,
    chunkIndex: source.chunk.chunkIndex,
    content: source.chunk.content,
    similarity: Math.round(source.similarity * 100) / 100,
  }));
}
