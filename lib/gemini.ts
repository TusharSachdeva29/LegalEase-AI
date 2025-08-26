import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface DocumentAnalysis {
  title: string;
  overview: string;
  keyPoints: string[];
  risks: {
    id: number;
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    clauseId: number;
  }[];
  clauses: {
    id: number;
    title: string;
    originalText: string;
    simplifiedExplanation: string;
    whatThisMeans: string;
    riskLevel: "high" | "medium" | "low";
    category: string;
  }[];
}

export interface ChatResponse {
  response: string;
  context: "document" | "general";
}

const SYSTEM_PROMPT = `You are a specialized document analysis AI assistant for a Legal Document Simplification Platform. Your primary role is to analyze documents and provide clear, accurate, and understandable explanations.

Core Responsibilities:
1. Analyze ANY type of document and extract meaningful information
2. For legal documents: identify risks, obligations, and translate complex language
3. For non-legal documents: provide relevant analysis and extract key information
4. Handle various file formats (PDF, Word, images, text) intelligently
5. Provide practical advice and recommendations
6. Answer questions about document content and concepts

Guidelines:
- Always provide clear, non-technical explanations
- If it's a legal document: highlight risks, obligations, and legal implications
- If it's NOT a legal document: still provide valuable analysis of the content
- Be flexible and adapt your analysis to the document type
- Extract whatever meaningful information is available
- Provide actionable insights regardless of document type
- Maintain professional and helpful tone
- Include disclaimers when providing legal-related information

Document Analysis Approach:
- For Legal Documents: Focus on risks, obligations, terms, and legal implications
- For Business Documents: Focus on key terms, obligations, and business implications  
- For Technical Documents: Focus on requirements, specifications, and important details
- For Images/Scanned Documents: Extract and analyze any visible text or content
- For Corrupted/Unclear Documents: Work with available information and note limitations

Response Style:
- Use simple, everyday language
- Avoid unnecessary jargon (explain when needed)
- Structure responses clearly with headings and bullet points
- Be thorough but concise
- Always try to provide value even if the document isn't perfect

Important: Even if a document appears corrupted, incomplete, or is not a traditional legal document, still attempt to provide meaningful analysis of whatever content is available. Focus on extracting value and insights from any readable or interpretable information.`;

