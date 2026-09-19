import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  addChapter,
  addLecture,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllStats,
  getAllUser,
  updateRole,
} from "../controllers/admin.js";
import { uploadFiles, uploadImage } from "../middlewares/multer.js";

const router = express.Router();

router.post("/course/new", isAuth, isAdmin, uploadImage, createCourse);
router.post("/course/:id", isAuth, isAdmin, uploadFiles, addLecture);
router.post("/chapter/:id", isAuth, isAdmin, uploadFiles, addChapter);
router.delete("/course/:id", isAuth, isAdmin, deleteCourse);
router.delete("/lecture/:id", isAuth, isAdmin, deleteLecture);
router.get("/stats", isAuth, isAdmin, getAllStats);
router.put("/user/:id", isAuth, isAdmin, updateRole);
router.get("/users", isAuth, isAdmin, getAllUser);

export default router;
