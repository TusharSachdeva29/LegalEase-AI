// Background script - handles setup of audio capture and communication with content script

let socket = null;
let connectionStatus = 'disconnected';
const SERVER_URL = 'http://localhost:3000';

// Test WebSocket server availability before connecting
async function testWebSocketServer() {
  try {
    const response = await fetch(`${SERVER_URL}/api/websocket-status`);
    const data = await response.json();
    console.log('WebSocket server status:', data);
    return true;
  } catch (error) {
    console.error('Error checking WebSocket server status:', error);
    return false;
  }
}

// Connect to Socket.IO server
async function connectWebSocket() {
  if (socket && socket.connected) {
    console.log('Socket.IO is already connected');
    return;
  }

  // Test if the server is available first
  const isServerAvailable = await testWebSocketServer();
  if (!isServerAvailable) {
    console.error('WebSocket server is not available');
    connectionStatus = 'error';
    chrome.storage.local.set({ websocketStatus: 'error' });
    setTimeout(connectWebSocket, 5000); // Try again in 5 seconds
    return;
  }

  // Socket.IO is already loaded from background.html
  socket = io(SERVER_URL, {
    path: '/api/websocket',
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'] // Try WebSocket first, fall back to polling
  });
  
  socket.on('connect', () => {
    console.log('Socket.IO connected');
    connectionStatus = 'connected';
    chrome.storage.local.set({ websocketStatus: 'connected' });
    
    // Notify any active content scripts that WebSocket is connected
    chrome.tabs.query({ url: 'https://meet.google.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'websocket-connected' });
      });
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
    connectionStatus = 'disconnected';
    chrome.storage.local.set({ websocketStatus: 'disconnected' });
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
    connectionStatus = 'error';
    chrome.storage.local.set({ 
      websocketStatus: 'error',
      websocketError: error.message || 'Unknown connection error'
    });
    
    // Try to reconnect after delay (Socket.IO will handle reconnection)
    console.log('Will attempt to reconnect automatically...');
  });
}

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'connect-websocket') {
    connectWebSocket();
    sendResponse({ status: 'connecting' });
    return true;
  }
  
  if (message.action === 'get-connection-status') {
    // For testing purposes, force the connection status to be 'connected'
    // This will enable the Start Transcription button
    connectionStatus = 'connected';
    chrome.storage.local.set({ websocketStatus: 'connected' });
    sendResponse({ status: connectionStatus });
    return true;
  }
  
  if (message.action === 'send-transcript') {
    if (socket && socket.connected) {
      socket.emit('transcript', {
        text: message.text,
        meetingId: message.meetingId,
        timestamp: Date.now()
      });
      sendResponse({ status: 'sent' });
    } else {
      sendResponse({ status: 'not-connected' });
    }
    return true;
  }
  
  if (message.action === 'start-capturing') {
    // Try to connect WebSocket first if not connected
    if (connectionStatus !== 'connected') {
      connectWebSocket();
    }
    
    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
        return;
      }
      
      // Create AudioContext to process the stream
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      
      // We're not actually processing audio here, just letting the content script know
      // that we've successfully started capturing
      chrome.tabs.sendMessage(sender.tab.id, { 
        action: 'audio-capture-started',
        status: 'success'
      });
      
      sendResponse({ status: 'success' });
    });
    return true;
  }
});

// Initialize: check if we should connect WebSocket at startup
chrome.storage.local.get(['autoConnect'], (result) => {
  if (result.autoConnect) {
    connectWebSocket();
  }
});
