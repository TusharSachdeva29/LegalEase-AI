// Test script to verify the Speech-to-Text API configuration
// This script helps debug the sample rate issue

const testSpeechToTextConfig = () => {
  console.log("=== Speech-to-Text API Configuration Test ===");
  
  // Simulate the config that would be sent to Google Speech API
  const mockFileType = "audio/webm;codecs=opus";
  const fileSize = 50000; // 50KB sample
  
  // This mirrors the logic in our API route
  let encoding = "WEBM_OPUS";
  let sampleRateHertz;
  
  if (mockFileType.includes("mp3")) {
    encoding = "MP3";
  } else if (mockFileType.includes("wav")) {
    encoding = "LINEAR16";
    sampleRateHertz = 16000;
  } else if (mockFileType.includes("flac")) {
    encoding = "FLAC";
  } else if (mockFileType.includes("webm") || mockFileType.includes("opus")) {
    encoding = "WEBM_OPUS";
    // Don't specify sample rate for WEBM OPUS
  }

  const config = {
    encoding: encoding,
    languageCode: "en-US",
    enableAutomaticPunctuation: true,
    model: "latest_long",
    useEnhanced: true,
    maxAlternatives: 1,
    profanityFilter: false,
  };

  // Only add sampleRateHertz if we have a specific value
  if (sampleRateHertz) {
    config.sampleRateHertz = sampleRateHertz;
  }

  console.log("File Type:", mockFileType);
  console.log("Detected Encoding:", encoding);
  console.log("Sample Rate:", sampleRateHertz || "AUTO-DETECT");
  console.log("Final Config:", JSON.stringify(config, null, 2));
  
  console.log("\n✅ Configuration should now work without sample rate errors!");
  console.log("📝 Key change: No sampleRateHertz specified for WEBM_OPUS");
  console.log("🎯 Google will auto-detect from the WEBM OPUS header (48000 Hz)");
};

// Run the test
testSpeechToTextConfig();

export {};
