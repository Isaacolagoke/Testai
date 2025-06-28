require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { extractContent } = require('./backend/src/utils/content-extractor');
const { generateQuestionsFromText, generateQuestionsFromImage } = require('./backend/src/utils/gemini');

// Create test directory if it doesn't exist
const testDir = path.join(__dirname, 'test-files');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Create a sample text file
const createTextFile = () => {
  const textContent = `
    The solar system consists of the Sun and everything that orbits around it,
    including planets, dwarf planets, moons, asteroids, comets, and meteoroids.
    The Sun is the center of our solar system and contains 99.8% of the system's mass.
    The eight planets in order from the Sun are: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.
  `;
  
  const filePath = path.join(testDir, 'sample.txt');
  fs.writeFileSync(filePath, textContent);
  return filePath;
};

// Generate a simple image with text
const createImageFile = () => {
  // Since we can't generate an actual image here, we'll just check if 'sample.jpg' exists
  // and provide instructions to add one manually if it doesn't
  const filePath = path.join(testDir, 'sample.jpg');
  
  if (!fs.existsSync(filePath)) {
    console.log(`Please add a sample image file at: ${filePath}`);
    console.log('You can use any simple image with visible text for testing');
    return null;
  }
  
  return filePath;
};

// Test text file processing
const testTextFile = async () => {
  try {
    console.log('\n🔍 TESTING TEXT FILE PROCESSING');
    console.log('-------------------------------');
    
    const filePath = createTextFile();
    console.log(`Created test file: ${filePath}`);
    
    // Extract content
    console.log('Extracting content...');
    const content = await extractContent(filePath, 'text');
    console.log(`Extracted ${content.length} characters of text`);
    
    // Generate questions
    console.log('Generating questions with Gemini...');
    const questions = await generateQuestionsFromText(content, {
      num_questions: 2,
      question_type: 'mcq',
      difficulty: 'easy'
    });
    
    console.log('\n✅ TEXT FILE TEST SUCCESS');
    console.log('Generated questions:');
    console.log(JSON.stringify(questions, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ TEXT FILE TEST FAILED:', error);
    return false;
  }
};

// Test image file processing
const testImageFile = async () => {
  try {
    console.log('\n🔍 TESTING IMAGE FILE PROCESSING');
    console.log('---------------------------------');
    
    const filePath = createImageFile();
    if (!filePath) return false;
    
    console.log(`Using image file: ${filePath}`);
    
    // Read image as buffer
    console.log('Reading image file...');
    const imageBuffer = await fs.promises.readFile(filePath);
    
    // Generate questions
    console.log('Generating questions with Gemini Vision...');
    const questions = await generateQuestionsFromImage(imageBuffer, {
      num_questions: 2,
      question_type: 'mcq',
      difficulty: 'easy'
    });
    
    console.log('\n✅ IMAGE FILE TEST SUCCESS');
    console.log('Generated questions:');
    console.log(JSON.stringify(questions, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ IMAGE FILE TEST FAILED:', error);
    return false;
  }
};

// For PDF and DOC tests, we'd need sample files and libraries installed
const testDocumentSupport = () => {
  console.log('\n🔍 CHECKING DOCUMENT PROCESSING SUPPORT');
  console.log('--------------------------------------');
  
  try {
    // Check if we have necessary libraries
    const hasMammoth = fs.existsSync(path.join(__dirname, 'node_modules/mammoth'));
    const hasPdfParse = fs.existsSync(path.join(__dirname, 'node_modules/pdf-parse'));
    
    console.log(`DOC file support (mammoth): ${hasMammoth ? '✅ Available' : '❌ Missing'}`);
    console.log(`PDF file support (pdf-parse): ${hasPdfParse ? '✅ Available' : '❌ Missing'}`);
    
    if (!hasMammoth || !hasPdfParse) {
      console.log('\nTo install missing dependencies:');
      console.log('npm install --save mammoth pdf-parse');
    } else {
      console.log('\nAll document processing libraries are installed.');
      console.log('To test with actual DOC/PDF files:');
      console.log('1. Place sample files in the test-files directory');
      console.log('2. Update this script to process those specific files');
    }
    
    return hasMammoth && hasPdfParse;
  } catch (error) {
    console.error('Error checking document support:', error);
    return false;
  }
};

// Run all tests
async function runTests() {
  console.log('🚀 STARTING DOCUMENT PROCESSING TESTS');
  console.log('====================================');
  
  // Check document support first
  testDocumentSupport();
  
  // Run text file test
  const textSuccess = await testTextFile();
  
  // Only run image test if text was successful
  if (textSuccess) {
    await testImageFile();
  }
  
  console.log('\n====================================');
  console.log('🏁 DOCUMENT PROCESSING TESTS COMPLETE');
}

// Run the tests
runTests();
