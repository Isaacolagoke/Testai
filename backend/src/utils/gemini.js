const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Missing GEMINI_API_KEY. Please check your .env file.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini model
const getGeminiProModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// Get the Gemini Vision model (for images)
const getGeminiProVisionModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-1.0-pro-vision-latest' });
};

/**
 * Generate questions based on text content
 * @param {string} content - Text content to generate questions from
 * @param {Object} options - Options for question generation
 * @param {number} options.num_questions - Number of questions to generate
 * @param {string} options.question_type - Type of questions (mcq, true_false, short, select, fill_gap)
 * @param {string} options.difficulty - Difficulty level (easy, medium, hard)
 * @returns {Promise<Array>} - Array of generated questions
 */
const generateQuestionsFromText = async (content, options) => {
  try {
    const model = getGeminiProModel();
    
    // For compatibility with newer Gemini models, combine system and user prompts
    const systemPrompt = getSystemPrompt(options);
    const combinedPrompt = `${systemPrompt}

Content to analyze: ${content}`;
    
    const result = await model.generateContent({
      contents: [{ parts: [{ text: combinedPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const response = result.response;
    const text = response.text();
    
    // Parse the JSON result from the text response
    // The prompt instructs the AI to return JSON, so we need to extract it
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse questions from AI response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    return questions.questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

/**
 * Generate questions based on image content
 * @param {Buffer} imageBuffer - Image buffer to generate questions from
 * @param {Object} options - Options for question generation
 * @returns {Promise<Array>} - Array of generated questions
 */
const generateQuestionsFromImage = async (imageBuffer, options) => {
  try {
    const model = getGeminiProVisionModel();
    
    // For compatibility with newer Gemini models, combine system prompt with user instruction
    const systemPrompt = getSystemPrompt(options);
    
    // Convert image buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    const result = await model.generateContent({
      contents: [
        { 
          parts: [
            { text: `${systemPrompt}\n\nGenerate questions based on this image content:` },
            { inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }}
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const response = result.response;
    const text = response.text();
    
    // Parse the JSON result from the text response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse questions from AI response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    return questions.questions;
  } catch (error) {
    console.error('Error generating questions from image:', error);
    throw error;
  }
};

/**
 * Get the system prompt for question generation
 * @param {Object} options - Options for question generation
 * @returns {string} - System prompt
 */
const getSystemPrompt = (options) => {
  const { num_questions = 5, question_type = 'mcq', difficulty = 'medium' } = options;
  
  let instructions = `
  You are an expert educational content creator. 
  Analyze the provided content and generate ${num_questions} high-quality ${difficulty} difficulty ${getQuestionTypeDescription(question_type)} questions.
  
  Return your response as a JSON object with the following format:
  {
    "questions": [
      {
        "type": "${question_type}",
        "content": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "The correct answer or index", 
        "difficulty": "${difficulty}"
      }
    ]
  }
  `;
  
  // Add specific instructions based on question type
  switch (question_type) {
    case 'mcq':
      instructions += `
      For multiple choice questions:
      - Provide exactly 4 options (A, B, C, D)
      - Make sure only one option is correct
      - For the answer, provide the index (0, 1, 2, or 3)
      `;
      break;
    case 'true_false':
      instructions += `
      For true/false questions:
      - No options are needed
      - For the answer, provide "true" or "false"
      `;
      break;
    case 'short':
      instructions += `
      For short answer questions:
      - No options are needed
      - For the answer, provide a concise model answer 
      `;
      break;
    case 'select':
      instructions += `
      For select questions (multiple correct answers):
      - Provide 4-6 options
      - Multiple options can be correct
      - For the answer, provide an array of indices of all correct options
      `;
      break;
    case 'fill_gap':
      instructions += `
      For fill-in-the-gap questions:
      - In the question content, use [...] to denote where the gap should be
      - For the answer, provide the text that should fill the gap
      `;
      break;
  }

  instructions += `
  IMPORTANT: Make sure your questions:
  1. Are clear, unambiguous, and directly related to the content
  2. Cover different aspects of the content (not just the same topic)
  3. Are appropriately challenging for ${difficulty} difficulty
  4. Have correct answers that are factual and accurate
  5. For MCQs, have plausible but clearly incorrect distractors
  
  Return ONLY THE JSON OBJECT with no additional text before or after.
  `;

  return instructions;
};

/**
 * Get a description of the question type for the prompt
 * @param {string} type - Question type
 * @returns {string} - Description
 */
const getQuestionTypeDescription = (type) => {
  switch (type) {
    case 'mcq': return 'multiple-choice';
    case 'true_false': return 'true/false';
    case 'short': return 'short answer';
    case 'select': return 'multiple-select';
    case 'fill_gap': return 'fill-in-the-gap';
    default: return type;
  }
};

module.exports = {
  generateQuestionsFromText,
  generateQuestionsFromImage
};
