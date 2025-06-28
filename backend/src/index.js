require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Configure middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Testcraft AI API is running' });
});

// Import routes
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const uploadRoutes = require('./routes/upload.routes');
const aiRoutes = require('./routes/ai.routes');
const learnerRoutes = require('./routes/learner.routes');
const questionRoutes = require('./routes/question.routes');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/questions', questionRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
});

module.exports = app; // Export for testing
