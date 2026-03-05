import { Request, Response, NextFunction } from 'express';
import TwoFactorService from '../../services/TwoFactorService';

export class TwoFactorController {
  private twoFactorService: TwoFactorService;

  constructor() {
    this.twoFactorService = new TwoFactorService();
  }

  setup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const result = await this.twoFactorService.generateSetup(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'Two-factor authentication is already enabled') {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ success: false, message: 'Verification code is required' });
        return;
      }

      const result = await this.twoFactorService.verifyAndEnable(userId, token);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }

      res.status(200).json({ success: true, message: 'Two-factor authentication enabled' });
    } catch (error) {
      next(error);
    }
  };

  disable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ success: false, message: 'Password is required' });
        return;
      }

      const result = await this.twoFactorService.disable(userId, password);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.error });
        return;
      }

      res.status(200).json({ success: true, message: 'Two-factor authentication disabled' });
    } catch (error) {
      next(error);
    }
  };

  status = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const result = await this.twoFactorService.getStatus(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default new TwoFactorController();
