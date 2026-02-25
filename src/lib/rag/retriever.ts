import store, { DocumentChunk } from "@/lib/store";
import {
  generateEmbedding,
  cosineSimilarity,
} from "@/lib/documents/embeddings";

export interface RetrievalResult {
  chunk: DocumentChunk;
  similarity: number;
}

export async function retrieveRelevantChunks(
  query: string,
  topK: number = 5,
  minSimilarity: number = 0.3,
): Promise<RetrievalResult[]> {
  const allChunks = store.getAllChunks();

  if (allChunks.length === 0) {
    return [];
  }

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Calculate similarity with all chunks
  const results: RetrievalResult[] = allChunks
    .map((chunk) => ({
      chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .filter((result) => result.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return results;
}
