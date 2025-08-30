import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { transcript, meetingId } = await req.json();
    
    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided for analysis' },
        { status: 400 }
      );
    }
    
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create a prompt for legal analysis
    const prompt = `
      You are an AI legal assistant in a meeting between lawyers and clients.
      Analyze this legal conversation transcript and provide:
      
      1. A concise summary of the key legal points discussed
      2. Identification of any legal questions or concerns raised
      3. Brief explanations of relevant legal concepts mentioned
      4. Any important legal considerations that may have been overlooked
      
      Format your response in clear, concise language that both legal professionals and clients can understand.
      
      Transcript:
      "${transcript.slice(0, 5000)}" // Limiting to 5000 chars for safety
    `;
    
    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    
    return NextResponse.json({ 
      analysis,
      meetingId,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error analyzing transcript with Gemini:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transcript with Gemini' },
      { status: 500 }
    );
  }
}
