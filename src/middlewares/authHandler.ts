import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/Users'; // Import User model
import { IUser } from '../types';
import { CustomjwtPayload } from '../types/index';

// Token verification middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    res.status(401).json({ message: 'Token is required' });
    return;
  }

  try {
    // Verify the token with type assertion
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;

    // Fetch the full user details from the database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Attach the user object to the request
    req.user = user;

    // Proceed to the next middleware
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Role-based access control
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res
        .status(403)
        .json({ message: 'You do not have permission to perform this action' });
      return;
    }
    next();
  };
};
