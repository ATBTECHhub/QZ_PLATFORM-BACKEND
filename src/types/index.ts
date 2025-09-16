import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'testCreator' | 'testTaker';
  isActive: boolean;
  isVerified: boolean;
  createdBy?: mongoose.Types.ObjectId;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser & Document;
    }
  }
}

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export interface CustomJwtPayload extends JwtPayload {
  userId: string;
}


export interface tokenResponse {
  accessToken: string,
  refreshToken: string,
  firstName: string,
  expiresIn: string

}
}