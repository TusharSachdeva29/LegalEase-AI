# LegalEase Meet Assistant

A Chrome extension that enables real-time transcription and legal analysis of Google Meet conversations.

## Features

- Real-time speech recognition of Google Meet conversations
- Secure WebSocket communication with the LegalEase Next.js application
- AI-powered legal analysis of meeting transcripts using Google's Gemini API
- Simple UI integration with Google Meet

## Installation

### Development Mode

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right)
4. Click "Load unpacked" and select the `chrome-extension` directory
5. The extension should now appear in your extensions list

### Production Mode

1. Run the packaging script: `./package-extension.sh`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right)
4. Drag and drop the generated `legal-ease-meet-assistant.zip` file onto the extensions page
5. The extension should install and appear in your extensions list

## Usage

1. Open Google Meet and join or start a meeting
2. Click the LegalEase Meet Assistant extension icon in Chrome's toolbar
3. In the popup, click "Connect to Server" to establish a connection with your LegalEase application
4. Click "Start Transcription" to begin capturing and transcribing audio
5. The transcript will be sent to your LegalEase application in real-time
6. Use the LegalEase application to view the transcript and generate AI-powered legal analysis

## Configuration

- **Auto-connect on startup**: When enabled, the extension will automatically connect to the LegalEase server when Chrome starts
- **Show transcript on screen**: When enabled, a floating window will show the transcript directly in Google Meet

## Requirements

- Chrome browser (v88 or later)
- Access to a microphone
- Running LegalEase Next.js application with WebSocket server

## Development

The extension consists of these main components:

- `manifest.json`: Chrome extension configuration
- `background.js`: Handles WebSocket connection and audio capture
- `content.js`: Integrates with Google Meet UI and performs transcription
- `popup.html`, `popup.js`, `styles.css`: User interface components

## Permissions

This extension requires the following permissions:

- `activeTab`: To interact with the current tab
- `tabCapture`: To capture audio from Google Meet
- `storage`: To store user preferences
- `scripting`: To inject content scripts

## Troubleshooting

- If transcription isn't working, ensure you've allowed microphone access
- If the connection fails, check that your LegalEase application is running
- For audio capture issues, try refreshing the Google Meet page

## Privacy

This extension:
- Only captures audio when explicitly enabled by the user
- Only functions on Google Meet pages
- Sends transcripts only to your specified LegalEase server
- Does not store any audio or transcript data locally (except temporarily during processing)
