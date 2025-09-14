import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  tokenParamSchema,
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ChangePasswordInput,
  TokenParam,
} from '../schemas/authSchemas';
import { validate } from '../middlewares/validationMiddleware';

export class AuthController {
  // @Desc Registration for users
  // @Route POST /api/auths/register
  // @Access Public
  static register = [
    validate(registerSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const userData: RegisterInput = req.body;
       const {token, firstName} = await AuthService.register(userData);
        res.status(201).json({ message: 'User registered successfully',
          token: token,
          firstName: firstName
         });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        const status = message.includes('already exists') ? 400 : 500;
        res.status(status).json({ message });
      }
    }
  ];

  // @Desc Login
  // @Route POST /api/auths/login
  // @Access Public
  static login = [
    validate(loginSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const loginData: LoginInput = req.body;
        const result = await AuthService.login(loginData);
        res.status(200).json(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        const status = message.includes('Invalid credentials') ? 400 : 
                      message.includes('deactivated') ? 403 : 500;
        res.status(status).json({ message });
      }
    }
  ];

  // @Desc Forgot Password
  // @Route POST /api/auths/forgot-password
  // @Access Public
  static forgotPassword = [
    validate(forgotPasswordSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const forgotPasswordData: ForgotPasswordInput = req.body;
        await AuthService.forgotPassword(forgotPasswordData);
        res.status(200).json({ message: 'Reset password link sent' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Password reset failed';
        res.status(500).json({ message });
      }
    }
  ];

  // @Desc Change Password
  // @Route POST /api/auths/change-password/:token
  // @Access Public
  static changePassword = [
    validate(changePasswordSchema),
    validate(tokenParamSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { token }: TokenParam = req.params;
        const changePasswordData: ChangePasswordInput = req.body;
        await AuthService.changePassword(token, changePasswordData);
        res.status(200).json({ message: 'Password changed successfully' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Password change failed';
        const status = message.includes('Invalid or expired token') ? 400 : 500;
        res.status(status).json({ message });
      }
    }
  ];
}

// Export the middleware arrays for use in routes
export const register = AuthController.register;
export const login = AuthController.login;
export const forgotPassword = AuthController.forgotPassword;
export const changePassword = AuthController.changePassword;