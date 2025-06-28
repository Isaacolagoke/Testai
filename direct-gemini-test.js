require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if we have an API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY. Please check your .env file.');
  process.exit(1);
}

console.log('GEMINI_API_KEY found in .env file.');

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini Pro model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

async function testGeminiDirectly() {
  try {
    console.log('Testing Gemini API directly...');
    
    const prompt = `
      Create 2 multiple choice questions about the following content:
      
      The Earth's atmosphere is composed primarily of nitrogen (78%), oxygen (21%), 
      and trace amounts of other gases. It protects life on Earth by creating pressure 
      allowing for liquid water to exist on the Earth's surface, absorbing ultraviolet 
      solar radiation, warming the surface through heat retention, and reducing 
      temperature extremes between day and night.
      
      Format your response as JSON with this structure:
      {
        "questions": [
          {
            "type": "mcq",
            "content": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": 0,
            "difficulty": "easy"
          }
        ]
      }
    `;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const text = response.text();
    
    console.log('Success! Gemini API responded with:');
    console.log(text);
    
    // Try to parse JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        console.log('\nParsed JSON successfully:');
        console.log(JSON.stringify(questions, null, 2));
      }
    } catch (parseError) {
      console.warn('Could not parse JSON from response:', parseError);
    }
    
  } catch (error) {
    console.error('Error testing Gemini API directly:', error);
  }
}

// Run the test
testGeminiDirectly();
