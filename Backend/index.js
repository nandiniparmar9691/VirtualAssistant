
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import connectDb from "./config/db.js";

dotenv.config();

const app = express();

// middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);

// test route (important for checking)
app.get("/", (req, res) => {
    res.send("API is running");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    connectDb();
    console.log(`Server started on port ${PORT}`);
});
