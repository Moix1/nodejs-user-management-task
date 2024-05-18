const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createDirectory = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';

    if (file.mimetype.startsWith('image')) {
      uploadPath = 'src/uploads/profile_pictures';
    } else if (file.mimetype === 'text/csv') {
      uploadPath = 'src/uploads/csv_files';
    } else {
      return cb({ message: 'This file type is not supported' }, false);
    }

    createDirectory(uploadPath);

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb({ message: 'Unsupported file format' }, false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
