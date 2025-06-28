const fetch = require('node-fetch');

async function testGeminiApi() {
  try {
    console.log('Testing direct AI content generation...');
    
    // Sample test content to generate questions from
    const testContent = `
      The Earth's atmosphere is composed primarily of nitrogen (78%), oxygen (21%), 
      and trace amounts of other gases. It protects life on Earth by creating pressure 
      allowing for liquid water to exist on the Earth's surface, absorbing ultraviolet 
      solar radiation, warming the surface through heat retention, and reducing 
      temperature extremes between day and night.
    `;
    
    // Send the request to the AI generate endpoint
    const response = await fetch('http://localhost:5000/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test_id: '00000000-0000-0000-0000-000000000000', // This is a placeholder, will error on DB but test API
        content: testContent,
        num_questions: 2, // Small number for quick testing
        question_type: 'mcq',
        difficulty: 'easy'
      }),
    });
    
    // Get the response data
    const data = await response.json();
    
    if (response.ok) {
      console.log('Success! AI generated questions:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('Failed to generate questions. Error response:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error testing Gemini API:', error);
  }
}

// Run the test
testGeminiApi();
