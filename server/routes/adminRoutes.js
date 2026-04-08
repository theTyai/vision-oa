const express = require('express');
const router = express.Router();
const {
  addMCQQuestion, getMCQQuestions, updateMCQQuestion, deleteMCQQuestion,
  addCodingQuestion, getCodingQuestions, deleteCodingQuestion,
  setTestConfig, getTestConfig,
  getMCQResults, getParticipants, getCodingSubmissions,
  upload
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const guard = [protect, adminOnly];

// MCQ
router.get('/mcq/questions', guard, getMCQQuestions);
router.post('/mcq/questions', guard, upload.single('questionImage'), addMCQQuestion);
router.put('/mcq/questions/:id', guard, upload.single('questionImage'), updateMCQQuestion);
router.delete('/mcq/questions/:id', guard, deleteMCQQuestion);

// Coding
router.get('/coding/questions', guard, getCodingQuestions);
router.post('/coding/questions', guard, addCodingQuestion);
router.delete('/coding/questions/:id', guard, deleteCodingQuestion);

// Config
router.get('/config', guard, getTestConfig);
router.post('/config', guard, setTestConfig);

// Results & Participants
router.get('/results/mcq', guard, getMCQResults);
router.get('/results/coding', guard, getCodingSubmissions);
router.get('/participants', guard, getParticipants);

module.exports = router;
