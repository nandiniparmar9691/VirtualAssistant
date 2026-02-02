import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import connectDb from "./config/db.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();

// ✅ ALLOWED ORIGINS
const allowedOrigins = [
  "https://virtualassistant-1fr2.onrender.com"
];

// ✅ SINGLE CORS CONFIG
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Handle preflight
app.options("*", cors());

// middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  connectDb();
  console.log(`Server started on port ${PORT}`);
});
