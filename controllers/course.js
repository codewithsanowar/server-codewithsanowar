import { instance, razorpayKeySecret, razorpayKeyId } from "../index.js";
import tryCatch from "../middlewares/TryCatch.js";
import { Chapter } from "../models/Chapter.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/user.js";
import crypto from "crypto"
import mongoose from "mongoose";

export const getAllCourses = tryCatch(async(req,res) => {
    const courses = await Courses.find();
    res.json({
        courses,
    });
});

export const getSingleCourse = tryCatch(async(req,res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid course id",
      });
    }

    const course = await Courses.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.json({
        course,
    });
});

export const fetchLectures = tryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // ✅ Admin bypass
  if (user.role === "admin") {
    return res.json({ lectures });
  }

  // ✅ FIX: safe check before includes
  if (!user.subscription || !user.subscription.includes(req.params.id)) {
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });
  }

  res.json({ lectures });
});

export const fetchChapters = tryCatch(async (req, res) =>{
   const chapters = await Chapter.find({ course: req.params.id });
   const user = await User.findById(req.user._id);

   if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // ✅ Admin bypass
  if (user.role === "admin") {
    return res.json({ chapters });
  }
  if (!user.subscription || !user.subscription.includes(req.params.id)) {
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });
  }

  res.json({ chapters });
})

export const fetchLecture = tryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id)

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // ✅ Admin bypass
  if (user.role === "admin") {
    return res.json({ lecture });
  }

  // ✅ FIX: safe check before includes
  if (!user.subscription || !user.subscription.includes(lecture.course)) {
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });
  }

  res.json({ lecture });
});

export const fetchChapter = tryCatch(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id); // ✅ correct

  if (!chapter) {
    return res.status(404).json({
      message: "Chapter not found",
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // ✅ Admin bypass
  if (user.role === "admin") {
    return res.json({ chapter });
  }

  if (!user.subscription || !user.subscription.includes(chapter.course.toString())) {
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });
  }

  res.json({ chapter });
});


export const getMyCourses = tryCatch(async(req,res) => {
    const courses = await Courses.find({_id: req.user.subscription})

    res.json({
      courses,
    })
});

export const checkout = tryCatch(async(req,res)=> {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (user.subscription.some((courseId) => courseId.toString() === course._id.toString())) {
    return res.status(400).json({
      message: "You already have this course",
    });
  }

  const options = {
    amount: Math.round(Number(course.price) * 100),
    currency: "INR",
    receipt: `course_${course._id}_${Date.now()}`,
  };

  const order = await instance.orders.create(options);

  res.status(201).json({
    order,
    course,
    keyId: razorpayKeyId,
  });
});

export const paymentVerification = tryCatch(async(req,res) => {
  const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Incomplete payment details" });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
  .createHmac("sha256", razorpayKeySecret)
  .update(body)
  .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
  if(isAuthentic){
      await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      const user = await User.findById(req.user._id)
      const course = await Courses.findById(req.params.id)

      if (!user || !course) {
        return res.status(404).json({ message: "User or course not found" });
      }

      if (user.subscription.some((courseId) => courseId.toString() === course._id.toString())) {
        return res.status(409).json({ message: "You already have this course" });
      }

      user.subscription.push(course._id)
      await user.save()

      res.status(200).json({
        message: "Course Purchased Successfully"
      })
  }else{
    return res.status(400).json({
      message: "Payment Failed",
    });
  }

});


// GET /api/preview/:id — public, no auth required
// Returns one lecture (earliest) so the play button can show a sample video
export const getCoursePreview = async (req, res) => {
  try {
    const lecture = await Lecture.findOne({ course: req.params.id }).sort({
      createdAt: 1,
    });

    if (!lecture) {
      return res.json({ lecture: null });
    }

    res.json({ lecture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/lectures/preview/:id — public, no auth required
// Returns lecture titles/descriptions only (no video URLs) for the syllabus list
export const getLecturesPreview = async (req, res) => {
  try {
    const lectures = await Lecture.find({ course: req.params.id })
      .select("title description duration chapter createdAt") // no "video"
      .sort({ createdAt: 1 });

    res.json({ lectures });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getChaptersPreview = async (req, res) => {
  try {
    const chapters = await Chapter.find({ course: req.params.id }).sort({
      createdAt: 1,
    });
    res.json({ chapters });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};