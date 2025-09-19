import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/temp"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const mime = file.mimetype;

  if (mime.startsWith("image/")) {
    cb(null, true);
  } else if (mime.startsWith("video/")) {
    cb(null, true);
  } else if (
    mime === "application/pdf" ||
    mime === "application/msword" || 
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image/video/pdf/doc files allowed!"), false);
  }
};

const uploadChatMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, 
}).single("file");

const validateChatFileSize = (req, res, next) => {
  if (!req.file) return next();

  const { mimetype, size } = req.file;

  if (mimetype.startsWith("image/") && size > 10 * 1024 * 1024) {
    return next(new Error("Image must be less then or equal to 10MB"));
  }

  if (mimetype.startsWith("video/") && size > 50 * 1024 * 1024) {
    return next(new Error("Video must be less then or equal to 50MB"));
  }

  if (
    (mimetype === "application/pdf" ||
      mimetype === "application/msword" ||
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document") &&
    size > 10 * 1024 * 1024
  ) {
    return next(new Error("PDF/DOC must be less then or equal to 10MB"));
  }

  next();
};

export { uploadChatMedia, validateChatFileSize };