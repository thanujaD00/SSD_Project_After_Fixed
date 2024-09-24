// const router = require("express").Router();
// const multer = require('multer');
// const path = require('path');



// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'TuteFiles'); // Store uploaded files in the "uploads" directory
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     const fileExtension = path.extname(file.originalname);
//     cb(null, 'pdf-' + uniqueSuffix + fileExtension);
//   },
// });

// const upload = multer({ storage });

// const {
//   createTutorial,
//   getAllTutorials,
//   getTutorialById,
//   updateTutorialById,
//   deleteTutorialById,
// } = require('../controllers/tutorialController');

// // Create a new tutorial with file upload
// router.post('/create', upload.single('pdf'), createTutorial);

// // Get all tutorials
// router.get('/allT', getAllTutorials);

// // Get a specific tutorial by ID
// router.get('/getT/:id', getTutorialById);

// // Update a tutorial by ID
// router.put('/updateT/:id', updateTutorialById);

// // Delete a tutorial by ID
// router.delete('/deleteT/:id', deleteTutorialById);


// module.exports = router;

const express = require("express");
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth.middleware');
const { body, param } = require('express-validator');

const router = express.Router();

// Restrict file uploads to PDFs only
const fileFilter = (req, file, cb) => {
  const fileTypes = /pdf/; // Allow only PDFs
  const mimeType = fileTypes.test(file.mimetype);
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extname) {
    return cb(null, true);
  }
  cb(new Error('Only PDF files are allowed!')); // Reject if not a PDF
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'TuteFiles'); // Store uploaded files in the "TuteFiles" directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname).toLowerCase(); // Ensure lowercase extension
    cb(null, 'pdf-' + uniqueSuffix + fileExtension);
  },
});

// Multer configuration with fileFilter and storage
const upload = multer({ 
  storage,
  fileFilter,  // Restrict to PDF files
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

const {
  createTutorial,
  getAllTutorials,
  getTutorialById,
  updateTutorialById,
  deleteTutorialById,
} = require('../controllers/tutorialController');

// Validation rules
const validateTutorial = [
  body('title').isString().notEmpty().withMessage('Title is required.'),
  body('description').optional().isString(),
  body('courseid').isMongoId().withMessage('Course ID must be a valid ObjectId.'),
];

const validateObjectId = [
  param('id').isMongoId().withMessage('Invalid ID format.'),
];




router.post('/create', authenticate(['admin']), upload.single('pdf'), validateTutorial, (req, res, next) => {
  createTutorial(req, res).catch(err => {
    res.status(400).json({ error: err.message });
  });
});

router.get('/allT', authenticate(['admin', 'user']), getAllTutorials);
router.get('/getT/:id', authenticate(['admin', 'user']),validateObjectId, getTutorialById);
router.put('/updateT/:id', authenticate(['admin']),validateObjectId, updateTutorialById);
router.delete('/deleteT/:id', authenticate(['admin']),validateObjectId, deleteTutorialById);

module.exports = router;
