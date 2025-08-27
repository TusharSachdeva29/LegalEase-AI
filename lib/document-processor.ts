import { GoogleGenAI, createPartFromUri } from "@google/genai";

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export interface ProcessedDocument {
  text: string;
  fileName: string;
  fileType: string;
  processingMethod: "gemini-direct" | "text" | "fallback";
  fileUri?: string;
  mimeType?: string;
}

export async function processDocument(file: File): Promise<ProcessedDocument> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    // Handle different file types - try Gemini direct upload first for supported types
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return await processWithGemini(file, "application/pdf");
    } else if (
      fileType.startsWith("image/") ||
      fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)
    ) {
      return await processWithGemini(file, fileType || "image/jpeg");
    } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      return await processTextFile(file);
    } else if (
      fileType.includes("word") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc")
    ) {
      // For Word documents, try to extract text first, then send to Gemini
      return await processWordDocument(file);
    } else {
      // Try to process as text
      return await processTextFile(file);
    }
  } catch (error) {
    console.error("Error processing document:", error);
    throw new Error(
      `Failed to process document: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function processWithGemini(
  file: File,
  mimeType: string
): Promise<ProcessedDocument> {
  try {
    console.log(`Processing ${file.name} with Gemini direct upload...`);

    // Convert File to Blob if needed
    const fileBlob = new Blob([await file.arrayBuffer()], { type: mimeType });

    // Upload the file to Gemini
    const uploadedFile = await genAI.files.upload({
      file: fileBlob,
      config: { displayName: file.name },
    });

    console.log(`File uploaded: ${uploadedFile.name}`);

    if (!uploadedFile.name) {
      throw new Error("Failed to upload file - no file name returned");
    }

    // Poll until processing completes
    let fileStatus = await genAI.files.get({ name: uploadedFile.name });
    let retries = 0;
    const maxRetries = 30; // 5 minutes max wait time

    while (fileStatus.state === "PROCESSING" && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      fileStatus = await genAI.files.get({ name: uploadedFile.name });
      console.log(`Processing status: ${fileStatus.state}`);
      retries++;
    }

    if (fileStatus.state === "FAILED") {
      throw new Error("File processing failed in Gemini");
    }

    if (fileStatus.state === "PROCESSING") {
      throw new Error("File processing timed out");
    }

    // Extract text content from the file using Gemini
    const prompt =
      "Please extract all text content from this document. Return only the raw text content without any additional formatting or commentary.";

    if (!uploadedFile.uri || !uploadedFile.mimeType) {
      throw new Error("File upload incomplete - missing URI or MIME type");
    }

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        prompt,
        createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
      ],
    });

    const extractedText = response.text;

    // Clean up the file after processing (optional)
    try {
      await genAI.files.delete({ name: uploadedFile.name });
    } catch (deleteError) {
      console.warn("Failed to delete uploaded file:", deleteError);
    }

    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error("No readable text content found in the document");
    }

    return {
      text: extractedText.trim(),
      fileName: file.name,
      fileType: mimeType,
      processingMethod: "gemini-direct",
      fileUri: uploadedFile.uri,
      mimeType: uploadedFile.mimeType,
    };
  } catch (error) {
    console.error(`Error processing ${file.name} with Gemini:`, error);

    // Fallback to text processing for non-binary files
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      console.log("Falling back to text processing...");
      return await processTextFile(file);
    }

    // For other files, return a meaningful error response
    throw new Error(
      `Failed to process document with Gemini: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function processTextFile(file: File): Promise<ProcessedDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text || text.trim().length < 10) {
        reject(
          new Error("File appears to be empty or contains no readable text")
        );
        return;
      }
      resolve({
        text: text.trim(),
        fileName: file.name,
        fileType: file.type,
        processingMethod: "text",
      });
    };
    reader.onerror = () => reject(new Error("Failed to read text file"));
    reader.readAsText(file, "utf-8");
  });
}

async function processWordDocument(file: File): Promise<ProcessedDocument> {
  // For Word documents, we'll try to read as text first
  // In a production environment, you'd want to use a proper Word parser
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;

      // Try to extract readable text from Word document
      let extractedText = text;

      // Remove common binary markers and try to extract readable text
      extractedText = extractedText.replace(/[^\x20-\x7E\s]/g, " ");
      extractedText = extractedText.replace(/\s+/g, " ").trim();

      // Look for actual content (more than just metadata)
      const meaningfulContent = extractedText.match(
        /[A-Za-z0-9\s.,!?;:()\[\]{}"'-]{20,}/g
      );

      if (meaningfulContent && meaningfulContent.length > 0) {
        const cleanContent = meaningfulContent.join(" ").trim();
        if (cleanContent.length > 100) {
          resolve({
            text: cleanContent,
            fileName: file.name,
            fileType: file.type,
            processingMethod: "fallback",
          });
          return;
        }
      }

      reject(
        new Error(
          "Unable to extract readable text from Word document. Please save as PDF or plain text."
        )
      );
    };
    reader.onerror = () => reject(new Error("Failed to read Word document"));
    reader.readAsText(file, "utf-8");
  });
}
