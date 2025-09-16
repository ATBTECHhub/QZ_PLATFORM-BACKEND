import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  registrationMailTemplate,
  forgotPasswordMailTemplate,
} from '../emails/welcomeEmail';
import { sendMail } from '../utils/sendEmail';
import User from '../models/Users';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ChangePasswordInput,
} from '../schemas/authSchemas';
import settings from '../config/settings';

export class AuthService {
  // User registration
  static async register(userData: RegisterInput): Promise<token, firstName> {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // // Hash Password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // Generate a token with the user's id and role
    const verificationToken = jwt.sign(
      { id: user._id, role: user.role },
      settings.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );
    //Creating a Verification URL based on token Generated
    const verifyUrl = `${settings.FRONTEND_URL}/verify-email/token=${verificationToken}`;

    const firstName = user.name.split(' ')[0];

    // Send registration email
    await sendMail({
      to: user.email,
      subject: 'Welcome to QzPlatform!',
      html: registrationMailTemplate(firstName, user.role),
    });

    return {
      token: verificationToken,
      firstName,
    };
  }

  static async verifyEmail(token: string){
    try{
      //Decode token
      const decoded = jwt.verify(token, settings.JWT_SECRET);

      //Finding user:
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error("User not found");
      }

      //Update Verification Status
      user.isVerified = true;
      user.isActive = true;
      await user.save();

      //Generate login token (for immediate login after verification)
      const loginToken = jwt.sign(
        {id: user._id, role: user.role},
        settings.JWT_SECRET, 
        { expiresIn: '7d'}
      );

      return { loginToken, firstName: user.name.split(" ")[0]};
    } catch (err) {
      throw new Error("Invalid or expired verification link");
    }
  }

  // User login
  static async login(
    loginData: LoginInput
  ): Promise<{ token: string; firstname: string }> {
    const { email, password, role } = loginData;

    // Find the user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    //Check if Email of user is verified 
    if(!user.isVerified){
      throw new Error("Unverified Email. Kindly Verify")
    }

    // Check if the user is active
    if (!user.isActive) {
      throw new Error('You have been deactivated, contact administrator');
    }

    // Compare the entered password with the stored password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate a token with the user's id and role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      settings.JWT_SECRET!,
      {
        expiresIn: '1h',
      }
    );

    return {
      token,
      firstname: user.name.split(' ')[0],
    };
  }

  // Forgot Password
  static async forgotPassword(
    forgotPasswordData: ForgotPasswordInput
  ): Promise<void> {
    const { email } = forgotPasswordData;
    const user = await User.findOne({ email });

    // Always return success for security reasons
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordUrl = `https://qzplatform.vercel.app/change-password/${resetToken}`;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const firstName = user.name.split(' ')[0];

    // Send reset password email
    await sendMail({
      to: user.email,
      subject: 'Password Reset Request - QzPlatform',
      html: forgotPasswordMailTemplate(firstName, resetPasswordUrl),
    });
  }

  // Change Password
  static async changePassword(
    token: string,
    changePasswordData: ChangePasswordInput
  ): Promise<void> {
    const { newPassword, confirmPassword } = changePasswordData;

    // Zod already validates password matching, but we keep it for safety
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Find user by reset token with expiration check
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired token');
    }

    // Update the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }
}
