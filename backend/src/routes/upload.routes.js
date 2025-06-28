const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images, PDFs, DOCs, and TXT files
  const allowedFileTypes = [
    'image/jpeg', 
    'image/png', 
    'application/pdf',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload an image, PDF, DOC, or TXT file.'), false);
  }
};

// Initialize multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

/**
 * @route POST /api/upload
 * @description Upload a file to Supabase storage and save reference in DB
 * @access Private
 */
router.post(
  '/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ errors: [{ msg: 'No file uploaded' }] });
    }

    const testId = req.body.testId;
    if (!testId) {
      return res.status(400).json({ errors: [{ msg: 'Test ID is required' }] });
    }

    // Determine file type based on mimetype
    let fileType;
    if (req.file.mimetype.includes('image')) {
      fileType = 'image';
    } else if (req.file.mimetype.includes('pdf')) {
      fileType = 'pdf';
    } else if (req.file.mimetype.includes('word') || req.file.mimetype.includes('document')) {
      fileType = 'doc';
    } else if (req.file.mimetype.includes('text')) {
      fileType = 'text';
    }

    // Upload file to Supabase Storage
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`test-${testId}/${fileName}`, fileStream, {
        contentType: req.file.mimetype,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return res.status(500).json({ errors: [{ msg: 'File upload to storage failed' }] });
    }

    // Get public URL for the uploaded file
    const { data: publicURL } = supabase.storage
      .from('uploads')
      .getPublicUrl(`test-${testId}/${fileName}`);

    // Store file info in the uploads table
    const { data: uploadRecord, error: dbError } = await supabase
      .from('uploads')
      .insert([{
        test_id: testId,
        file_url: publicURL.publicUrl,
        file_type: fileType
      }])
      .select();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return res.status(500).json({ errors: [{ msg: 'Error saving file data to database' }] });
    }

    // Clean up temporary local file
    fs.unlinkSync(filePath);

    res.status(201).json({
      upload: uploadRecord[0],
      message: 'File uploaded successfully'
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ errors: [{ msg: 'Server error during upload' }] });
  }
});

module.exports = router;
