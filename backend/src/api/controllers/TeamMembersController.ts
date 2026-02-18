import { Request, Response, NextFunction } from 'express';
import TeamMembersService from '../../services/TeamMembersService';

export class TeamMembersController {
  private teamMembersService: TeamMembersService;

  constructor() {
    this.teamMembersService = new TeamMembersService();
  }

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await this.teamMembersService.getActiveMembers(page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await this.teamMembersService.getAllMembers(page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const member = await this.teamMembersService.getMemberById(id);

      if (!member) {
        res.status(404).json({
          success: false,
          message: 'Team member not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      if (req.file) {
        data.image_url = `/uploads/${req.file.filename}`;
        data.image_file = `/uploads/${req.file.filename}`;
      }
      if (typeof data.is_active === 'string') data.is_active = data.is_active === 'true';
      if (typeof data.sort_order === 'string') data.sort_order = parseInt(data.sort_order, 10);
      const member = await this.teamMembersService.createMember(data);

      res.status(201).json({
        success: true,
        message: 'Team member created successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      if (req.file) {
        data.image_url = `/uploads/${req.file.filename}`;
        data.image_file = `/uploads/${req.file.filename}`;
      }
      if (typeof data.is_active === 'string') data.is_active = data.is_active === 'true';
      if (typeof data.sort_order === 'string') data.sort_order = parseInt(data.sort_order, 10);
      const member = await this.teamMembersService.updateMember(id, data);

      if (!member) {
        res.status(404).json({
          success: false,
          message: 'Team member not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Team member updated successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.teamMembersService.deleteMember(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Team member not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Team member deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const member = await this.teamMembersService.toggleActive(id);

      if (!member) {
        res.status(404).json({
          success: false,
          message: 'Team member not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Team member status updated',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new TeamMembersController();
