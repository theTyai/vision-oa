const MCQQuestion = require('../models/MCQQuestion');
const MCQResult = require('../models/MCQResult');
const CodingQuestion = require('../models/CodingQuestion');
const CodingSubmission = require('../models/CodingSubmission');
const TestConfig = require('../models/TestConfig');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `q_${Date.now()}${path.extname(file.originalname)}`);
  }
});
exports.upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// MCQ Questions
exports.addMCQQuestion = async (req, res) => {
  try {
    const { questionText, options, correctOption, marks, negativeMarks, order } = req.body;
    const questionImage = req.file ? `/uploads/${req.file.filename}` : null;

    const q = await MCQQuestion.create({
      questionText,
      questionImage,
      options: JSON.parse(options),
      correctOption: parseInt(correctOption),
      marks: parseInt(marks) || 4,
      negativeMarks: parseInt(negativeMarks) || 1,
      order: parseInt(order) || 0
    });

    res.status(201).json({ success: true, question: q });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMCQQuestions = async (req, res) => {
  try {
    const questions = await MCQQuestion.find({}).sort({ order: 1 });
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMCQQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.options && typeof updates.options === 'string') {
      updates.options = JSON.parse(updates.options);
    }
    if (req.file) updates.questionImage = `/uploads/${req.file.filename}`;

    const q = await MCQQuestion.findByIdAndUpdate(id, updates, { new: true });
    if (!q) return res.status(404).json({ success: false, message: 'Question not found' });

    res.json({ success: true, question: q });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMCQQuestion = async (req, res) => {
  try {
    await MCQQuestion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Coding Questions
exports.addCodingQuestion = async (req, res) => {
  try {
    const q = await CodingQuestion.create(req.body);
    res.status(201).json({ success: true, question: q });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCodingQuestions = async (req, res) => {
  try {
    const questions = await CodingQuestion.find({}).sort({ order: 1 });
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCodingQuestion = async (req, res) => {
  try {
    await CodingQuestion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Test Config
exports.setTestConfig = async (req, res) => {
  try {
    const config = await TestConfig.findOneAndUpdate(
      { isActive: true },
      req.body,
      { upsert: true, new: true }
    );
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTestConfig = async (req, res) => {
  try {
    const config = await TestConfig.findOne({ isActive: true });
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Results
exports.getMCQResults = async (req, res) => {
  try {
    const results = await MCQResult.find({})
      .populate('userId', 'name scholarNumber branch email')
      .sort({ score: -1 });

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getParticipants = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCodingSubmissions = async (req, res) => {
  try {
    const submissions = await CodingSubmission.find({})
      .populate('userId', 'name scholarNumber branch')
      .populate('questionId', 'title')
      .sort({ submittedAt: -1 });
    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
