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

// Test with a specific flash model that might have higher quota limits
async function testGeminiDirectly(modelName) {
  try {
    console.log(`Testing Gemini API with model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = `
      Create 2 multiple choice questions about the following content:
      
      The Earth's atmosphere is composed primarily of nitrogen (78%), oxygen (21%), 
      and trace amounts of other gases. It protects life on Earth by creating pressure 
      allowing for liquid water to exist on the Earth's surface, absorbing ultraviolet 
      solar radiation, warming the surface through heat retention, and reducing 
      temperature extremes between day and night.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Success! Gemini API responded with:');
    console.log(text);
    
    return true;
  } catch (error) {
    console.error(`Error testing Gemini API with model ${modelName}:`, error);
    return false;
  }
}

// Try multiple models in sequence until one works
async function tryMultipleModels() {
  // Try different models in order of preference, starting with flash models
  // which typically have higher quota limits
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash-lite'
  ];
  
  for (const model of modelsToTry) {
    console.log(`\nAttempting to use model: ${model}`);
    const success = await testGeminiDirectly(model);
    if (success) {
      console.log(`\n✅ Successfully used model: ${model}`);
      // If this model worked, update the recommendation
      console.log(`\n💡 RECOMMENDATION: Update your gemini.js file to use "${model}" instead of "gemini-pro"`);
      break;
    }
    // Wait a moment before trying the next model to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Run tests
tryMultipleModels();
