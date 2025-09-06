import fetch from 'node-fetch';

// Test the study session recording endpoint
async function testSessionRecording() {
  try {
    console.log('🧪 Testing study session recording...');
    
    const sessionData = {
      userId: 'test-user-123',
      topic: 'JavaScript Basics',
      type: 'complete',
      duration: 300,
      score: 85,
      questionsAnswered: 10,
      correctAnswers: 8
    };
    
    console.log('📤 Sending request with data:', sessionData);
    
    const response = await fetch('http://localhost:3000/api/user/study-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will likely fail auth, but we can see the error
      },
      body: JSON.stringify(sessionData)
    });
    
    const result = await response.text();
    console.log('📥 Response status:', response.status);
    console.log('📥 Response body:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSessionRecording();