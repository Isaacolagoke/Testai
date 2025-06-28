const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @description Register a new tutor using Supabase Auth
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
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (authError) {
        console.error('Supabase Auth signup error:', authError);
        return res.status(400).json({ 
          errors: [{ msg: authError.message || 'Failed to create account' }] 
        });
      }

      // Return user data and session
      return res.status(201).json({
        user: authData.user,
        session: authData.session
      });
    } catch (err) {
      console.error('Server error during signup:', err);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

/**
 * @route POST /api/auth/login
 * @description Authenticate user & get session token using Supabase Auth
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
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error.message);
        return res.status(400).json({ 
          errors: [{ msg: 'Invalid credentials' }] 
        });
      }

      // Return user and session data
      return res.status(200).json({
        user: data.user,
        session: data.session
      });
    } catch (err) {
      console.error('Server error during login:', err);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

/**
 * @route POST /api/auth/logout
 * @description Logout user by invalidating Supabase session
 * @access Private
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ errors: [{ msg: 'Error during logout' }] });
    }
    
    res.status(200).json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Server error during logout:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

/**
 * @route GET /api/auth/user
 * @description Get current authenticated user data
 * @access Private
 */
router.get('/user', auth, async (req, res) => {
  try {
    // The user is already attached to the request by the auth middleware
    res.status(200).json({ user: req.user });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

module.exports = router;
