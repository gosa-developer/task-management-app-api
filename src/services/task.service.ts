import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';
import { TaskFilters } from '../types';
import { z } from 'zod';

// Validation Schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().optional(),
  categoryId: z.number().int().positive().optional(),
});

const updateTaskSchema = createTaskSchema.partial();

export class TaskService {
  
  // ✅ CREATE TASK
  async createTask(userId: number, data: any) {
    const validated = createTaskSchema.parse(data);

    // Verify category belongs to user
    if (validated.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validated.categoryId,
          userId,
        },
      });

      if (!category) {
        throw new AppError('Category not found or does not belong to user', 404);
      }
    }

    const task = await prisma.task.create({
      data: {
        ...validated,
        userId,
        dueDate: validated.dueDate
          ? new Date(validated.dueDate)
          : undefined,
      },
      include: {
        category: true,
      },
    });

    return task;
  }

  // ✅ GET TASKS (WITH FILTER + PAGINATION)
  async getTasks(
    userId: number,
    filters: TaskFilters,
    page: number = 1,
    limit: number = 10
  ) {
    const {
      skip,
      take,
      page: currentPage,
      limit: currentLimit,
    } = getPaginationParams(page, limit);

    const where: any = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.fromDate || filters.toDate) {
      where.dueDate = {};
      if (filters.fromDate) where.dueDate.gte = filters.fromDate;
      if (filters.toDate) where.dueDate.lte = filters.toDate;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
        },
      }),
      prisma.task.count({ where }),
    ]);

    const meta = getPaginationMeta(total, currentPage, currentLimit);

    return { tasks, meta };
  }

  // ✅ GET SINGLE TASK
  async getTaskById(userId: number, taskId: number) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  // ✅ UPDATE TASK (FIXED ERROR HERE)
  async updateTask(userId: number, taskId: number, data: any) {
    const validated = updateTaskSchema.parse(data);

    // ✅ FIX: removed unused variable
    await this.getTaskById(userId, taskId);

    // Verify category if updating
    if (validated.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validated.categoryId,
          userId,
        },
      });

      if (!category) {
        throw new AppError(
          'Category not found or does not belong to user',
          404
        );
      }
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...validated,
        dueDate: validated.dueDate
          ? new Date(validated.dueDate)
          : undefined,
      },
      include: {
        category: true,
      },
    });

    return task;
  }

  // ✅ DELETE TASK
  async deleteTask(userId: number, taskId: number) {
    await this.getTaskById(userId, taskId);

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }
}