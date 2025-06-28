const express = require('express');
const { body, param, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/tests
 * @description Create a new test/assignment
 * @access Private
 */
router.post(
  '/', auth,
  [
    body('tutor_id').isUUID().withMessage('Valid tutor ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('type').isIn(['test', 'assignment']).withMessage('Type must be either test or assignment'),
    body('pass_mark').optional().isInt({ min: 0, max: 100 }).withMessage('Pass mark must be between 0 and 100'),
    body('shuffle_answers').optional().isBoolean().withMessage('Shuffle answers must be a boolean'),
    body('result_text').optional().isString().withMessage('Result text must be a string'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        tutor_id,
        title,
        description,
        type,
        pass_mark,
        shuffle_answers,
        result_text,
      } = req.body;

      // Create test in database
      const { data: newTest, error } = await supabase
        .from('tests')
        .insert([
          {
            tutor_id,
            title,
            description,
            type,
            pass_mark,
            shuffle_answers,
            result_text,
            status: 'active', // Default status
          },
        ])
        .select();

      if (error) {
        console.error('Error creating test:', error);
        return res.status(500).json({ errors: [{ msg: 'Server error creating test' }] });
      }

      return res.status(201).json(newTest[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

/**
 * @route GET /api/tests/:id
 * @description Get a test by ID
 * @access Private
 */
router.get(
  '/:id', auth, param('id').isUUID().withMessage('Valid test ID is required'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Get test from database
    const { data: test, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching test:', error);
      return res.status(500).json({ errors: [{ msg: 'Server error fetching test' }] });
    }

    if (!test) {
      return res.status(404).json({ errors: [{ msg: 'Test not found' }] });
    }

    return res.status(200).json(test);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

/**
 * @route GET /api/tests
 * @description Get all tests for a tutor
 * @access Private
 */
router.get(
  '/', auth, async (req, res) => {
  try {
    const { tutor_id } = req.query;

    if (!tutor_id) {
      return res.status(400).json({ errors: [{ msg: 'Tutor ID is required' }] });
    }

    // Get tests from database
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
      .eq('tutor_id', tutor_id)
      .neq('status', 'deleted') // Don't return deleted tests
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tests:', error);
      return res.status(500).json({ errors: [{ msg: 'Server error fetching tests' }] });
    }

    return res.status(200).json(tests);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

/**
 * @route PATCH /api/tests/:id
 * @description Update a test
 * @access Private
 */
router.patch(
  '/:id', auth,
  [
    param('id').isUUID().withMessage('Valid test ID is required'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('type').optional().isIn(['test', 'assignment']).withMessage('Type must be either test or assignment'),
    body('status').optional().isIn(['active', 'paused', 'deleted']).withMessage('Status must be active, paused, or deleted'),
    body('pass_mark').optional().isInt({ min: 0, max: 100 }).withMessage('Pass mark must be between 0 and 100'),
    body('shuffle_answers').optional().isBoolean().withMessage('Shuffle answers must be a boolean'),
    body('result_text').optional().isString().withMessage('Result text must be a string'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const {
        title,
        description,
        type,
        status,
        pass_mark,
        shuffle_answers,
        result_text,
      } = req.body;

      // Build update object with only provided fields
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type;
      if (status !== undefined) updateData.status = status;
      if (pass_mark !== undefined) updateData.pass_mark = pass_mark;
      if (shuffle_answers !== undefined) updateData.shuffle_answers = shuffle_answers;
      if (result_text !== undefined) updateData.result_text = result_text;

      // Update test in database
      const { data: updatedTest, error } = await supabase
        .from('tests')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating test:', error);
        return res.status(500).json({ errors: [{ msg: 'Server error updating test' }] });
      }

      if (updatedTest.length === 0) {
        return res.status(404).json({ errors: [{ msg: 'Test not found' }] });
      }

      return res.status(200).json(updatedTest[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

/**
 * @route DELETE /api/tests/:id
 * @description Delete a test
 * @access Private
 */
router.delete(
  '/:id', auth, param('id').isUUID().withMessage('Valid test ID is required'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Soft delete by updating the status to 'deleted'
    const { data: deletedTest, error } = await supabase
      .from('tests')
      .update({ status: 'deleted' })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting test:', error);
      return res.status(500).json({ errors: [{ msg: 'Server error deleting test' }] });
    }

    if (deletedTest.length === 0) {
      return res.status(404).json({ errors: [{ msg: 'Test not found' }] });
    }

    return res.status(200).json({ msg: 'Test deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

/**
 * @route PATCH /api/tests/:id/pause
 * @description Pause a test (change status to paused)
 * @access Private
 */
router.patch(
  '/:id/pause', auth, param('id').isUUID().withMessage('Valid test ID is required'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Update test status to 'paused'
    const { data: pausedTest, error } = await supabase
      .from('tests')
      .update({ status: 'paused' })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error pausing test:', error);
      return res.status(500).json({ errors: [{ msg: 'Server error pausing test' }] });
    }

    if (pausedTest.length === 0) {
      return res.status(404).json({ errors: [{ msg: 'Test not found' }] });
    }

    return res.status(200).json(pausedTest[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

/**
 * @route PATCH /api/tests/:id/activate
 * @description Activate a test (change status to active)
 * @access Private
 */
router.patch('/:id/activate', auth, param('id').isUUID().withMessage('Valid test ID is required'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Update test status to 'active'
    const { data: activatedTest, error } = await supabase
      .from('tests')
      .update({ status: 'active' })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error activating test:', error);
      return res.status(500).json({ errors: [{ msg: 'Server error activating test' }] });
    }

    if (activatedTest.length === 0) {
      return res.status(404).json({ errors: [{ msg: 'Test not found' }] });
    }

    return res.status(200).json(activatedTest[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

/**
 * @route GET /api/tests/:id/stats
 * @description Get statistics for a test
 * @access Private
 */
router.get('/:id/stats', auth, param('id').isUUID().withMessage('Valid test ID is required'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Get test details
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();

    if (testError) {
      console.error('Error fetching test:', testError);
      return res.status(500).json({ errors: [{ msg: 'Server error fetching test' }] });
    }

    if (!test) {
      return res.status(404).json({ errors: [{ msg: 'Test not found' }] });
    }

    // Get submissions for the test
    const { data: submissions, error: submissionsError } = await supabase
      .from('learner_submissions')
      .select('*')
      .eq('test_id', id);

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return res.status(500).json({ errors: [{ msg: 'Server error fetching submissions' }] });
    }

    // Calculate statistics
    const totalSubmissions = submissions.length;
    const passedSubmissions = submissions.filter(submission => submission.passed).length;
    const passRate = totalSubmissions > 0 ? (passedSubmissions / totalSubmissions) * 100 : 0;
    
    // Calculate score distribution
    const scores = submissions.map(submission => submission.score || 0);
    const averageScore = totalSubmissions > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / totalSubmissions 
      : 0;
    
    // Create score ranges
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };
    
    scores.forEach(score => {
      if (score <= 20) scoreRanges['0-20']++;
      else if (score <= 40) scoreRanges['21-40']++;
      else if (score <= 60) scoreRanges['41-60']++;
      else if (score <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });

    const stats = {
      test_id: id,
      test_title: test.title,
      total_submissions: totalSubmissions,
      passed_submissions: passedSubmissions,
      pass_rate: passRate,
      average_score: averageScore,
      score_distribution: scoreRanges
    };

    return res.status(200).json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

/**
 * @route GET /api/tests/:id/responses
 * @description Get all learner responses for a test
 * @access Private (should be protected)
 */
router.get('/:id/responses', param('id').isUUID().withMessage('Valid test ID is required'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Get submissions for the test
    const { data: submissions, error } = await supabase
      .from('learner_submissions')
      .select('*')
      .eq('test_id', id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return res.status(500).json({ errors: [{ msg: 'Server error fetching submissions' }] });
    }

    return res.status(200).json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

module.exports = router;
