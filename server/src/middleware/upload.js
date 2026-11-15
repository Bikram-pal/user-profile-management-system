const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
});

module.exports = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /image\/(jpeg|png|webp)/.test(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG or WEBP images allowed')),
});
