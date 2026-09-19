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

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDirectory);
  },
  filename(req, file, cb) {
    const id = uuid();
    const ext = path.extname(file.originalname);
    const fileName = `${id}${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

export const uploadFiles = upload.any();
export const uploadImage = upload.single("image"); // ✅ this is what we'll use for course creation
