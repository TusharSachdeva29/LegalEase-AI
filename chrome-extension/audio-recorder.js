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
        // Try first with high quality audio settings
        console.log('Requesting microphone with high quality settings...');
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,     // Disable echo cancellation for clearer speech
            noiseSuppression: false,     // Disable noise suppression to prevent filtering out speech
            autoGainControl: true,       // Keep auto gain to normalize volume
            // channelCount: 1,          // Remove this to let the codec decide
            sampleRate: 16000,           // Match Google Speech API preferred sample rate
            sampleSize: 16               // 16-bit samples for better quality
          } 
        });
        console.log('Using high quality audio settings');
      } catch (micError) {
        console.error('Microphone access error with high quality settings:', micError);
        
        // Try again with more common settings
        try {
          console.log('Trying with standard audio settings...');
          this.stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } 
          });
          console.log('Using standard audio settings');
        } catch (stdError) {
          console.error('Microphone access error with standard settings:', stdError);
          
          // Final fallback to basic audio
          console.log('Trying with basic audio constraints...');
          this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('Using basic audio settings');
        }
      }
      
      console.log('Microphone access granted, creating MediaRecorder...');
      
      // Log actual audio track settings for debugging
      const audioTrack = this.stream.getAudioTracks()[0];
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        console.log('Actual audio track settings:', settings);
        
        // Specifically log the sample rate as it's critical for speech recognition
        console.log(`Audio sample rate: ${settings.sampleRate || 'unknown'} Hz`);
      }
      
      // Create a new MediaRecorder instance with optimized settings for Speech API
      // Try to use codecs that work well with Google Speech-to-Text API
      const mimeTypes = [
        'audio/webm;codecs=opus', // Best compatibility with Speech API
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        ''  // Default fallback
      ];
      
      let selectedMimeType = '';
      for (const type of mimeTypes) {
        if (type && MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          console.log(`Selected MIME type: ${selectedMimeType}`);
          break;
        }
      }
      
      // Configure recorder with appropriate options
      const recorderOptions = selectedMimeType ? { 
        mimeType: selectedMimeType
      } : {};
      
      console.log('Creating MediaRecorder with options:', recorderOptions);
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
          // Use the same MIME type that was selected for recording
          const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
          console.log(`Creating audio blob with type: ${mimeType}`);
          
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          console.log(`Audio blob created, size: ${audioBlob.size} bytes`);
          
          // Call the callback if it exists
          if (typeof this.onDataAvailable === 'function') {
            console.log('Sending audio data to callback handler');
            this.onDataAvailable(audioBlob);
          } else {
            console.warn('No onDataAvailable callback set');
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
