import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../middlewares/sendMail.js";
import tryCatch from "../middlewares/TryCatch.js";


// Register controllers

export const register = tryCatch(async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const userData = {
    name,
    email,
    password: hashPassword,
  };

  const otp = Math.floor(100000 + Math.random() * 900000);

  if (!process.env.Activation_Secret) {
    console.error("❌ Activation_Secret is missing from environment variables");
    return res.status(500).json({
      message: "Server misconfiguration: Activation_Secret is not set",
    });
  }

  const activationToken = jwt.sign(
    { user: userData, otp },
    process.env.Activation_Secret,
    { expiresIn: "5m" }
  );

  try {
    await sendMail(email, "CodeWithSanowar — Verify your account", {
      name,
      otp,
    });
  } catch (error) {
    // ✅ this will now show up clearly in your Render logs with the real reason
    console.error("❌ Email sending failed:", error.message);
    return res.status(500).json({
      message: "Failed to send OTP email. Please try again later.",
    });
  }

  res.status(200).json({
    message: "OTP sent to your email",
    activationToken,
  });
});

export const verifyUser = tryCatch(async (req, res) => {
  const { otp, activationToken } = req.body;

  if (!otp || !activationToken) {
    return res.status(400).json({ message: "OTP and activation token are required" });
  }

  let verify;
  try {
    verify = jwt.verify(activationToken, process.env.Activation_Secret);
  } catch (error) {
    return res.status(400).json({ message: "OTP expired or invalid, please try again" });
  }

  if (verify.otp !== Number(otp)) {
    return res.status(400).json({ message: "Wrong OTP" });
  }

  const existingUser = await User.findOne({ email: verify.user.email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = await User.create(verify.user);

  const token = jwt.sign({ _id: newUser._id }, process.env.Jwt_Secret, {
    expiresIn: "15d",
  });

  res.status(201).json({
    message: "User registered successfully",
    user: newUser,
    token,
  });
});


// VerifyUser controllers

export const verifyUser = tryCatch(async (req, res) => {
  const { otp, activationToken } = req.body;

  const verify = jwt.verify(
    activationToken,
    process.env.Activation_Secret
  );

  if (!verify) {
    return res.status(400).json({
      message: "OTP Expired",
    });
  }

  // ✅ FIXED COMPARISON
  if (String(verify.otp) !== String(otp)) {
    return res.status(400).json({
      message: "Wrong OTP",
    });
  }

  await User.create({
    name: verify.user.name,
    email: verify.user.email,
    password: verify.user.password,
  });

  res.json({
    message: "User Registered Successfully",
  });
});


// Login controllers

export const loginUser = tryCatch(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        email
    });
    if (!user)
        return res.status(400).json({
            message: "No user with this email",
        });

    const mathPassword = await bcrypt.compare(password, user.password);

    if (!mathPassword)
        return res.status(400).json({
            message: "Wrong password",
        });

    const token = jwt.sign({ _id: user._id }, 
        process.env.Jwt_Secret, 
        {
        expiresIn: "10d",
    });

    res.json({
        message: `Welcome back ${user.name}`,
        token,
        user,
    });
});


// MyProfile controllers

export const myProfile = tryCatch(async(req, res)=> {
    const user = await User.findById(req.user._id);

    res.json({user});
})
