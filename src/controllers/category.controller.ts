import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { CategoryService } from '../services/category.service';

const categoryService = new CategoryService();

export class CategoryController {
  async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await categoryService.getCategories(
        req.user!.userId,
        parseInt(page as string),
        parseInt(limit as string)
      );
      res.status(200).json({
        success: true,
        data: result.categories,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getCategoryById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getCategoryById(req.user!.userId, parseInt(req.params.id));
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.updateCategory(
        req.user!.userId,
        parseInt(req.params.id),
        req.body
      );
      res.status(200).json({
        success: true,
        data: category,
        message: 'Category updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await categoryService.deleteCategory(req.user!.userId, parseInt(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
