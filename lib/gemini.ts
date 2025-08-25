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

const SYSTEM_PROMPT = `You are a specialized legal AI assistant for a Legal Document Simplification Platform. Your primary role is to analyze legal documents and provide clear, accurate, and understandable explanations to non-lawyers.

Core Responsibilities:
1. Analyze legal documents and extract key information
2. Identify potential risks and legal obligations
3. Translate complex legal language into plain English
4. Provide practical advice and recommendations
5. Answer questions about legal concepts and document clauses

Guidelines:
- Always provide clear, non-technical explanations
- Highlight potential risks and important considerations
- Be objective and balanced in your analysis
- Include specific clause references when applicable
- Provide actionable recommendations where appropriate
- Maintain professional and helpful tone
- Include disclaimers that this is not legal advice when necessary

Document Analysis Format:
- Title: Brief description of document type
- Overview: 2-3 sentence summary of document purpose and key characteristics
- Key Points: 4-6 bullet points of most important terms
- Risks: Identify potential risks with severity levels (high/medium/low)
- Detailed Clause Analysis: Break down complex clauses into simple explanations

Response Style:
- Use simple, everyday language
- Avoid legal jargon unless necessary (then explain it)
- Use examples when helpful
- Structure responses clearly with headings and bullet points
- Keep explanations concise but comprehensive`;

export async function analyzeDocument(
  documentText: string
): Promise<DocumentAnalysis> {
  try {
    console.log("Starting document analysis...");
    console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
    console.log("Document text length:", documentText.length);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${SYSTEM_PROMPT}

Please analyze the following legal document and provide a comprehensive analysis in JSON format:

Document Text:
"""
${documentText}
"""

Please return a JSON object with the following structure:
{
  "title": "Brief document type description",
  "overview": "2-3 sentence summary",
  "keyPoints": ["point1", "point2", "point3", "point4"],
  "risks": [
    {
      "id": 1,
      "title": "Risk title",
      "description": "Risk description and implications",
      "severity": "high|medium|low",
      "clauseId": 1
    }
  ],
  "clauses": [
    {
      "id": 1,
      "title": "Clause title",
      "originalText": "Original clause text",
      "simplifiedExplanation": "Plain English explanation",
      "whatThisMeans": "Practical implications",
      "riskLevel": "high|medium|low",
      "category": "Category like 'Payment', 'Termination', etc."
    }
  ]
}

Ensure the JSON is valid and complete.`;

    console.log("Sending request to Gemini...");
    const result = await model.generateContent(prompt);
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
      throw new Error("No valid JSON found in response");
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
    throw new Error(
      `Failed to analyze document: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
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
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        reject(new Error("Failed to extract text from file"));
        return;
      }

      // For now, we'll handle plain text and basic PDF text extraction
      // In a production app, you'd use proper PDF parsing libraries
      resolve(text);
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    // For demo purposes, we'll read as text
    // In production, you'd handle different file types appropriately
    reader.readAsText(file);
  });
}
