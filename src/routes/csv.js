const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/process', [authenticate, upload.single('csvFile')], (req, res) => {
  const filePath = req.file.path;

  const pythonProcess = spawn('python', [path.join(__dirname, '../../../Script.py'), filePath]);

  let outputData = '';

  pythonProcess.stdout.on('data', (data) => {
    outputData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    res.status(500).send({ error: 'Error processing file' });
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.setHeader('Content-Disposition', 'attachment; filename=processed_data.csv');
      res.setHeader('Content-Type', 'text/csv');
      res.send(outputData);
    } else {
      res.status(500).send({ error: 'Error processing file' });
    }
  });
});

module.exports = router;
