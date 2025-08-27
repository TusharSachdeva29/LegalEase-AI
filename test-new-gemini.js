// Simple test script to verify the new Gemini SDK integration
const { GoogleGenAI, createPartFromUri } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// This is a simple test to verify the new SDK is working
async function testGeminiSDK() {
  try {
    console.log('Testing new @google/genai SDK...');
    
    // Check if API key is set
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error('NEXT_PUBLIC_GEMINI_API_KEY environment variable not set');
      return;
    }
    
    const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    
    // Simple text generation test
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: "Hello! Can you tell me you're working correctly? Just respond with 'Yes, the new Gemini SDK is working!'",
    });
    
    console.log('Response from Gemini:', response.text);
    console.log('✅ New Gemini SDK is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Gemini SDK:', error);
  }
}

// Run the test
testGeminiSDK();
