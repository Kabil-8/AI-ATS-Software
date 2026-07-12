const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3Client, BUCKET_NAME } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        uploadedBy: req.user ? req.user._id.toString() : 'anonymous',
        originalName: file.originalname,
      });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const key = `resumes/${uuidv4()}${ext}`;
      cb(null, key);
    },
  }),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// For development without S3, use memory storage
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { upload, uploadMemory };
