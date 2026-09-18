import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  updateProgress,
  getProgress,
  removeProgress,
  getCertificate,
  createCertificate,
} from "../controllers/progress.js";

const router = express.Router();

router.post("/progress/:courseId", isAuth, updateProgress);
router.get("/progress/:courseId", isAuth, getProgress);
router.delete("/progress/:courseId", isAuth, removeProgress);
router.get("/progress/:courseId/certificate", isAuth, getCertificate);
router.post("/progress/:courseId/certificate", isAuth, createCertificate);

export default router;