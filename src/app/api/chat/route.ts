import { NextRequest } from "next/server";
import { retrieveRelevantChunks } from "@/lib/rag/retriever";
import { buildSystemPrompt, buildSourceMetadata } from "@/lib/rag/prompt";
import {
  streamGeminiChat,
  ChatMessage as GeminiMessage,
} from "@/lib/llm/gemini";
import {
  streamOllamaChat,
  ChatMessage as OllamaMessage,
} from "@/lib/llm/ollama";

interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  provider?: "gemini" | "ollama";
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, provider = "gemini" } = body;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage.role !== "user") {
      return new Response(
        JSON.stringify({ error: "Last message must be from user" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // 1. Retrieve relevant chunks
    const relevantChunks = await retrieveRelevantChunks(
      lastUserMessage.content,
      5,
    );

    // 2. Build system prompt with context
    const systemPrompt = buildSystemPrompt(relevantChunks);

    // 3. Build source metadata
    const sources = buildSourceMetadata(relevantChunks);

    // 4. Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send sources first
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "sources", sources })}\n\n`,
            ),
          );

          // Stream the chat response
          const chatMessages = messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

          let streamFn: (
            systemPrompt: string,
            messages: (GeminiMessage | OllamaMessage)[],
          ) => AsyncGenerator<string>;

          if (provider === "ollama") {
            streamFn = streamOllamaChat;
          } else {
            streamFn = streamGeminiChat;
          }

          for await (const chunk of streamFn(systemPrompt, chatMessages)) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", content: chunk })}\n\n`,
              ),
            );
          }

          // Signal completion
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
          );
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: error instanceof Error ? error.message : "Stream failed" })}\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Chat failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
