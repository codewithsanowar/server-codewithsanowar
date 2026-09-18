import { Progress } from "../models/Progress.js";

// GET /api/progress/:courseId
export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    res.json({
      completedLectures: progress ? progress.completedLectures : [],
      certificate: progress?.certificateName
        ? {
            name: progress.certificateName,
            issuedAt: progress.certificateIssuedAt,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/progress/:courseId/certificate
export const getCertificate = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    if (!progress?.certificateName) {
      return res.json({ certificate: null });
    }

    res.json({
      certificate: {
        name: progress.certificateName,
        issuedAt: progress.certificateIssuedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/progress/:courseId/certificate body: { name }
export const createCertificate = async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (name.length > 100) {
      return res.status(400).json({ message: "Name must be 100 characters or fewer" });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: req.params.courseId,
      });
    }

    if (!progress.certificateName) {
      progress.certificateName = name;
      progress.certificateIssuedAt = new Date();
      await progress.save();
    }

    res.status(201).json({
      certificate: {
        name: progress.certificateName,
        issuedAt: progress.certificateIssuedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/progress/:courseId  body: { lectureId }
export const updateProgress = async (req, res) => {
  try {
    const { lectureId } = req.body;

    if (!lectureId) {
      return res.status(400).json({ message: "lectureId is required" });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: req.params.courseId,
        completedLectures: [lectureId],
      });
    } else if (!progress.completedLectures.includes(lectureId)) {
      progress.completedLectures.push(lectureId);
      await progress.save();
    }

    res.json({
      message: "Progress updated",
      completedLectures: progress.completedLectures,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/progress/:courseId  body: { lectureId }
export const removeProgress = async (req, res) => {
  try {
    const { lectureId } = req.body;

    if (!lectureId) {
      return res.status(400).json({ message: "lectureId is required" });
    }

    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    if (progress) {
      progress.completedLectures = progress.completedLectures.filter(
        (id) => id.toString() !== lectureId
      );
      await progress.save();
    }

    res.json({
      message: "Progress updated",
      completedLectures: progress ? progress.completedLectures : [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};