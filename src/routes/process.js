const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const { auth } = require('../middleware/auth');

const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post('/process-csv', auth, upload.single('file'), (req, res) => {
  const inputFilePath = req.file.path;
  const outputFilePath = `outputs/output-${Date.now()}.csv`;

  const pythonProcess = spawn('python', ['script.py', inputFilePath, outputFilePath]);

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send({ error: 'Failed to process CSV file' });
    }
    res.download(outputFilePath, (err) => {
      if (err) {
        res.status(500).send({ error: 'Failed to download processed file' });
      }
    });
  });
});

module.exports = router;
