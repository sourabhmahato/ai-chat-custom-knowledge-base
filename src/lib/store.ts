// In-memory store for documents, chunks, and embeddings
// Data persists for the lifetime of the server process

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
  chunkCount: number;
  error?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  content: string;
  embedding: number[];
  chunkIndex: number;
  metadata: {
    startChar: number;
    endChar: number;
  };
}

class InMemoryStore {
  private documents: Map<string, Document> = new Map();
  private chunks: Map<string, DocumentChunk[]> = new Map(); // documentId -> chunks

  // Documents
  addDocument(doc: Document): void {
    this.documents.set(doc.id, doc);
  }

  getDocument(id: string): Document | undefined {
    return this.documents.get(id);
  }

  getAllDocuments(): Document[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
    );
  }

  updateDocument(id: string, updates: Partial<Document>): void {
    const doc = this.documents.get(id);
    if (doc) {
      this.documents.set(id, { ...doc, ...updates });
    }
  }

  deleteDocument(id: string): void {
    this.documents.delete(id);
    this.chunks.delete(id);
  }

  // Chunks
  addChunks(documentId: string, newChunks: DocumentChunk[]): void {
    this.chunks.set(documentId, newChunks);
  }

  getAllChunks(): DocumentChunk[] {
    return Array.from(this.chunks.values()).flat();
  }

  getChunksByDocumentId(documentId: string): DocumentChunk[] {
    return this.chunks.get(documentId) || [];
  }

  // Stats
  getTotalChunks(): number {
    return this.getAllChunks().length;
  }

  getTotalDocuments(): number {
    return this.documents.size;
  }
}

// Singleton instance
const store = new InMemoryStore();
export default store;
