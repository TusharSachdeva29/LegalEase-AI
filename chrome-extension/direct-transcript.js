// Function to directly send transcript to our Next.js app via HTTP
function sendTranscriptDirectly(text) {
  console.log('Sending transcript directly via HTTP API');
  
  fetch('http://localhost:3000/api/latest-transcript', {
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
