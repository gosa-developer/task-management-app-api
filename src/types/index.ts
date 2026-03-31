import { Request } from 'express';
// import { Status } from '@prisma/client';

// Define Status type here if not available from Prisma
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE'; // Adjust values as per your schema

export interface JWTPayload {
  userId: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface TaskFilters {
  status?: Status;
  priority?: string;
  categoryId?: number;
  search?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}