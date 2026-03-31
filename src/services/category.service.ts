import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

const updateCategorySchema = createCategorySchema.partial();

export class CategoryService {
  async createCategory(userId: number, data: any) {
    const validated = createCategorySchema.parse(data);
    
    try {
      const category = await prisma.category.create({
        data: {
          ...validated,
          userId,
        },
      });
      return category;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Category with this name already exists', 409);
      }
      throw error;
    }
  }
  
  async getCategories(userId: number, page: number = 1, limit: number = 10) {
    const { skip, take, page: currentPage, limit: currentLimit } = getPaginationParams(page, limit);
    
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      }),
      prisma.category.count({ where: { userId } }),
    ]);
    
    const meta = getPaginationMeta(total, currentPage, currentLimit);
    
    return { categories, meta };
  }
  
  async getCategoryById(userId: number, categoryId: number) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
    
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    
    return category;
  }
  
  async updateCategory(userId: number, categoryId: number, data: any) {
    const validated = updateCategorySchema.parse(data);
    
    await this.getCategoryById(userId, categoryId);
    
    try {
      const category = await prisma.category.update({
        where: { id: categoryId },
        data: validated,
      });
      return category;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Category with this name already exists', 409);
      }
      throw error;
    }
  }
  
  async deleteCategory(userId: number, categoryId: number) {
    const category = await this.getCategoryById(userId, categoryId);
    
    // Check if category has tasks
    if (category._count.tasks > 0) {
      throw new AppError('Cannot delete category with existing tasks. Reassign or delete tasks first.', 400);
    }
    
    await prisma.category.delete({
      where: { id: categoryId },
    });
    
    return { message: 'Category deleted successfully' };
  }
}