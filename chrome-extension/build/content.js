// Content script - runs in the context of Google Meet pages

// State variables
let isTranscribing = false;
let audioRecorder = null;
let transcriptBuffer = [];
let lastTranscriptSent = '';
let meetingId = '';
const SERVER_URL = 'http://localhost:3000/api/transcribe';

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
    // Create a FormData object to send the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    
    // Send the audio to our server
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from transcription service:', errorData);
      return;
    }
    
    const data = await response.json();
    
    if (data.text && data.text.trim() !== '') {
      // Add the transcribed text to the buffer
      transcriptBuffer.push(data.text);
      
      // Get the total transcript
      const allText = transcriptBuffer.join(' ');
      
      // Send the transcript to the background script
      sendTranscriptToBackground(allText);
      lastTranscriptSent = allText;
      
      // Keep only the last 500 words for context
      const words = allText.split(/\s+/);
      if (words.length > 500) {
        const last500Words = words.slice(-500).join(' ');
        transcriptBuffer = [last500Words];
      }
      
      // Update the UI
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

// Send transcript to background script
function sendTranscriptToBackground(text) {
  chrome.runtime.sendMessage({
    action: 'send-transcript',
    text: text,
    meetingId: meetingId
  }, (response) => {
    if (response && response.status === 'not-connected') {
      showNotification('Not connected to LegalEase. Reconnecting...', 'warning');
      chrome.runtime.sendMessage({ action: 'connect-websocket' });
    }
  });
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
