/**
 * Authentication middleware using Supabase Auth
 * Verifies the user's session token and attaches the user to the request
 */
const supabase = require('../config/supabase');

module.exports = async function(req, res, next) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        errors: [{ msg: 'Authorization denied. Valid bearer token required.' }] 
      });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth error:', error?.message);
      return res.status(401).json({ 
        errors: [{ msg: 'Invalid or expired session' }] 
      });
    }
    
    // Attach the user to the request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};
