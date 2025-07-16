const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/brochures/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300 MB
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|ppt|pptx|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, PPT, DOC, DOCX files are allowed!'));
  }
});

module.exports = upload; 