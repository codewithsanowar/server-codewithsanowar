import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../middlewares/sendMail.js";
import tryCatch from "../middlewares/TryCatch.js";


// Register controllers

export const register = tryCatch(async (req, res) => {
    const { email, name, password } = req.body;

    let user = await User.findOne({ email });

    if (user) return res.status(400).json({
        message: "User Already exists"
    });

    const hashPassword = await bcrypt.hash(password, 10)

    user = {
        name,
        email,
        password: hashPassword,
    }

    const otp = Math.floor(Math.random() * 1000000);

    const activationToken = jwt.sign({
        user,
        otp,
    }, process.env.Activation_Secret,
        {
            expiresIn: "5m",
        }
    );
    const data = {
        name,
        otp,
    };

    await sendMail(
        email,
        "CodeWithSanowar",
        data
    )

    res.status(200).json({
        message: "OTP send to your mail",
        activationToken,
    })
})


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