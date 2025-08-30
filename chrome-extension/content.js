// Content script - runs in the context of Google Meet pages

// State variables
let isTranscribing = false;
let recognition = null;
let transcriptBuffer = [];
let lastTranscriptSent = '';
let meetingId = '';
const WORD_LIMIT_BEFORE_SENDING = 10; // Send after collecting 10 new words

// Get the meeting ID from the URL
function getMeetingIdFromUrl() {
  const url = window.location.href;
  const match = url.match(/\/([a-zA-Z0-9-]+)(\?|$)/);
  return match && match[1] ? match[1] : 'unknown-meeting';
}

// Initialize Web Speech API for transcription
function initializeSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    console.error('Speech recognition not supported in this browser');
    showNotification('Speech recognition not supported in this browser', 'error');
    return false;
  }
  
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  recognition.onstart = () => {
    console.log('Speech recognition started');
    isTranscribing = true;
    updateTranscriptionStatus();
  };
  
  recognition.onend = () => {
    console.log('Speech recognition ended');
    isTranscribing = false;
    updateTranscriptionStatus();
    
    // Restart if we're supposed to be transcribing
    if (isTranscribing) {
      setTimeout(() => {
        recognition.start();
      }, 1000);
    }
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    showNotification(`Recognition error: ${event.error}`, 'error');
  };
  
  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    
    if (finalTranscript) {
      transcriptBuffer.push(finalTranscript);
      
      // Get the total words in buffer
      const allText = transcriptBuffer.join(' ');
      const words = allText.split(/\s+/);
      
      // If we've collected enough new words, send to background
      if (words.length >= WORD_LIMIT_BEFORE_SENDING && allText !== lastTranscriptSent) {
        sendTranscriptToBackground(allText);
        lastTranscriptSent = allText;
        
        // Keep the last 200 words in the buffer for context
        if (words.length > 200) {
          const last200Words = words.slice(-200).join(' ');
          transcriptBuffer = [last200Words];
        }
      }
      
      updateTranscriptionDisplay(allText);
    }
  };
  
  return true;
}

// Start transcription
function startTranscription() {
  if (!recognition && !initializeSpeechRecognition()) {
    showNotification('Speech recognition initialization failed', 'error');
    return false;
  }
  
  try {
    meetingId = getMeetingIdFromUrl();
    console.log('Starting transcription for meeting:', meetingId);
    recognition.start();
    isTranscribing = true;
    showNotification('Transcription started', 'success');
    
    // Request audio capture from the background script
    chrome.runtime.sendMessage({ action: 'start-capturing' }, (response) => {
      if (!response || response.status !== 'success') {
        showNotification('Failed to capture meeting audio', 'error');
      }
    });
  } catch (error) {
    console.error('Error starting transcription:', error);
    showNotification('Error starting transcription', 'error');
  }
}

// Stop transcription
function stopTranscription() {
  if (recognition) {
    recognition.stop();
  }
  isTranscribing = false;
  updateTranscriptionStatus();
  showNotification('Transcription stopped', 'info');
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
