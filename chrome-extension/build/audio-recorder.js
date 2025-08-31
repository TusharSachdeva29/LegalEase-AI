// Audio recorder and processor utility for Google Cloud Speech-to-Text integration

class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.stream = null;
    this.processingInterval = 5000; // Process audio every 5 seconds
    this.processingTimer = null;
    this.onDataAvailable = null; // Callback for when audio data is available
  }

  /**
   * Start recording audio
   */
  async start() {
    if (this.isRecording) {
      console.log('Already recording');
      return false;
    }

    try {
      console.log('Requesting microphone access...');
      
      // Request access to the microphone with explicit constraints
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000
          } 
        });
      } catch (micError) {
        console.error('Microphone access error:', micError);
        
        // Try again with simpler constraints as fallback
        if (micError.name === 'NotFoundError' || micError.name === 'OverconstrainedError') {
          console.log('Trying with basic audio constraints...');
          this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw micError; // Re-throw if it's a permission error or other issue
        }
      }
      
      console.log('Microphone access granted, creating MediaRecorder...');
      
      // Create a new MediaRecorder instance with fallback for unsupported mime types
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        console.log('audio/webm not supported, trying audio/ogg');
        mimeType = 'audio/ogg';
        if (!MediaRecorder.isTypeSupported('audio/ogg')) {
          console.log('audio/ogg not supported, using default type');
          mimeType = '';
        }
      }
      
      const recorderOptions = mimeType ? { mimeType, audioBitsPerSecond: 16000 } : {};
      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);
      
      // Clear the audio chunks
      this.audioChunks = [];
      
      // Event listener for dataavailable
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      // Event listener for when recording stops
      this.mediaRecorder.onstop = () => {
        // Only process the audio if we're still recording
        if (this.isRecording && this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          
          // Call the callback if it exists
          if (typeof this.onDataAvailable === 'function') {
            this.onDataAvailable(audioBlob);
          }
          
          // Clear the audio chunks
          this.audioChunks = [];
          
          // Restart recording if still actively recording
          if (this.isRecording) {
            this.mediaRecorder.start();
          }
        }
      };
      
      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;
      
      // Set up a timer to periodically stop and restart recording to process chunks
      this.processingTimer = setInterval(() => {
        if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop(); // This will trigger onstop and restart
        }
      }, this.processingInterval);
      
      return true;
    } catch (error) {
      console.error('Error starting audio recorder:', error);
      return false;
    }
  }
  
  /**
   * Stop recording audio
   */
  stop() {
    if (!this.isRecording) {
      return;
    }
    
    // Clear the processing timer
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }
    
    // Stop the media recorder
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    // Stop all audio tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    
    console.log('Audio recorder stopped');
  }
  
  /**
   * Set the callback for when audio data is available
   */
  setOnDataAvailable(callback) {
    this.onDataAvailable = callback;
  }
}

// Export the AudioRecorder class
window.AudioRecorder = AudioRecorder;
