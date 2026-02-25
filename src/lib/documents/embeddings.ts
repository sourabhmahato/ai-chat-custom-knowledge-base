import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ollama } from "ollama";

export type EmbeddingProvider = "gemini" | "ollama";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

function getOllamaClient(): Ollama {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  return new Ollama({ host: baseUrl });
}

/** Determines which embedding provider to use, falling back to ollama if no Gemini key is set. */
export function resolveEmbeddingProvider(): EmbeddingProvider {
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "ollama";
}

async function generateGeminiEmbedding(text: string): Promise<number[]> {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function generateOllamaEmbedding(text: string): Promise<number[]> {
  const ollama = getOllamaClient();
  const model = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
  const result = await ollama.embeddings({ model, prompt: text });
  return result.embedding;
}

export async function generateEmbedding(
  text: string,
  provider?: EmbeddingProvider,
): Promise<number[]> {
  const resolvedProvider = provider ?? resolveEmbeddingProvider();
  if (resolvedProvider === "ollama") {
    return generateOllamaEmbedding(text);
  }
  return generateGeminiEmbedding(text);
}

export async function generateEmbeddings(
  texts: string[],
  provider?: EmbeddingProvider,
): Promise<number[][]> {
  const resolvedProvider = provider ?? resolveEmbeddingProvider();

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const promises = batch.map((text) =>
      generateEmbedding(text, resolvedProvider),
    );
    const batchResults = await Promise.all(promises);
    allEmbeddings.push(...batchResults);
  }

  return allEmbeddings;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}
