const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

/**
 * Extract text content from various file types
 * @param {string} filePath - Path to the file
 * @param {string} fileType - Type of file (text, doc, pdf, image)
 * @returns {Promise<string|Buffer>} - Extracted text content or image buffer
 */
const extractContent = async (filePath, fileType) => {
  try {
    switch (fileType) {
      case 'text':
        return await extractTextFromFile(filePath);
      case 'doc':
        return await extractTextFromDoc(filePath);
      case 'pdf':
        return await extractTextFromPdf(filePath);
      case 'image':
        return await getImageBuffer(filePath);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error(`Error extracting content from ${fileType} file:`, error);
    throw error;
  }
};

/**
 * Extract text from a plain text file
 * @param {string} filePath - Path to the text file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromFile = async (filePath) => {
  return fs.promises.readFile(filePath, 'utf8');
};

/**
 * Extract text from a Word document
 * @param {string} filePath - Path to the Word document
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromDoc = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    throw error;
  }
};

/**
 * Extract text from a PDF document
 * @param {string} filePath - Path to the PDF document
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPdf = async (filePath) => {
  try {
    const dataBuffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

/**
 * Get buffer for an image file
 * @param {string} filePath - Path to the image file
 * @returns {Promise<Buffer>} - Image buffer
 */
const getImageBuffer = async (filePath) => {
  return fs.promises.readFile(filePath);
};

module.exports = {
  extractContent
};
