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
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image/video files allowed!"), false);
  }
};

const uploadProductMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).fields([
  { name: "img", maxCount: 5 },
  { name: "video", maxCount: 1 },
]);

const validateFileSizes = (req, res, next) => {
  if (req.files?.img) {
    for (let file of req.files.img) {
      if (file.size > 2 * 1024 * 1024) {
        return next(new Error("Each image must be <= 2MB"));
      }
    }
  }
  if (req.files?.video) {
    for (let file of req.files.video) {
      if (file.size > 20 * 1024 * 1024) {
        return next(new Error("Video must be <= 20MB"));
      }
    }
  }
  next();
};

export { uploadProductMedia, validateFileSizes };