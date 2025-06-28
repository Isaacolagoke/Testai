const express = require('express');
const { body, param, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const router = express.Router();

/**
 * @route GET /api/learner/test/:accessCode
 * @description Access a test using its access code (for learners)
 * @access Public
 */
router.get(
  '/test/:accessCode',
  [
    param('accessCode').isString().isLength({ min: 6, max: 6 }).withMessage('Valid access code is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { accessCode } = req.params;

      // Get the test by access code
      const { data: test, error } = await supabase
        .from('tests')
        .select(`
          id, 
          title, 
          description, 
          type,
          status,
          pass_mark,
          shuffle_answers,
          result_text,
          questions (
            id,
            type,
            content,
            options,
            difficulty
          )
        `)
        .eq('access_code', accessCode)
        .eq('status', 'active')
        .single();

      if (error || !test) {
        return res.status(404).json({ 
          errors: [{ msg: 'Test not found or not available' }] 
        });
      }

      // If shuffle_answers is true, randomize the options for MCQs
      if (test.shuffle_answers) {
        test.questions = test.questions.map(question => {
          if (question.type === 'mcq' && Array.isArray(question.options)) {
            // Create a copy of options with their original indices
            const optionsWithIndices = question.options.map((option, index) => ({ 
              option, 
              originalIndex: index 
            }));
            
            // Shuffle the options
            for (let i = optionsWithIndices.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [optionsWithIndices[i], optionsWithIndices[j]] = 
              [optionsWithIndices[j], optionsWithIndices[i]];
            }
            
            // Update the question with shuffled options and mapping
            question.options = optionsWithIndices.map(item => item.option);
            question.optionMapping = optionsWithIndices.map(item => item.originalIndex);
          }
          return question;
        });
      }

      // Strip answers from questions
      const testForLearner = {
        ...test,
        questions: test.questions.map(({ id, type, content, options, difficulty }) => ({
          id,
          type,
          content,
          options,
          difficulty
        }))
      };

      res.status(200).json(testForLearner);
    } catch (err) {
      console.error('Error accessing test:', err);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

/**
 * @route POST /api/learner/submit
 * @description Submit test answers (for learners)
 * @access Public
 */
router.post(
  '/submit',
  [
    body('test_id').isUUID().withMessage('Valid test ID is required'),
    body('learner_name').isString().notEmpty().withMessage('Learner name is required'),
    body('learner_email').isEmail().withMessage('Valid email is required'),
    body('answers').isArray().withMessage('Answers must be an array'),
    body('answers.*.question_id').isUUID().withMessage('Valid question ID is required'),
    body('answers.*.answer').notEmpty().withMessage('Answer is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { test_id, learner_name, learner_email, answers } = req.body;
      
      // Combine learner name and email as learner_id for the database
      const learner_id = `${learner_name} <${learner_email}>`;

      // Verify the test exists and is active
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('id, title, pass_mark, status')
        .eq('id', test_id)
        .eq('status', 'active')
        .single();

      if (testError || !test) {
        return res.status(404).json({ 
          errors: [{ msg: 'Test not found or not available' }] 
        });
      }

      // Get all questions for this test to check answers
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, type, answer')
        .eq('test_id', test_id);

      if (questionsError) {
        return res.status(500).json({ 
          errors: [{ msg: 'Error retrieving test questions' }] 
        });
      }

      // Create a map for easy access to questions
      const questionMap = {};
      questions.forEach(q => {
        questionMap[q.id] = q;
      });

      // Process and grade each answer
      let totalQuestions = answers.length;
      let correctAnswers = 0;
      
      const processedAnswers = answers.map(answer => {
        const { question_id, answer: learnerAnswer } = answer;
        const question = questionMap[question_id];
        
        if (!question) {
          return { ...answer, correct: false };
        }
        
        let isCorrect = false;
        
        // Compare answers based on question type
        switch (question.type) {
          case 'mcq':
            // For MCQs, the answer is the index of the correct option
            isCorrect = parseInt(learnerAnswer) === parseInt(question.answer);
            break;
          case 'true_false':
            // For true/false, compare as strings
            isCorrect = learnerAnswer.toString().toLowerCase() === question.answer.toString().toLowerCase();
            break;
          case 'select':
            // For select questions, compare arrays (answer might be stored as a JSON string)
            const correctAnswerArray = typeof question.answer === 'string' 
              ? JSON.parse(question.answer) 
              : question.answer;
              
            const learnerAnswerArray = typeof learnerAnswer === 'string'
              ? JSON.parse(learnerAnswer)
              : learnerAnswer;
              
            isCorrect = JSON.stringify(correctAnswerArray.sort()) === JSON.stringify(learnerAnswerArray.sort());
            break;
          default:
            // For short answer and fill-in-the-gap, do a more flexible comparison
            isCorrect = learnerAnswer.toString().toLowerCase().trim() === 
                       question.answer.toString().toLowerCase().trim();
        }
        
        if (isCorrect) {
          correctAnswers++;
        }
        
        return { 
          question_id, 
          learner_answer: learnerAnswer, 
          correct: isCorrect 
        };
      });

      // Calculate score as a percentage
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const passed = score >= test.pass_mark;

      // Save the submission
      const { data: submission, error: submissionError } = await supabase
        .from('learner_submissions')
        .insert([
          {
            test_id,
            learner_id,
            answers: processedAnswers,
            score,
            passed
          }
        ])
        .select()
        .single();

      if (submissionError) {
        console.error('Error saving submission:', submissionError);
        return res.status(500).json({ 
          errors: [{ msg: 'Error saving test submission' }] 
        });
      }

      res.status(201).json({
        message: 'Test submitted successfully',
        submission_id: submission.id,
        test_title: test.title,
        score,
        passed,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        submission_date: submission.created_at
      });
    } catch (err) {
      console.error('Error submitting test:', err);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

/**
 * @route GET /api/learner/result/:submissionId
 * @description Get test result by submission ID
 * @access Public
 */
router.get(
  '/result/:submissionId',
  [
    param('submissionId').isUUID().withMessage('Valid submission ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { submissionId } = req.params;

      // Get submission details
      const { data: submission, error } = await supabase
        .from('learner_submissions')
        .select(`
          id,
          test_id,
          learner_id,
          answers,
          score,
          passed,
          submitted_at
        `)
        .eq('id', submissionId)
        .single();

      if (error || !submission) {
        return res.status(404).json({ 
          errors: [{ msg: 'Submission not found' }] 
        });
      }

      // Get test details
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('title, description, pass_mark, result_text')
        .eq('id', submission.test_id)
        .single();

      if (testError || !test) {
        return res.status(404).json({ 
          errors: [{ msg: 'Test not found' }] 
        });
      }

      // Get all questions to show correct answers
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, content, type, options, answer')
        .eq('test_id', submission.test_id);

      if (questionsError) {
        return res.status(500).json({ 
          errors: [{ msg: 'Error retrieving questions' }] 
        });
      }

      // Create a map for easy access to questions
      const questionMap = {};
      questions.forEach(q => {
        questionMap[q.id] = q;
      });

      // Enhance answers with question content
      const detailedAnswers = submission.answers.map(answer => {
        const question = questionMap[answer.question_id];
        if (!question) return answer;

        return {
          ...answer,
          question_content: question.content,
          question_type: question.type,
          options: question.options,
          correct_answer: question.answer
        };
      });

      // Parse learner_id to extract name and email if available
      let learnerName = submission.learner_id;
      let learnerEmail = '';
      
      const emailMatch = submission.learner_id.match(/<(.+)>/);
      if (emailMatch) {
        learnerEmail = emailMatch[1];
        learnerName = submission.learner_id.split('<')[0].trim();
      }
      
      const result = {
        id: submission.id,
        test_title: test.title,
        test_description: test.description,
        learner_name: learnerName,
        learner_email: learnerEmail,
        score: submission.score,
        passed: submission.passed,
        pass_mark: test.pass_mark,
        result_text: test.result_text,
        submission_date: submission.submitted_at,
        answers: detailedAnswers
      };

      res.status(200).json(result);
    } catch (err) {
      console.error('Error retrieving submission:', err);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

module.exports = router;
