# Voice Chat Features Implementation

## Features Added

### 1. Speech-to-Text (Voice Input)

- **Microphone Button**: Click the microphone icon next to the send button to start voice recording
- **Real-time Recording**: Visual feedback with red recording indicator
- **Automatic Transcription**: Your speech is converted to text using Google Speech-to-Text API
- **Smart Processing**: Optimized for legal terminology and conversational speech

### 2. Text-to-Speech (AI Voice Response)

- **Speaker Button**: Click the speaker icon on AI messages to hear them read aloud
- **Natural Voice**: Uses Google Text-to-Speech with natural-sounding voice
- **Pause/Resume**: Click again to stop the current speech

### 3. User Interface Enhancements

- **Voice Recording Indicator**: Red microphone icon and "Recording..." status when active
- **Processing Feedback**: Loading indicator while converting speech to text
- **Error Handling**: Toast notifications for any voice-related errors
- **Accessibility**: Full keyboard and screen reader support

## API Endpoints Created

### `/api/speech-to-text`

- Converts audio recordings to text
- Optimized for legal terminology
- Handles various audio formats (WebM, MP3, WAV)

### `/api/text-to-speech`

- Converts AI responses to natural speech
- Configurable voice and speed settings
- Returns high-quality MP3 audio

## Usage Instructions

### For Voice Input:

1. Click the microphone button (🎤) next to the send button
2. Speak clearly into your microphone
3. Click the red microphone button (🎤❌) to stop recording
4. Wait for processing - your speech will appear as text in the input field
5. Edit if needed, then send your message

### For Listening to AI Responses:

1. After receiving an AI response, look for the speaker button (🔊) in the top-right of the message
2. Click it to hear the AI response read aloud
3. Click the mute button (🔇) to stop playback

## Technical Implementation

### Voice Recording Hook (`useVoiceRecording`)

- Handles microphone access and MediaRecorder API
- Automatic audio format detection
- Error handling for permission issues

### Text-to-Speech Hook (`useTextToSpeech`)

- Manages audio playback
- Base64 audio decoding
- Playback state management

### Environment Variables Required

```env
GOOGLE_SPEECH_TO_TEXT=your_google_api_key
GOOGLE_TEXT_TO_SPEECH_KEY=your_google_api_key
```

## Browser Compatibility

- Chrome 60+ (recommended)
- Firefox 70+
- Safari 14+
- Edge 79+

## Permissions Required

- **Microphone Access**: Required for voice input
- **Audio Playback**: Automatic for text-to-speech

## Security Features

- Secure API key handling
- Client-side audio processing
- No audio data storage on servers
- CORS protection

## Troubleshooting

### Voice Input Not Working

1. Check microphone permissions in browser
2. Ensure microphone is not used by other applications
3. Try refreshing the page

### Text-to-Speech Not Working

1. Check browser audio settings
2. Ensure volume is not muted
3. Check internet connection

### Poor Recognition Quality

1. Speak clearly and at normal pace
2. Minimize background noise
3. Ensure good microphone quality
