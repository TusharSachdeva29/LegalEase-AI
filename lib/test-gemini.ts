import { GoogleGenerativeAI } from "@google/generative-ai";

// Test script to verify Gemini API connection
async function testGeminiConnection() {
  try {
    console.log("Testing Gemini API connection...");

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    console.log("API Key exists:", !!apiKey);
    if (apiKey) {
      console.log("API Key format:", apiKey.substring(0, 10) + "...");
    } else {
      console.log("API Key format: undefined");
      throw new Error("Gemini API key is not defined in environment variables.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const testPrompt = "Hello, please respond with 'Connection successful!'";
    console.log("Sending test request...");

    const result = await model.generateContent(testPrompt);
    const response = result.response;
    const text = response.text();

    console.log("Success! Response:", text);
    return text;
  } catch (error) {
    console.error("Connection test failed:", error);
    throw error;
  }
}

export { testGeminiConnection };
