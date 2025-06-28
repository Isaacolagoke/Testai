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

// First, list available models to see what we can use
async function listModels() {
  try {
    console.log('Listing available Gemini models...');
    
    // Use the native fetch API as a fallback to check available models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    const data = await response.json();
    
    console.log('Available models:');
    if (data.models) {
      data.models.forEach(model => {
        console.log(`- ${model.name} (${model.displayName})`);
      });
    } else {
      console.log('No models found or error:', data);
    }
    
    return data.models || [];
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
}

// Test with the first available model or a specific one
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
    
  } catch (error) {
    console.error(`Error testing Gemini API with model ${modelName}:`, error);
  }
}

// Run tests
async function runTests() {
  // First list all available models
  const models = await listModels();
  
  // Try to use gemini-1.5-pro if available, otherwise try the first available model
  if (models.length > 0) {
    // Check for preferred models
    const preferredModels = ['gemini-1.5-pro', 'gemini-pro', 'gemini-pro-latest'];
    let modelToUse = null;
    
    for (const preferred of preferredModels) {
      const foundModel = models.find(m => m.name.includes(preferred));
      if (foundModel) {
        modelToUse = foundModel.name.split('/').pop();
        break;
      }
    }
    
    // If no preferred model found, use the first one
    if (!modelToUse) {
      modelToUse = models[0].name.split('/').pop();
    }
    
    await testGeminiDirectly(modelToUse);
  } else {
    // If model listing fails, try some common model names
    console.log('Trying common model names...');
    await testGeminiDirectly('gemini-1.5-pro');
  }
}

runTests();
