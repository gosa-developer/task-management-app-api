import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export class AuthService {
  async register(data: RegisterInput) {
    const validated = registerSchema.parse(data);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }
    
    const hashedPassword = await hashPassword(validated.password);
    
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    
    const token = generateToken({ userId: user.id, email: user.email });
    
    return { user, token };
  }
  
  async login(data: LoginInput) {
    const validated = loginSchema.parse(data);
    
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }
    
    const isValidPassword = await comparePassword(validated.password, user.password);
    
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }
    
    const token = generateToken({ userId: user.id, email: user.email });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }
  
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
            categories: true,
          },
        },
      },
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return user;
  }
}