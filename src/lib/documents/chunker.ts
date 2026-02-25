export interface TextChunk {
  content: string;
  chunkIndex: number;
  metadata: {
    startChar: number;
    endChar: number;
  };
}

const DEFAULT_CHUNK_SIZE = 1500; // characters (~375 tokens)
const DEFAULT_CHUNK_OVERLAP = 200; // characters (~50 tokens)

export function chunkText(
  text: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  chunkOverlap: number = DEFAULT_CHUNK_OVERLAP,
): TextChunk[] {
  // Clean up the text
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleanedText.length === 0) {
    return [];
  }

  // If text is smaller than chunk size, return as single chunk
  if (cleanedText.length <= chunkSize) {
    return [
      {
        content: cleanedText,
        chunkIndex: 0,
        metadata: { startChar: 0, endChar: cleanedText.length },
      },
    ];
  }

  const chunks: TextChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanedText.length) {
    let endIndex = Math.min(startIndex + chunkSize, cleanedText.length);

    // Try to break at a paragraph boundary
    if (endIndex < cleanedText.length) {
      const breakPoint = findBreakPoint(cleanedText, startIndex, endIndex);
      if (breakPoint > startIndex) {
        endIndex = breakPoint;
      }
    }

    const content = cleanedText.slice(startIndex, endIndex).trim();

    if (content.length > 0) {
      chunks.push({
        content,
        chunkIndex,
        metadata: { startChar: startIndex, endChar: endIndex },
      });
      chunkIndex++;
    }

    // Move forward by chunk size minus overlap
    startIndex = endIndex - chunkOverlap;

    // Prevent infinite loop
    if (startIndex >= cleanedText.length - chunkOverlap) {
      break;
    }
  }

  return chunks;
}

function findBreakPoint(text: string, start: number, end: number): number {
  // Look for paragraph break (double newline)
  const paragraphBreak = text.lastIndexOf("\n\n", end);
  if (paragraphBreak > start + (end - start) * 0.5) {
    return paragraphBreak + 2; // Include the newlines
  }

  // Look for sentence end
  const sentenceEnd = text.lastIndexOf(". ", end);
  if (sentenceEnd > start + (end - start) * 0.5) {
    return sentenceEnd + 2;
  }

  // Look for any newline
  const newline = text.lastIndexOf("\n", end);
  if (newline > start + (end - start) * 0.5) {
    return newline + 1;
  }

  // Look for space
  const space = text.lastIndexOf(" ", end);
  if (space > start + (end - start) * 0.5) {
    return space + 1;
  }

  return end;
}
