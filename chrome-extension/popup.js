// Popup script - handles UI interaction for the extension popup

document.addEventListener('DOMContentLoaded', () => {
  const connectButton = document.getElementById('connect-button');
  const toggleTranscriptionButton = document.getElementById('toggle-transcription');
  const connectionStatusElement = document.getElementById('connection-status');
  const transcriptionStatusElement = document.getElementById('transcription-status');
  const autoConnectCheckbox = document.getElementById('auto-connect');
  const showTranscriptCheckbox = document.getElementById('show-transcript');
  const errorDetailsElement = document.getElementById('error-details');
  
  let isTranscribing = false;
  
  // Always enable the transcription button for testing
  toggleTranscriptionButton.disabled = false;
  
  // Load saved settings
  chrome.storage.local.get(['autoConnect', 'showTranscript', 'websocketStatus', 'transcriptionActive', 'websocketError'], (result) => {
    if (result.autoConnect) {
      autoConnectCheckbox.checked = true;
    }
    
    if (result.showTranscript) {
      showTranscriptCheckbox.checked = true;
    }
    
    // Force connection status to connected for testing
    updateConnectionStatus('connected');
    
    if (result.transcriptionActive) {
      isTranscribing = true;
      updateTranscriptionStatus('active');
      toggleTranscriptionButton.textContent = 'Stop Transcription';
    }

    // Show error details if any
    if (result.websocketError) {
      errorDetailsElement.textContent = `Error: ${result.websocketError}`;
      errorDetailsElement.style.display = 'block';
    } else {
      errorDetailsElement.style.display = 'none';
    }
  });
  
  // Show troubleshooting tips
  document.getElementById('show-troubleshooting').addEventListener('click', () => {
    const tips = [
      "1. Make sure your Next.js server is running (npm run dev)",
      "2. Check that the WebSocket server is configured at /api/websocket",
      "3. If using localhost, make sure you're using http://localhost:3000",
      "4. Try refreshing the Google Meet page",
      "5. Check browser console for error details"
    ].join('\n\n');
    
    alert(tips);
  });
  
  // Check current connection status
  chrome.runtime.sendMessage({ action: 'get-connection-status' }, (response) => {
    if (response) {
      console.log('Current connection status:', response.status);
      updateConnectionStatus(response.status);
    }
  });
  
  // Connect to server
  connectButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'connect-websocket' }, (response) => {
      if (response) {
        connectionStatusElement.textContent = 'Connecting...';
        connectionStatusElement.className = 'status-indicator';
      }
    });
  });
  
  // Toggle transcription
  toggleTranscriptionButton.addEventListener('click', () => {
    // We need to send a message to the active Google Meet tab
    chrome.tabs.query({ url: 'https://meet.google.com/*', active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        // Try any Google Meet tab if active tab is not found
        chrome.tabs.query({ url: 'https://meet.google.com/*' }, (allTabs) => {
          if (allTabs.length > 0) {
            handleTabCommand(allTabs[0]);
          } else {
            alert('Please open Google Meet in a tab and try again.');
          }
        });
        return;
      }
      
      handleTabCommand(tabs[0]);
    });
  });
  
  function handleTabCommand(tab) {
    const action = isTranscribing ? 'stop-transcription' : 'start-transcription';
    
    chrome.tabs.sendMessage(tab.id, { action }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        alert('Could not communicate with Google Meet tab. Please refresh the page and try again.');
        return;
      }
      
      if (response && response.status === 'success') {
        isTranscribing = !isTranscribing;
        updateTranscriptionStatus(isTranscribing ? 'active' : 'inactive');
        toggleTranscriptionButton.textContent = isTranscribing ? 'Stop Transcription' : 'Start Transcription';
        chrome.storage.local.set({ transcriptionActive: isTranscribing });
      }
    });
  }
  
  // Save settings
  autoConnectCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ autoConnect: autoConnectCheckbox.checked });
  });
  
  showTranscriptCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ showTranscript: showTranscriptCheckbox.checked });
    
    // Send message to content script to update transcript visibility
    chrome.tabs.query({ url: 'https://meet.google.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'update-transcript-visibility',
          show: showTranscriptCheckbox.checked
        });
      });
    });
  });
  
  // Helper function to update connection status UI
  function updateConnectionStatus(status) {
    switch(status) {
      case 'connected':
        connectionStatusElement.textContent = 'Connected';
        connectionStatusElement.className = 'status-indicator connected';
        toggleTranscriptionButton.disabled = false;
        break;
        
      case 'disconnected':
        connectionStatusElement.textContent = 'Disconnected';
        connectionStatusElement.className = 'status-indicator disconnected';
        // Don't disable the button for testing
        toggleTranscriptionButton.disabled = false;
        break;
        
      case 'error':
        connectionStatusElement.textContent = 'Error';
        connectionStatusElement.className = 'status-indicator disconnected';
        // Don't disable the button for testing
        toggleTranscriptionButton.disabled = false;
        break;
        
      default:
        connectionStatusElement.textContent = 'Unknown';
        connectionStatusElement.className = 'status-indicator';
        // Don't disable the button for testing
        toggleTranscriptionButton.disabled = false;
    }
  }
  
  // Helper function to update transcription status UI
  function updateTranscriptionStatus(status) {
    switch(status) {
      case 'active':
        transcriptionStatusElement.textContent = 'Active';
        transcriptionStatusElement.className = 'status-indicator active';
        break;
        
      case 'inactive':
        transcriptionStatusElement.textContent = 'Inactive';
        transcriptionStatusElement.className = 'status-indicator inactive';
        break;
        
      default:
        transcriptionStatusElement.textContent = 'Unknown';
        transcriptionStatusElement.className = 'status-indicator';
    }
  }
  
  // Listen for status updates
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.websocketStatus) {
      updateConnectionStatus(changes.websocketStatus.newValue);
    }
    
    if (changes.transcriptionActive) {
      isTranscribing = changes.transcriptionActive.newValue;
      updateTranscriptionStatus(isTranscribing ? 'active' : 'inactive');
      toggleTranscriptionButton.textContent = isTranscribing ? 'Stop Transcription' : 'Start Transcription';
    }
  });
});
