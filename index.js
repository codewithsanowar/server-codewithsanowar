import express from "express";
import dotenv from "dotenv"
import { connectDb } from "./Database/db.js";
import Razorpay from "razorpay"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"



dotenv.config();

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.Razorpay_keY;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || process.env.Razorpay_Secret;

export const instance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
})
export { razorpayKeyId, razorpayKeySecret };
const app = express();
connectDb();
const PORT = process.env.PORT;
const serverDirectory = path.dirname(fileURLToPath(import.meta.url));



app.get("/", (req, res) => {
    res.send("Server in running")
})


app.use("/uploads", express.static(path.join(serverDirectory, "uploads")))


// using mifflewares
app.use(express.json())
import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  process.env.Frontend_URL, // set this in Render to https://codewithsanowar-frontend.vercel.app (no trailing slash)
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "token"],
  })
);



// importing routes

import userRoutes from "./routes/user.js"
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import progressRoutes from "./routes/progress.js"; 

// using routes

app.use("/api", userRoutes)
app.use("/api", courseRoutes)
app.use("/api", adminRoutes)
app.use("/api", progressRoutes)



app.listen(PORT, () => {
    console.log(`Server in running on port${PORT}`)
})
