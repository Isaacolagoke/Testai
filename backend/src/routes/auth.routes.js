const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @description Register a new tutor
 * @access Public
 */
router.post(
  '/signup',
  [
    // Validation middleware
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number and special character')
      .custom((value, { req }) => {
        if (value.toLowerCase().includes(req.body.name.toLowerCase())) {
          throw new Error('Password must not contain your name');
        }
        return true;
      }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user in Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          { name, email, password: hashedPassword }
        ])
        .select();

      if (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ errors: [{ msg: 'Server error' }] });
      }

      // Return user without password
      delete newUser[0].password;
      return res.status(201).json(newUser[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

/**
 * @route POST /api/auth/login
 * @description Authenticate user & get token
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Return user without password
      delete user.password;
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

/**
 * @route POST /api/auth/logout
 * @description Logout user
 * @access Public
 */
router.post('/logout', (req, res) => {
  // In a token-based authentication system, the client should discard the token
  // Here we just send a successful response
  res.status(200).json({ msg: 'Logged out successfully' });
});

module.exports = router;
