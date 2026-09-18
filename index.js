import express from "express";
import dotenv from "dotenv"
import { connectDb } from "./Database/db.js";
import Razorpay from "razorpay"
import cors from "cors"



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



app.get("/", (req, res) => {
    res.send("Server in running")
})


app.use("/uploads", express.static("uploads"))


// using mifflewares
app.use(express.json())
app.use(cors());



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