const express = require('express');
const { body, param, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/questions
 * @description Add questions to a test
 * @access Private
 */
router.post(
  '/', auth,
  [
    body('test_id').isUUID().withMessage('Valid test ID is required'),
    body('questions').isArray().withMessage('Questions must be an array'),
    body('questions.*.type').isIn(['mcq', 'true_false', 'short', 'select', 'fill_gap']).withMessage('Valid question type is required'),
    body('questions.*.content').notEmpty().withMessage('Question content is required'),
    body('questions.*.answer').notEmpty().withMessage('Answer is required'),
    body('questions.*.difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { test_id, questions } = req.body;

      // Check if test exists
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('id')
        .eq('id', test_id)
        .single();

      if (testError || !test) {
        return res.status(404).json({
          errors: [{ msg: 'Test not found' }]
        });
      }

      // Prepare questions for insertion
      const questionsToInsert = questions.map(q => ({
        test_id,
        type: q.type,
        content: q.content,
        options: q.options || null,
        answer: typeof q.answer === 'object' ? JSON.stringify(q.answer) : q.answer,
        difficulty: q.difficulty
      }));

      // Insert questions
      const { data: newQuestions, error } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select();

      if (error) {
        console.error('Error adding questions:', error);
        return res.status(500).json({
          errors: [{ msg: 'Error adding questions to test' }]
        });
      }

      res.status(201).json({
        message: 'Questions added successfully',
        questions: newQuestions
      });
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

/**
 * @route GET /api/questions/:test_id
 * @description Get all questions for a test
 * @access Private (should be protected)
 */
router.get(
  '/:test_id',
  [
    param('test_id').isUUID().withMessage('Valid test ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { test_id } = req.params;

      // Get questions for the test
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', test_id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting questions:', error);
        return res.status(500).json({
          errors: [{ msg: 'Error retrieving questions' }]
        });
      }

      res.status(200).json(questions);
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

/**
 * @route DELETE /api/questions/:id
 * @description Delete a question
 * @access Private (should be protected)
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Valid question ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;

      // Delete the question
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting question:', error);
        return res.status(500).json({
          errors: [{ msg: 'Error deleting question' }]
        });
      }

      res.status(200).json({ message: 'Question deleted successfully' });
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

module.exports = router;
