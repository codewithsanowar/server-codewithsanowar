import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const uploadsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../uploads",
);

fs.mkdirSync(uploadsDirectory, { recursive: true });

// storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDirectory);
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
export const uploadImage = upload.single("image");