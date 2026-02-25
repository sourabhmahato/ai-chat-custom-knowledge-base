import { Ollama } from "ollama";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function getOllamaClient(): Ollama {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  return new Ollama({ host: baseUrl });
}

export async function* streamOllamaChat(
  systemPrompt: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const ollama = getOllamaClient();
  const model = process.env.OLLAMA_MODEL || "llama3.2";

  const ollamaMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ];

  const response = await ollama.chat({
    model,
    messages: ollamaMessages,
    stream: true,
  });

  for await (const part of response) {
    if (part.message?.content) {
      yield part.message.content;
    }
  }
}

export async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const ollama = getOllamaClient();
    await ollama.list();
    return true;
  } catch {
    return false;
  }
}
