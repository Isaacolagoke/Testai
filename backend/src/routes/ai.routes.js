const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const supabase = require('../config/supabase');
const { generateQuestionsFromText, generateQuestionsFromImage } = require('../utils/gemini');
const { extractContent } = require('../utils/content-extractor');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/ai/analyze
 * @description Analyze content and generate questions using Google Gemini
 * @access Private
 */
router.post(
  '/analyze', auth,
  [
    body('upload_id').isUUID().withMessage('Valid upload ID is required'),
    body('test_id').isUUID().withMessage('Valid test ID is required'),
    body('num_questions').optional().isInt({ min: 1, max: 30 }).withMessage('Number of questions must be between 1 and 30'),
    body('question_type').optional().isIn(['mcq', 'true_false', 'short', 'select', 'fill_gap']).withMessage('Invalid question type'),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { upload_id, test_id, num_questions = 5, question_type = 'mcq', difficulty = 'medium' } = req.body;

      // First, get the upload details from the database
      const { data: upload, error: uploadError } = await supabase
        .from('uploads')
        .select('*')
        .eq('id', upload_id)
        .single();

      if (uploadError || !upload) {
        console.error('Error fetching upload:', uploadError);
        return res.status(404).json({ errors: [{ msg: 'Upload not found' }] });
      }

      // Check if the upload belongs to the specified test
      if (upload.test_id !== test_id) {
        return res.status(400).json({ errors: [{ msg: 'Upload does not belong to the specified test' }] });
      }

      // Get questions option
      const options = {
        num_questions,
        question_type,
        difficulty
      };

      // If the analysis result already exists, return it
      if (upload.gemini_analysis_result) {
        const questions = upload.gemini_analysis_result;
        return res.status(200).json({
          message: 'Questions already generated for this upload',
          questions,
          upload_id,
          test_id
        });
      }

      // Process based on file type
      const fileUrl = upload.file_url;
      const fileType = upload.file_type;

      // For local development with public URL from Supabase, we need to fetch the file
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from URL: ${fileUrl}`);
      }

      // Create a temporary file path
      const tmpDir = path.join(__dirname, '../../tmp');
      const tmpFile = path.join(tmpDir, `${upload_id}.tmp`);

      // Ensure tmp directory exists
      const fs = require('fs');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Save the file
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(tmpFile, buffer);

      // Extract content from the file
      const content = await extractContent(tmpFile, fileType);

      // Generate questions based on file type
      let questions;
      if (fileType === 'image') {
        questions = await generateQuestionsFromImage(content, options);
      } else {
        questions = await generateQuestionsFromText(content, options);
      }

      // Clean up the temporary file
      fs.unlinkSync(tmpFile);

      // Save generated questions to database
      const { error: updateError } = await supabase
        .from('uploads')
        .update({ gemini_analysis_result: questions })
        .eq('id', upload_id);

      if (updateError) {
        console.error('Error saving analysis results:', updateError);
        return res.status(500).json({ errors: [{ msg: 'Error saving analysis results' }] });
      }

      // Save each question to the questions table
      for (const question of questions) {
        const { error: questionError } = await supabase
          .from('questions')
          .insert([
            {
              test_id,
              type: question.type,
              content: question.content,
              options: question.options || null,
              answer: typeof question.answer === 'object' ? JSON.stringify(question.answer) : question.answer,
              difficulty: question.difficulty
            }
          ]);

        if (questionError) {
          console.error('Error saving question:', questionError);
          // Continue with other questions even if one fails
        }
      }

      return res.status(200).json({
        message: 'Content analyzed and questions generated successfully',
        questions,
        upload_id,
        test_id
      });
    } catch (err) {
      console.error('AI analysis error:', err);
      res.status(500).json({ errors: [{ msg: 'Error analyzing content' }] });
    }
  }
);

/**
 * @route POST /api/ai/generate
 * @description Generate questions directly from provided text
 * @access Private
 */
router.post(
  '/generate', auth,
  [
    body('test_id').isUUID().withMessage('Valid test ID is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('num_questions').optional().isInt({ min: 1, max: 30 }).withMessage('Number of questions must be between 1 and 30'),
    body('question_type').optional().isIn(['mcq', 'true_false', 'short', 'select', 'fill_gap']).withMessage('Invalid question type'),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { test_id, content, num_questions = 5, question_type = 'mcq', difficulty = 'medium' } = req.body;

      // Check if the test exists
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', test_id)
        .single();

      if (testError || !test) {
        console.error('Error fetching test:', testError);
        return res.status(404).json({ errors: [{ msg: 'Test not found' }] });
      }

      // Generate questions from the provided content
      const options = {
        num_questions,
        question_type,
        difficulty
      };

      const questions = await generateQuestionsFromText(content, options);

      // Save each question to the questions table
      for (const question of questions) {
        const { error: questionError } = await supabase
          .from('questions')
          .insert([
            {
              test_id,
              type: question.type,
              content: question.content,
              options: question.options || null,
              answer: typeof question.answer === 'object' ? JSON.stringify(question.answer) : question.answer,
              difficulty: question.difficulty
            }
          ]);

        if (questionError) {
          console.error('Error saving question:', questionError);
          // Continue with other questions even if one fails
        }
      }

      return res.status(200).json({
        message: 'Questions generated successfully',
        questions,
        test_id
      });
    } catch (err) {
      console.error('AI generation error:', err);
      res.status(500).json({ errors: [{ msg: 'Error generating questions' }] });
    }
  }
);

module.exports = router;
