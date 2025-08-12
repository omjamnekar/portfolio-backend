import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid auth header format" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
