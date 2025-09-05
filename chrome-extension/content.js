// Content script - runs in the context of Google Meet pages

// State variables
let isTranscribing = false;
let audioRecorder = null;
let transcriptBuffer = [];
let lastTranscriptSent = '';
let meetingId = '';
const SERVER_URL = 'http://localhost:3001/api/transcribe';

// Get the meeting ID from the URL
function getMeetingIdFromUrl() {
  const url = window.location.href;
  const match = url.match(/\/([a-zA-Z0-9-]+)(\?|$)/);
  return match && match[1] ? match[1] : 'unknown-meeting';
}

// Initialize Google Cloud Speech-to-Text transcription
function initializeCloudTranscription() {
  if (!window.AudioRecorder) {
    console.error('Audio recorder not loaded');
    showNotification('Audio recorder not loaded', 'error');
    return false;
  }
  
  try {
    // Create a new audio recorder instance
    audioRecorder = new window.AudioRecorder();
    
    // Set up the callback for when audio data is available
    audioRecorder.setOnDataAvailable(audioBlob => {
      console.log('Audio data available, sending for transcription');
      sendAudioForTranscription(audioBlob);
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing cloud transcription:', error);
    showNotification('Error initializing transcription', 'error');
    return false;
  }
}

// Send audio to Google Cloud Speech-to-Text via our API
async function sendAudioForTranscription(audioBlob) {
  try {
    // Log detailed audio information
    console.log('Audio for transcription:', {
      type: audioBlob.type,
      size: audioBlob.size,
      sizeInKB: (audioBlob.size / 1024).toFixed(2) + ' KB',
      timestamp: new Date().toISOString()
    });
    
    // Make sure we have the correct filename extension based on the audio type
    let filename = 'audio.webm';
    if (audioBlob.type.includes('ogg')) {
      filename = 'audio.ogg';
    } else if (audioBlob.type.includes('mp3')) {
      filename = 'audio.mp3';
    }
    
    // Create a FormData object to send the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, filename);
    
    console.log(`Sending audio as ${filename} to ${SERVER_URL}`);
    
    // Send the audio to our server with CORS mode specified
    console.log(`Initiating fetch request to ${SERVER_URL} at ${new Date().toISOString()}`);
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        // Don't set Content-Type header when using FormData, browser will set it with boundary
        'X-Client-Version': '1.0',
        'X-Meeting-ID': meetingId || getMeetingIdFromUrl()
      }
    });
    
    if (!response.ok) {
      let errorData;
      try {
        // Try to read the response body as text first
        const responseText = await response.text();
        console.error('Raw error response:', responseText);
        
        // Then try to parse as JSON if possible
        try {
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          errorData = { error: responseText || 'Unknown error', status: response.status };
        }
      } catch (e) {
        errorData = { error: 'Failed to parse error response', status: response.status };
      }
      
      console.error('Error from transcription service:', errorData);
      
      // Show detailed error information and retry automatically for server errors
      const isServerError = response.status >= 500 && response.status < 600;
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
      
      showNotification(`Transcription failed: ${errorMessage}`, 'error');
      
      if (isServerError) {
        console.log('Server error detected, will continue recording');
        // Continue with recording, don't interrupt the process for server-side errors
      } else {
        console.warn('Client error detected, may need user intervention');
      }
      return;
    }
    
    let data;
    try {
      // First get the raw text to log it
      const responseText = await response.clone().text();
      console.log('Raw transcription response:', responseText);
      
      // Then parse as JSON
      data = await response.json();
      console.log('Transcription response:', { 
        hasText: !!data.text, 
        textLength: data.text ? data.text.length : 0,
        encoding: data.encoding || 'unknown',
        timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : 'unknown'
      });
      
      // Log success for monitoring
      console.log(`✅ Successfully received transcription at ${new Date().toISOString()}`);
    } catch (e) {
      console.error('Failed to parse transcription response:', e);
      showNotification('Failed to parse transcription response', 'error');
      return;
    }
    
    // Get the current transcript regardless of whether we got new text
    const allText = transcriptBuffer.join(' ');
      
    if (data.text && data.text.trim() !== '') {
      // Add the transcribed text to the buffer
      transcriptBuffer.push(data.text);
      
      // Update allText with the new content
      const updatedText = transcriptBuffer.join(' ');
      
      console.log(`Got transcription: "${data.text.substring(0, 50)}${data.text.length > 50 ? '...' : ''}"`);
      
      // Send the transcript to the background script
      sendTranscriptToBackground(updatedText);
      
      // ALSO directly send to our latest-transcript endpoint as a fallback
      sendTranscriptDirectly(updatedText);
      
      lastTranscriptSent = updatedText;
      
      // Update the UI with the latest text
      updateTranscriptionDisplay(updatedText);
    } else {
      console.warn('Received empty transcription from API');
      // If we're getting empty responses, this might be an issue with the audio quality or API
      // We'll add a small notification to let the user know
      if (Math.random() < 0.2) { // Only show occasionally to avoid spamming
        showNotification('No speech detected in audio', 'info');
      }
      
      // Keep only the last 500 words for context if we have any text
      if (allText) {
        const words = allText.split(/\s+/);
        if (words.length > 500) {
          const last500Words = words.slice(-500).join(' ');
          transcriptBuffer = [last500Words];
        }
      }
      
      // Update the UI with existing text
      updateTranscriptionDisplay(allText);
    }
  } catch (error) {
    console.error('Error sending audio for transcription:', error);
    showNotification('Error sending audio for transcription', 'error');
  }
}

