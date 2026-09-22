import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import connectDb from "./config/db.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();

// CORS Middleware
app.use(
  cors({
    origin: [
      "https://virtualassistant-1fr2.onrender.com",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  connectDb();
  console.log(`Server started on port ${PORT}`);
});