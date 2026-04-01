const AppError = require("../utils/AppError");

let multer;
try {
  multer = require("multer");
} catch (error) {
  multer = null;
}

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function uploadProofImage(req, res, next) {
  if (!multer) {
    return next(
      new AppError("File upload requires multer dependency. Run: npm install multer", 500)
    );
  }

  const uploader = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.has(file.mimetype)) {
        return cb(new AppError("Only JPG, PNG, and WEBP files are allowed", 400));
      }
      return cb(null, true);
    }
  }).single("proofImage");

  return uploader(req, res, next);
}

module.exports = { uploadProofImage };
