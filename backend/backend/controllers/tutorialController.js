const Tutorial = require('../models/tutorialModel');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { validationResult } = require('express-validator');

// Function to validate uploaded PDF content
const validatePDFContent = async (pdfPath) => {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    // Optional: Perform further validation based on the parsed content
    if (!data.text || data.pages > 100) {  // Example: reject if no text or too many pages
      throw new Error('Invalid or suspicious PDF content.');
    }
  } catch (err) {
    throw new Error('PDF validation failed: ' + err.message);
  }
};

const createTutorial = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, courseid } = req.body;
    const pdfPath = req.file.path;

    // Validate the uploaded PDF content
    await validatePDFContent(pdfPath);

    const newTutorial = new Tutorial({
      title,
      description,
      courseid,
      pdf: pdfPath,
      
    });

    await newTutorial.save();
    res.json('Tutorial added');
  } catch (err) {
    console.error(err);
    //res.status(500).json({ error: 'Error creating tutorial' });

    // Clean up the uploaded file in case of failure
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete invalid PDF:', err);
      });
    }

    res.status(500).json({ error: err.message || 'Error creating tutorial' });
  }
};

const getAllTutorials = async (req, res) => {
  try {
    const tutorials = await Tutorial.find();
    res.json(tutorials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching tutorials' });
  }
};

const getTutorialById = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json(tutorial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching tutorial' });
  }
};

const updateTutorialById = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tutorialId = req.params.id;
    const newData = req.body;
    const updatedTutorial = await Tutorial.findByIdAndUpdate(
      tutorialId,
      newData,
      { new: true }
    );
    if (!updatedTutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json(updatedTutorial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating tutorial' });
  }
};

const deleteTutorialById = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const tutorialId = req.params.id;
    const deletedTutorial = await Tutorial.findByIdAndRemove(tutorialId);
    if (!deletedTutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json({ message: 'Tutorial deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting tutorial' });
  }
};


module.exports = {
  createTutorial,
  getAllTutorials,
  getTutorialById,
  updateTutorialById,
  deleteTutorialById,
};
