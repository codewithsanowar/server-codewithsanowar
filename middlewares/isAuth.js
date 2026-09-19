import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(403).json({ message: "Please Login" });
    }

    let decodedData;
    try {
      decodedData = jwt.verify(token, process.env.Jwt_Secret);
    } catch (err) {
      // ✅ distinguishes an expired token from a garbage/tampered one
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Session expired, please login again" });
      }
      return res.status(403).json({ message: "Invalid token, please login again" });
    }

    const user = await User.findById(decodedData._id);

    if (!user) {
      return res.status(403).json({ message: "User not found, please login again" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized (admin only)" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
