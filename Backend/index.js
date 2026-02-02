
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import connectDb from "./config/db.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();



app.use(cors({
  origin: "https://your-app.vercel.app",
  credentials: true
}));


// middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);


// test route (important for checking)
app.get("/", (req, res) => {
    res.send("API is running");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    connectDb();
    console.log(`Server started on port ${PORT}`);
});
