import express from "express";
import {
    checkout,
    fetchChapter,
    fetchChapters,
    fetchLecture,
    fetchLectures,
    getAllCourses,
    getChaptersPreview,
    getCoursePreview,
    getLecturesPreview,
    getMyCourses,
    getSingleCourse,
    paymentVerification
} from "../controllers/course.js";
import { isAuth } from "../middlewares/isAuth.js";




const router = express.Router();

router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);
router.get("/lectures/:id", isAuth, fetchLectures);
router.get("/chapters/:id", isAuth, fetchChapters);
router.get("/lecture/:id", isAuth, fetchLecture);
router.get("/chapter/:id", isAuth, fetchChapter);
router.get("/mycourse", isAuth, getMyCourses);
router.post("/course/checkout/:id", isAuth, checkout);
router.post("/verification/:id", isAuth, paymentVerification);


router.get("/preview/:id", getCoursePreview);
router.get("/lectures/preview/:id", getLecturesPreview);
router.get("/chapters/preview/:id", getChaptersPreview);


export default router;