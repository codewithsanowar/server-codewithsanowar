import tryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { User } from "../models/user.js";
import { Chapter } from "../models/Chapter.js";

export const createCourse = tryCatch(async (req, res) => {
  const file = req.files?.find((f) => f.fieldname === "image");

  if (!file) {
    return res.status(400).json({ message: "Course image is required" });
  }

  const requiredFields = [
    "title",
    "description",
    "price",
    "oldprice",
    "duration",
    "lessons",
    "language",
    "category",
    "createdBy",
  ];

  const missingField = requiredFields.find(
    (field) => !String(req.body[field] ?? "").trim(),
  );

  if (missingField) {
    return res.status(400).json({
      message: `${missingField} is required`,
    });
  }

  const price = Number(req.body.price);
  const oldprice = Number(req.body.oldprice);
  const duration = Number(req.body.duration);

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(oldprice) ||
    !Number.isFinite(duration)
  ) {
    return res.status(400).json({
      message: "Price, old price, and duration must be valid numbers",
    });
  }

  const course = await Courses.create({
    title: req.body.title,
    description: req.body.description,
    price,
    oldprice,
    duration,
    lessons: req.body.lessons,
    language: req.body.language,
    category: req.body.category,
    createdBy: req.body.createdBy,
    image: file.path,
  });

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    course,
  });
});




export const addLecture = tryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No course with this id",
    });

  const { title, description, chapter  } = req.body;

  const file = req.files?.[0]; // ✅ because you are using upload.any()

  if (!file) {
    return res.status(400).json({
      message: "Video file is required",
    });
  }

  const lecture = await Lecture.create({
    title,
    description,
    video: file?.path,
    course: course._id,
    chapter: req.body.chapter,   
  });

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});

// Chapter
export const addChapter = tryCatch(async(req, res)=>{
  const course = await Courses.findById(req.params.id);

   if (!course)
    return res.status(404).json({
      message: "No course with this id",
    });

    const {title} = req.body;

    const chapter = await Chapter.create({
      title,
      course: course._id,
    });

     res.status(201).json({
    message: "Chapter Added",
    chapter,
  });
})

// its not work
export const deleteLecture = tryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  if (!lecture) {
    return res.status(404).json({
      message: "No lecture with this id",
    });
  }

  // ✅ delete video file
  if (lecture.video) {
    try {
      await unlinkAsync(lecture.video); // important
      console.log("Video deleted successfully");
    } catch (err) {
      console.log("Error deleting file:", err.message);
    }
  }

  await lecture.deleteOne();

  res.json({ message: "Lecture deleted successfully" });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = tryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  const lectures = await Lecture.find({ course: course._id });

  // ✅ DELETE LECTURE VIDEOS
  for (const lecture of lectures) {
    if (lecture.video) {
      try {
        const filePath = path.resolve(lecture.video);

        if (fs.existsSync(filePath)) {
          await unlinkAsync(filePath);
          console.log("Video Deleted:", filePath);
        } else {
          console.log("File NOT found:", filePath);
        }
      } catch (error) {
        console.log("Video Delete Error:", error.message);
      }
    }
  }

  // ✅ DELETE COURSE IMAGE
  if (course.image) {
    try {
      const imagePath = path.resolve(course.image);

      if (fs.existsSync(imagePath)) {
        await unlinkAsync(imagePath);
        console.log("Course Image Deleted:", imagePath);
      } else {
        console.log("Image NOT found:", imagePath);
      }
    } catch (error) {
      console.log("Image Delete Error:", error.message);
    }
  }

  // ✅ DELETE LECTURES FROM DB
  await Lecture.deleteMany({ course: course._id });

  // ✅ REMOVE FROM USERS
  await User.updateMany(
    {},
    {
      $pull: {
        subscription: course._id,
      },
    },
  );

  // ✅ DELETE COURSE
  await Courses.findByIdAndDelete(course._id);

  res.status(200).json({
    success: true,
    message: "Course Deleted Successfully",
  });
});
export const getAllStats = tryCatch(async (req, res) => {
  const totalCourse = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalChapters = (await Chapter.find()).length;
  const totalUser = (await User.find()).length;

  const stats = {
    totalCourse,
    totalLectures,
    totalChapters,
    totalUser,
  };
  res.json({
    stats,
  });
});


export const getAllUser = tryCatch(async(req, res) => {
  const users = await User.find({_id: {$ne: req.user._id} }).select(
    "-password"
  );

  res.json({ users });
});


export const updateRole = tryCatch(async(req, res)=> {
  const user = await User.findById(req.params.id)

  if(user.role === "user"){
    user.role = "admin";
    await user.save();

    return res.status(200).json({
      message: "Role updated to admin"
    });
  }
  if(user.role === "admin"){
    user.role = "user";
    await user.save();

    return res.status(200).json({
      message: "Role updated to user"
    });
  }

})