import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomJwtPayload } from '../types/index';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get token from header
  const token = req.header('Authorization');

  // Check if token doesn't exist
  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token.replace('Bearer ', ''), // Remove 'Bearer ' prefix if present
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;

    // Add userId to request object
    req.userId = decoded.userId;

    // Proceed to next middleware
    next();
  } catch (err) {
    // Handle different error types
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
    } else if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(401).json({ message: 'Token is not valid' });
    }
  }
};

export default authenticateToken;
