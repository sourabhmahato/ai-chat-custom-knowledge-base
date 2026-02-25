import { NextRequest, NextResponse } from "next/server";
import store from "@/lib/store";
import { parseDocument, isSupportedFile } from "@/lib/documents/parser";
import { chunkText } from "@/lib/documents/chunker";
import { generateEmbeddings } from "@/lib/documents/embeddings";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isSupportedFile(file.name)) {
      return NextResponse.json(
        { error: "Unsupported file type. Supported: PDF, TXT, MD, DOCX" },
        { status: 400 },
      );
    }

    // Create document record
    const docId = crypto.randomUUID();
    store.addDocument({
      id: docId,
      name: file.name,
      type: file.type || "unknown",
      size: file.size,
      uploadedAt: new Date(),
      status: "processing",
      chunkCount: 0,
    });

    // Process in background (non-blocking response)
    processDocument(docId, file).catch((error) => {
      console.error(`Error processing document ${docId}:`, error);
      store.updateDocument(docId, {
        status: "error",
        error: error instanceof Error ? error.message : "Processing failed",
      });
    });

    return NextResponse.json({
      id: docId,
      name: file.name,
      status: "processing",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 },
    );
  }
}

async function processDocument(docId: string, file: File) {
  // 1. Parse document
  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await parseDocument(buffer, file.name);

  if (!text.trim()) {
    throw new Error("Document appears to be empty or could not be parsed");
  }

  // 2. Chunk the text
  const textChunks = chunkText(text);

  // 3. Generate embeddings
  const embeddings = await generateEmbeddings(textChunks.map((c) => c.content));

  // 4. Store chunks with embeddings
  const documentChunks = textChunks.map((chunk, i) => ({
    id: crypto.randomUUID(),
    documentId: docId,
    documentName: file.name,
    content: chunk.content,
    embedding: embeddings[i],
    chunkIndex: chunk.chunkIndex,
    metadata: chunk.metadata,
  }));

  store.addChunks(docId, documentChunks);
  store.updateDocument(docId, {
    status: "ready",
    chunkCount: documentChunks.length,
  });
}
