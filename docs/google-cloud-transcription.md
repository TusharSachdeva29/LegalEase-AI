# Google Cloud Speech-to-Text Integration Guide

This document provides instructions for setting up and using the Google Cloud Speech-to-Text API integration in the LegalEase Chrome extension.

## Prerequisites

1. **Google Cloud Account**: 
   - Create a Google Cloud account: https://cloud.google.com/
   - Create a new project in Google Cloud Console

2. **Enable Google Cloud Speech-to-Text API**:
   - Go to Google Cloud Console: https://console.cloud.google.com/
   - Navigate to "APIs & Services" > "Library"
   - Search for "Speech-to-Text API" and enable it

3. **Create API Key**:
   - In Google Cloud Console, go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key for use in your Next.js application
   - (Optional) Restrict the API key to only Speech-to-Text API

## Configuration

1. **Set up environment variables in Next.js**:
   - Create or update `.env.local` in your project root:
   ```
   GOOGLE_API_KEY=your-api-key-here
   ```

2. **Install Chrome extension**:
   - Load the updated extension in developer mode
   - Open Chrome and go to chrome://extensions/
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `chrome-extension` directory

## How It Works

The new transcription system works as follows:

1. When you click "Start Transcription" in the extension, it:
   - Captures audio from your microphone in 5-second chunks
   - Sends each chunk to your Next.js server

2. The Next.js server:
   - Receives the audio chunks
   - Forwards them to Google Cloud Speech-to-Text API
   - Returns the transcribed text to the extension

3. The extension:
   - Accumulates transcribed text
   - Sends it to the WebSocket server
   - Updates the UI with the transcribed text

## Benefits Over Previous Implementation

- **Higher Accuracy**: Google Cloud Speech-to-Text provides professional-grade transcription
- **Multiple Languages**: Supports 120+ languages and variants
- **Speaker Recognition**: Can identify different speakers (with additional configuration)
- **Custom Models**: Can be trained for legal terminology
- **Noise Robustness**: Better handling of background noise and multiple speakers

## Troubleshooting

1. **No transcription happening**:
   - Check browser console for errors
   - Verify your Google Cloud API key is valid
   - Ensure microphone permissions are granted

2. **Poor transcription quality**:
   - Check microphone quality and position
   - Consider using an external microphone
   - Reduce background noise

3. **API Errors**:
   - Check Google Cloud Console for quota limits
   - Verify API key restrictions
   - Review error messages in browser console
