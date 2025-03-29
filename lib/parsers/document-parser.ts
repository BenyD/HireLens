import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import * as fs from "fs";
import * as mammoth from "mammoth";

/**
 * Parse a PDF file using LangChain's PDFLoader
 * This function expects a local file path - parsing happens from local disk
 *
 * @param filePath Path to the PDF file
 * @returns Array of Document objects with content and metadata
 */
export async function parsePdf(filePath: string): Promise<Document[]> {
  try {
    console.log(`Parsing PDF from local path: ${filePath}`);
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    return docs;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
}

/**
 * Extract text from a DOCX file using mammoth.js
 * This function expects a local file path - parsing happens from local disk
 *
 * @param filePath Path to the DOCX file
 * @returns Document object with extracted text
 */
export async function parseDocx(filePath: string): Promise<Document[]> {
  try {
    console.log(`Parsing DOCX from local path: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    return [
      new Document({
        pageContent: text,
        metadata: {
          source: filePath,
          format: "docx",
        },
      }),
    ];
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error("Failed to parse DOCX file");
  }
}

/**
 * Parse HTML text and extract content
 * @param htmlText Raw HTML text
 * @returns Document object with extracted text
 */
export async function parseHtml(htmlText: string): Promise<Document[]> {
  try {
    // Write the HTML to a temporary file
    const tempFile = `/tmp/temp_${Date.now()}.html`;
    fs.writeFileSync(tempFile, htmlText);

    // Use CheerioWebBaseLoader to load and parse the HTML
    const loader = new CheerioWebBaseLoader(tempFile);
    const docs = await loader.load();

    // Clean up the temporary file
    fs.unlinkSync(tempFile);

    return docs;
  } catch (error) {
    console.error("Error parsing HTML:", error);
    throw new Error("Failed to parse HTML text");
  }
}

/**
 * Parse a file based on its mime type
 * This function is the main entry point for file parsing
 * It uses local file paths, not Vercel Blob URLs
 *
 * @param filePath Path to the file (local)
 * @param mimeType MIME type of the file
 * @returns Array of Document objects with parsed content
 */
export async function parseFile(
  filePath: string,
  mimeType: string
): Promise<Document[]> {
  // We only use local file paths for parsing, not Blob URLs
  console.log(`Parsing file: ${filePath} (${mimeType})`);

  if (mimeType === "application/pdf") {
    return parsePdf(filePath);
  } else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return parseDocx(filePath);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Parse plain text into a Document object
 * @param text Plain text content
 * @returns Document object with the text content
 */
export function parseText(text: string): Document[] {
  console.log(`Parsing plain text (${text.length} characters)`);
  return [
    new Document({
      pageContent: text,
      metadata: {
        format: "text",
      },
    }),
  ];
}