// Start transcription
// Start transcription
async function startTranscription() {
  if (isTranscribing) {
    console.log('Already transcribing');
    return true;
  }
  
  try {
    meetingId = getMeetingIdFromUrl();
    console.log('Starting transcription for meeting:', meetingId);
    
    // Check if we have microphone permission
    const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
    console.log('Microphone permission status:', permissionStatus.state);
    
    if (permissionStatus.state === 'denied') {
      const errorMsg = 'Microphone access denied. Please enable microphone access in your browser settings.';
      showNotification(errorMsg, 'error');
      chrome.runtime.sendMessage({
        action: 'transcription-error',
        error: errorMsg,
        requiresPermission: true
      });
      return false;
    }
    
    // Initialize cloud transcription - this will request microphone access
    const initialized = initializeCloudTranscription();
    if (!initialized) {
      return false;
    }
    
    // Start the audio recorder
    const started = await audioRecorder.start();
    if (!started) {
      showNotification('Failed to start audio recording', 'error');
      chrome.runtime.sendMessage({
        action: 'transcription-error',
        error: 'Failed to start audio recording'
      });
      return false;
    }
    
    isTranscribing = true;
    updateTranscriptionStatus('active');
    showNotification('Transcription started', 'success');
    
    // Send status update to popup
    chrome.runtime.sendMessage({
      action: 'transcription-status-update',
      status: 'active'
    });
    
    return true;
  } catch (error) {
    console.error('Error starting transcription:', error);
    showNotification('Error starting transcription: ' + error.message, 'error');
    
    // Send error to popup
    chrome.runtime.sendMessage({
      action: 'transcription-error',
      error: error.message
    });
    
    return false;
  }
}

// Stop transcription
function stopTranscription() {
  if (audioRecorder) {
    audioRecorder.stop();
    audioRecorder = null;
  }
  
  isTranscribing = false;
  updateTranscriptionStatus();
  showNotification('Transcription stopped', 'info');
  
  // Let the background script know we stopped transcribing
  chrome.runtime.sendMessage({ action: 'transcription-stopped' });
}

function sendTranscriptToBackground(text) {
  console.log('Sending transcript to background:', text);
  try {
    chrome.runtime.sendMessage({
      action: 'send-transcript',
      text: text
    }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error sending to background:', chrome.runtime.lastError.message);
        // Try direct WebSocket connection as fallback
        sendDirectToWebSocket(text);
      } else {
        console.log('Background script received transcript:', response);
      }
    });
  } catch (error) {
    console.error('Failed to send transcript to background:', error);
    // Try direct HTTP connection as fallback
    sendTranscriptDirectly(text);
  }
}

// Function to directly send transcript to our Next.js app via HTTP
function sendTranscriptDirectly(text) {
  console.log('Sending transcript directly via HTTP API');
  
  fetch('http://localhost:3001/api/latest-transcript', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      meetingId: getMeetingIdFromUrl() || 'unknown',
      timestamp: Date.now()
    }),
    mode: 'cors'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Transcript sent directly to API:', data);
  })
  .catch(error => {
    console.error('Error sending transcript directly:', error);
  });
}

// Add a fallback method to send directly via WebSocket
let directSocket = null;