export async function analyzeDocument(
  documentText: string
): Promise<DocumentAnalysis> {
  try {
    console.log("Starting document analysis...");
    console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
    console.log("Document text length:", documentText.length);

    // Check if this is an image file
    const isImageContent =
      documentText.includes("[IMAGE_FILE]") &&
      documentText.includes("data:image");
    const isPDFContent = documentText.includes("[PDF_DOCUMENT]");
    const isUnreadablePDF =
      isPDFContent &&
      (documentText.includes("may contain primarily images") ||
        documentText.includes("makes text extraction difficult") ||
        documentText.length < 500);

    let model;
    let prompt;
    let result;

    if (isImageContent) {
      // Use Gemini Pro Vision for images
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Extract the image data URL
      const imageDataMatch = documentText.match(
        /Image Data: (data:image\/[^;]+;base64,[^\s]+)/
      );
      if (imageDataMatch) {
        const imageData = imageDataMatch[1];
        const base64Data = imageData.split(",")[1];
        const mimeType =
          imageData.match(/data:(image\/[^;]+)/)?.[1] || "image/jpeg";

        prompt = `${SYSTEM_PROMPT}

Please analyze this image which may contain legal documents, contracts, business documents, or other text content. Extract and analyze any visible text, legal clauses, business terms, or other meaningful information.

Please provide a comprehensive analysis in JSON format with the structure I specified earlier. Focus on whatever content is visible and readable in the image.`;

        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ]);
      } else {
        // Fallback to text analysis
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        prompt = `${SYSTEM_PROMPT}

This appears to be an image file that couldn't be processed properly. Please provide a generic document analysis structure indicating that the image content couldn't be analyzed.

Please return a JSON object with the standard structure, noting the limitation.`;
        result = await model.generateContent(prompt);
      }
    } else if (isUnreadablePDF) {
      // Handle PDFs that couldn't be read properly
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      prompt = `${SYSTEM_PROMPT}

This appears to be a PDF document that could not be properly read or contains primarily non-text content (like scanned images or complex formatting). 

Please provide a helpful analysis structure that acknowledges this limitation but still provides value to the user.

Please return a JSON object with the following structure:

{
  "title": "PDF Document Analysis",
  "overview": "This appears to be a PDF document that may contain scanned content, images, or complex formatting. While we cannot analyze the specific content, we can provide guidance on how to better process this type of document.", 
  "keyPoints": [
    "The document is a PDF file that may contain scanned or image-based content",
    "Text extraction was limited due to the document format",  
    "For better analysis, consider converting to text or using OCR tools",
    "The document may still contain valuable information that requires manual review"
  ],
  "risks": [
    {
      "id": 1,
      "title": "Limited Analysis",
      "description": "Due to the PDF format and content type, automated analysis is limited. Manual review may be needed to identify important terms, obligations, or risks.",
      "severity": "medium",
      "clauseId": 1
    }
  ],
  "clauses": [
    {
      "id": 1,
      "title": "Document Content",
      "originalText": "PDF content could not be fully extracted",
      "simplifiedExplanation": "This PDF appears to contain scanned images, complex formatting, or non-text elements that make automated text extraction difficult.",
      "whatThisMeans": "You may need to manually review the document or use OCR (Optical Character Recognition) tools to extract the text content for analysis.",
      "riskLevel": "low",
      "category": "Document Processing"
    }
  ]
}

Make this helpful and informative rather than just saying it failed.`;

      result = await model.generateContent(prompt);
    } else {
      // Use regular Gemini for text content (including PDF and Word docs)
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      prompt = `${SYSTEM_PROMPT}

Please analyze the following document content and provide a comprehensive analysis in JSON format. 

Important: This document might be:
- A legal document (contracts, agreements, terms of service, etc.)
- A business document (proposals, reports, policies, etc.) 
- Technical documentation
- A PDF or Word document with extracted content
- A partially readable or corrupted file

Your task is to extract and analyze whatever meaningful content is available, regardless of document type or quality.

Document Content:
"""
${documentText}
"""

Please return a JSON object with the following structure. Adapt your analysis to the document type:

{
  "title": "Descriptive title of what this document appears to be",
  "overview": "2-3 sentence summary of the document content and purpose", 
  "keyPoints": ["key point 1", "key point 2", "key point 3", "key point 4"],
  "risks": [
    {
      "id": 1,
      "title": "Risk or concern title",
      "description": "Description of the risk, issue, or important consideration",
      "severity": "high|medium|low",
      "clauseId": 1
    }
  ],
  "clauses": [
    {
      "id": 1,
      "title": "Section/clause title",
      "originalText": "Original text or content excerpt",
      "simplifiedExplanation": "Plain English explanation of this section",
      "whatThisMeans": "Practical implications for the reader",
      "riskLevel": "high|medium|low",
      "category": "Category like 'Terms', 'Privacy', 'Payment', 'General Info', etc."
    }
  ]
}

Guidelines for your analysis:
- If it's a legal document: Focus on legal terms, obligations, and risks
- If it's a business document: Focus on business terms, requirements, and considerations  
- If content is unclear/corrupted: Work with available information and provide useful insights anyway
- If it's a PDF or Word doc: Extract and analyze the readable content
- Always provide meaningful analysis: Even if the document isn't perfect, extract useful insights
- Be creative and helpful: Provide value regardless of document quality or type

Ensure the JSON is valid and complete. Provide meaningful analysis regardless of document quality.`;

      result = await model.generateContent(prompt);
    }

    console.log("Sending request to Gemini...");
    const response = result.response;
    const text = response.text();

    console.log("Gemini response received, length:", text.length);
    console.log("Gemini response preview:", text.substring(0, 200));

    // Clean up markdown formatting from Gemini response
    const cleanedText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove ** bold formatting
      .replace(/\*(.*?)\*/g, "$1") // Remove * italic formatting
      .replace(/#{1,6}\s/g, "") // Remove # headers
      .trim();

    // Extract JSON from response (in case there's additional text)
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", cleanedText);
      // Return a fallback analysis if JSON extraction fails
      return {
        title: "Document Analysis",
        overview:
          "The document was processed but a detailed analysis could not be completed. Please try uploading a clearer document or a different file format.",
        keyPoints: [
          "Document was received and processed",
          "Content may need manual review",
          "Try uploading a clearer or different format if needed",
        ],
        risks: [
          {
            id: 1,
            title: "Analysis Limitation",
            description:
              "The document content could not be fully analyzed. This may be due to file format, quality, or content type.",
            severity: "low" as const,
            clauseId: 1,
          },
        ],
        clauses: [
          {
            id: 1,
            title: "Document Content",
            originalText: "Document content was not clearly readable",
            simplifiedExplanation:
              "The uploaded document could not be fully processed for detailed analysis.",
            whatThisMeans:
              "You may want to try uploading the document in a different format or ensure it's clearly readable.",
            riskLevel: "low" as const,
            category: "General",
          },
        ],
      };
    }

    console.log("JSON extracted, parsing...");
    const analysisData = JSON.parse(jsonMatch[0]);
    console.log("Analysis completed successfully");
    return analysisData;
  } catch (error) {
    console.error("Error analyzing document:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Return a user-friendly fallback response instead of throwing
    return {
      title: "Document Processing Error",
      overview:
        "There was an issue processing your document, but we're still trying to help. The file was received and we attempted analysis.",
      keyPoints: [
        "Document upload was successful",
        "Processing encountered some difficulties",
        "This may be due to file format or content complexity",
        "Try uploading a different format if available",
      ],
      risks: [
        {
          id: 1,
          title: "Processing Issue",
          description:
            "The document could not be fully processed due to technical limitations. This doesn't necessarily mean there's anything wrong with your document.",
          severity: "low" as const,
          clauseId: 1,
        },
      ],
      clauses: [
        {
          id: 1,
          title: "Document Content",
          originalText: "Content could not be extracted",
          simplifiedExplanation:
            "We encountered technical difficulties processing this specific document format or content.",
          whatThisMeans:
            "You can try uploading the same document in a different format (PDF, DOCX, TXT, or image) for better results.",
          riskLevel: "low" as const,
          category: "Technical",
        },
      ],
    };
  }
}

