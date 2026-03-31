import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { TaskService } from '../services/task.service';
import type { Status } from '../types';

const taskService = new TaskService();

export class TaskController {
  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.createTask(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, status,  categoryId, search, fromDate, toDate } = req.query;
      
      const filters = {
        status: status ? (status as Status) : undefined,
        
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string,
        fromDate: fromDate ? new Date(fromDate as string) : undefined,
        toDate: toDate ? new Date(toDate as string) : undefined,
      };
      
      const result = await taskService.getTasks(
        req.user!.userId,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.status(200).json({
        success: true,
        data: result.tasks,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTaskById(req.user!.userId, parseInt(req.params.id));
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.updateTask(
        req.user!.userId,
        parseInt(req.params.id),
        req.body
      );
      res.status(200).json({
        success: true,
        data: task,
        message: 'Task updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await taskService.deleteTask(req.user!.userId, parseInt(req.params.id));
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}