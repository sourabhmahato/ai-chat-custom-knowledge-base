// pdf-parse ships a broken ESM build; use require() to load the CJS version.
// Turbopack may wrap the module, so handle both { default: fn } and fn directly.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const _pdfParseModule = require("pdf-parse") as any;
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> =
  _pdfParseModule.default ?? _pdfParseModule;

import mammoth from "mammoth";

export type SupportedFileType = "pdf" | "txt" | "md" | "docx";

const SUPPORTED_EXTENSIONS: Record<string, SupportedFileType> = {
  ".pdf": "pdf",
  ".txt": "txt",
  ".md": "md",
  ".docx": "docx",
};

export function getFileType(filename: string): SupportedFileType | null {
  const ext = "." + filename.split(".").pop()?.toLowerCase();
  return SUPPORTED_EXTENSIONS[ext] || null;
}

export function isSupportedFile(filename: string): boolean {
  return getFileType(filename) !== null;
}

export async function parseDocument(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const fileType = getFileType(filename);

  if (!fileType) {
    throw new Error(`Unsupported file type: ${filename}`);
  }

  switch (fileType) {
    case "pdf":
      return parsePDF(buffer);
    case "docx":
      return parseDOCX(buffer);
    case "txt":
    case "md":
      return buffer.toString("utf-8");
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
