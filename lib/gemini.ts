import { GoogleGenAI, createPartFromUri } from "@google/genai";

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

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
    console.log("API Key exists:", !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
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

        result = await genAI.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: [
            prompt,
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
          ],
        });
      } else {
        // Fallback to text analysis
        prompt = `${SYSTEM_PROMPT}

This appears to be an image file that couldn't be processed properly. Please provide a generic document analysis structure indicating that the image content couldn't be analyzed.

Please return a JSON object with the standard structure, noting the limitation.`;
        result = await genAI.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: prompt,
        });
      }
    } else if (isUnreadablePDF) {
      // Handle PDFs that couldn't be read properly
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

      result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });
    } else {
      // Use regular Gemini for text content (including PDF and Word docs)
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

      result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });
    }

    console.log("Sending request to Gemini...");
    const text = result.text || "";

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
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    console.log("Chat response received");
    const responseText = result.text || "";

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

// This function is now deprecated - use the new processDocument from document-processor.ts instead
// which uses direct file upload to Gemini
export async function extractTextFromFile(file: File): Promise<string> {
  console.warn(
    "extractTextFromFile is deprecated. Use processDocument from document-processor.ts instead."
  );

  // Simple fallback for backwards compatibility
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        reject(new Error("Failed to read file"));
        return;
      }
      resolve(text);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file, "utf-8");
  });
}