function sendDirectToWebSocket(text) {
  console.log('Attempting direct WebSocket connection as fallback');
  
  if (!directSocket) {
    try {
      // Load Socket.IO dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
      script.onload = () => {
        // Create direct socket connection
        directSocket = io('http://localhost:3001', {
          path: '/api/websocket',
          transports: ['websocket', 'polling']
        });
        
        directSocket.on('connect', () => {
          console.log('Direct WebSocket connected');
          // Send the current transcript
          emitTranscript(text);
        });
        
        directSocket.on('connect_error', (error) => {
          console.error('Direct WebSocket connection error:', error);
        });
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Failed to create direct socket:', error);
    }
  } else if (directSocket.connected) {
    emitTranscript(text);
  }
  
  function emitTranscript(text) {
    directSocket.emit('transcript', {
      text: text,
      timestamp: Date.now(),
      meetingId: window.location.pathname.split('/').pop() || 'unknown'
    });
    console.log('Sent transcript directly via WebSocket');
  }
}
// UI Elements
function createTranscriptionUI() {
  const container = document.createElement('div');
  container.id = 'legalease-assistant-container';
  container.style.cssText = `
    position: fixed;
    bottom: 70px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  `;
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'legalease-toggle-button';
  toggleButton.innerHTML = 'LegalEase Assistant';
  toggleButton.style.cssText = `
    background: #10b981;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 10px 20px;
    font-weight: bold;
    cursor: pointer;
    margin-bottom: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  `;
  
  // Status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'legalease-status';
  statusIndicator.style.cssText = `
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ccc;
    display: inline-block;
    margin-right: 10px;
  `;
  toggleButton.prepend(statusIndicator);
  
  // Notification area
  const notification = document.createElement('div');
  notification.id = 'legalease-notification';
  notification.style.cssText = `
    padding: 10px;
    border-radius: 5px;
    background-color: #f8f9fa;
    margin-top: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: none;
    max-width: 300px;
  `;
  
  container.appendChild(toggleButton);
  container.appendChild(notification);
  document.body.appendChild(container);
  
  // Add event listener to toggle button
  toggleButton.addEventListener('click', () => {
    if (isTranscribing) {
      stopTranscription();
    } else {
      startTranscription();
    }
  });
  
  // Create a display for the transcription
  const transcriptDisplay = document.createElement('div');
  transcriptDisplay.id = 'legalease-transcript-display';
  transcriptDisplay.style.cssText = `
    background: white;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 10px;
    width: 300px;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    display: none;
  `;
  container.appendChild(transcriptDisplay);
}

// Update transcription status UI
function updateTranscriptionStatus() {
  const statusIndicator = document.getElementById('legalease-status');
  if (!statusIndicator) return;
  
  if (isTranscribing) {
    statusIndicator.style.backgroundColor = '#10b981'; // Green
  } else {
    statusIndicator.style.backgroundColor = '#ccc'; // Gray
  }
}

// Update transcription display
function updateTranscriptionDisplay(text) {
  const display = document.getElementById('legalease-transcript-display');
  if (display) {
    display.textContent = text;
    display.style.display = 'block';
    
    // Auto scroll to bottom
    display.scrollTop = display.scrollHeight;
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.getElementById('legalease-notification');
  if (!notification) return;
  
  const colors = {
    info: { bg: '#f8f9fa', text: '#212529' },
    success: { bg: '#d1e7dd', text: '#0f5132' },
    warning: { bg: '#fff3cd', text: '#664d03' },
    error: { bg: '#f8d7da', text: '#842029' }
  };
  
  notification.textContent = message;
  notification.style.backgroundColor = colors[type].bg;
  notification.style.color = colors[type].text;
  notification.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000);
}

// Initialize when the page loads
window.addEventListener('load', () => {
  console.log('LegalEase Meet Assistant loaded');
  
  // Wait for the meet interface to be fully loaded
  setTimeout(() => {
    createTranscriptionUI();
    
    // Check connection status
    chrome.runtime.sendMessage({ action: 'get-connection-status' }, (response) => {
      if (response && response.status === 'connected') {
        showNotification('Connected to LegalEase server', 'success');
      } else {
        showNotification('Not connected to LegalEase server. Click the button to start.', 'info');
      }
    });
  }, 3000);
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'websocket-connected') {
    showNotification('Connected to LegalEase server', 'success');
  }
  
  if (message.action === 'audio-capture-started') {
    if (message.status === 'success') {
      showNotification('Meeting audio capture started', 'success');
    } else {
      showNotification('Failed to capture meeting audio', 'error');
    }
  }
  
  // Handle start/stop transcription commands from popup
  if (message.action === 'start-transcription') {
    console.log('Received command to start transcription');
    startTranscription();
    sendResponse({ status: 'success' });
    return true;
  }
  
  if (message.action === 'stop-transcription') {
    console.log('Received command to stop transcription');
    stopTranscription();
    sendResponse({ status: 'success' });
    return true;
  }
  
  if (message.action === 'update-transcript-visibility') {
    updateTranscriptionDisplay(transcriptBuffer.join(' '), message.show);
    sendResponse({ status: 'success' });
    return true;
  }
});
