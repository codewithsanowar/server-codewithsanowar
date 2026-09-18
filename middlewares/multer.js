import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";

// storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },

  filename(req, file, cb) {
    const id = uuid();

    const ext = path.extname(file.originalname); // safer way
    const fileName = `${id}${ext}`;

    cb(null, fileName);
  },
});

// file filter (optional but recommended)
const fileFilter = (req, file, cb) => {
  // allow all files (you can restrict if needed)
  cb(null, true);
};

// multer instance
const upload = multer({
  storage,
  fileFilter,
});

// ✅ USE THIS (flexible - no more "Unexpected field")
export const uploadFiles = upload.any();