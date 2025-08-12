// server.ts
import express from "express";
import dotenv from "dotenv";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(express.json());

// Public route to get a test token
app.get("/token", (_, res) => {
  const token = jwt.sign({ userId: "123" }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// Protected route
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authorized", user: (req as any).user });
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