export async function chatWithAI(
  message: string,
  context: "document" | "general",
  documentContext?: string
): Promise<ChatResponse> {
  try {
    console.log("Starting chat with AI...");
    console.log("Message:", message);
    console.log("Context:", context);
    console.log("Has document context:", !!documentContext);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `${SYSTEM_PROMPT}

Context: ${context === "document" ? "Document-specific" : "General legal"}`;

    if (context === "document" && documentContext) {
      prompt += `

Document Context:
"""
${documentContext}
"""`;
    }

    prompt += `

User Question: ${message}

Please provide a helpful, clear response. If this is document-specific, reference the actual document content. If general, provide educational legal information. Always include a disclaimer that this is not legal advice.`;

    console.log("Sending chat request to Gemini...");
    const result = await model.generateContent(prompt);
    const response = result.response;

    console.log("Chat response received");
    const responseText = response.text();

    // Clean up markdown formatting from Gemini response
    const cleanedResponse = responseText
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove ** bold formatting
      .replace(/\*(.*?)\*/g, "$1") // Remove * italic formatting
      .replace(/#{1,6}\s/g, "") // Remove # headers
      .trim();

    return {
      response: cleanedResponse,
      context,
    };
  } catch (error) {
    console.error("Error in chat:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    throw new Error(
      `Failed to get AI response: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    try {
      // Handle different file types
      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        // For PDF files, try to extract text using simple text parsing
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text) {
            reject(new Error("Failed to read PDF file"));
            return;
          }

          // Try to extract readable text from PDF
          let extractedText = "";

          // Look for text patterns in PDF stream
          const streamMatches = text.match(/stream([\s\S]*?)endstream/gi);
          if (streamMatches) {
            streamMatches.forEach((match) => {
              // Extract text between stream tags
              const streamContent = match.replace(
                /^stream\s*|\s*endstream$/gi,
                ""
              );
              // Look for readable text patterns
              const textPatterns = streamContent.match(
                /[A-Za-z0-9\s.,!?;:()\[\]{}"'-]{10,}/g
              );
              if (textPatterns) {
                extractedText += textPatterns.join(" ") + " ";
              }
            });
          }

          // Also try to find text objects
          const textMatches = text.match(/\(([^)]+)\)/g);
          if (textMatches) {
            textMatches.forEach((match) => {
              const textContent = match.replace(/[()]/g, "");
              if (textContent.length > 5 && /[a-zA-Z]/.test(textContent)) {
                extractedText += textContent + " ";
              }
            });
          }

          // If we found some text, use it
          if (extractedText.trim().length > 50) {
            resolve(`[PDF_DOCUMENT] This is a PDF document (${
              file.name
            }) with extracted text content:

${extractedText.trim()}`);
          } else {
            // If no readable text found, provide a helpful message
            resolve(`[PDF_DOCUMENT] This appears to be a PDF document (${file.name}) that may contain primarily images, scanned content, or complex formatting that makes text extraction difficult. 

Please note: This PDF might be:
- A scanned document (image-based PDF)
- A document with complex formatting
- A form or document with mostly graphical content
- An image-heavy document

For better analysis, you might want to:
1. Try converting the PDF to a text file or Word document
2. Take a screenshot of the PDF content and upload as an image
3. Copy and paste the text content directly if possible

File name: ${file.name}
File type: PDF Document`);
          }
        };
        reader.readAsText(file, "utf-8");
      } else if (
        fileType.startsWith("image/") ||
        fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)
      ) {
        // Handle image files - convert to base64 for Gemini Vision
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          resolve(`[IMAGE_FILE] This is an image file (${file.name}) that may contain text, legal documents, contracts, or other important information. Please analyze any visible text, legal content, business terms, or other meaningful information in this image and provide a comprehensive analysis.

Image Data: ${dataUrl}`);
        };
        reader.readAsDataURL(file);
      } else if (
        fileType.includes("word") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      ) {
        // Handle Word documents
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text) {
            reject(new Error("Failed to read Word document"));
            return;
          }

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
            resolve(`[WORD_DOCUMENT] This is a Word document file (${file.name}). Here is the extracted content:

${cleanContent}`);
          } else {
            resolve(`[WORD_DOCUMENT] This appears to be a Word document (${file.name}) that may have complex formatting or primarily non-text content. 

For better analysis, you might want to:
1. Save the document as a plain text (.txt) file
2. Copy and paste the content directly
3. Save as a PDF and try uploading that

File name: ${file.name}
File type: Word Document`);
          }
        };
        reader.readAsText(file, "utf-8");
      } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
        // Handle plain text files
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text) {
            reject(new Error("Failed to extract text from file"));
            return;
          }
          resolve(text);
        };
        reader.readAsText(file, "utf-8");
      } else {
        // Handle unknown file types as text
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text) {
            reject(new Error("Failed to extract text from file"));
            return;
          }
          resolve(`[UNKNOWN_FILE_TYPE] This is a file of type ${
            fileType || "unknown"
          } (${file.name}). Here is the extracted content:

${text}`);
        };
        reader.readAsText(file, "utf-8");
      }
    } catch (error) {
      reject(
        new Error(
          `Error processing file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      );
    }
  });
}
