import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

// Cache JWT secret to avoid repeated env access
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    logger.warn("Authentication failed: No token provided", { 
      ip: req.ip, 
      path: req.path 
    });
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    logger.warn("Authentication failed: Invalid auth header format", { 
      ip: req.ip, 
      path: req.path,
      authHeader: authHeader.substring(0, 20) + "..." 
    });
    res.status(401).json({ message: "Invalid auth header format" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    
    logger.debug("Authentication successful", { 
      userId: (payload as any).userId,
      path: req.path 
    });
    
    next();
  } catch (err) {
    logger.warn("Authentication failed: Invalid token", { 
      ip: req.ip, 
      path: req.path,
      error: err instanceof Error ? err.message : "Unknown error"
    });
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};