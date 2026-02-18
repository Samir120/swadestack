import { Request, Response } from 'express';
import UserProfileService from '../../services/UserProfileService';
import UserOrdersService from '../../services/UserOrdersService';
import InvoiceService from '../../services/InvoiceService';
/**
 * User Dashboard Controller
 * Handles all user dashboard operations
 */
export class UserDashboardController {
  private profileService: UserProfileService;
  private ordersService: UserOrdersService;
  private invoiceService: InvoiceService;

  constructor() {
    this.profileService = new UserProfileService();
    this.ordersService = new UserOrdersService();
    this.invoiceService = new InvoiceService();
  }

  // ==================== Profile Endpoints ====================

  /**
   * GET /api/user/profile
   * Get current user profile
   */
  getProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const profile = await this.profileService.getUserProfile(userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch profile',
      });
    }
  };

  /**
   * PUT /api/user/profile
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const profile = await this.profileService.updateProfile(userId, req.body);

      res.json({
        success: true,
        data: profile,
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  };

  /**
   * PUT /api/user/email
   * Update user email
   */
  updateEmail = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { newEmail, currentPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!newEmail || !currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email and current password are required',
        });
      }

      const profile = await this.profileService.updateEmail(
        userId,
        newEmail,
        currentPassword
      );

      res.json({
        success: true,
        data: profile,
        message: 'Email updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update email',
      });
    }
  };

  /**
   * PUT /api/user/password
   * Change user password
   */
  changePassword = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        });
      }

      const result = await this.profileService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to change password',
      });
    }
  };

  /**
   * POST /api/user/avatar
   * Upload/update avatar
   */
  updateAvatar = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Avatar file is required',
        });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      const profile = await this.profileService.updateAvatar(userId, avatarUrl);

      res.json({
        success: true,
        data: profile,
        message: 'Avatar updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update avatar',
      });
    }
  };

  // ==================== Orders Endpoints ====================

  /**
   * GET /api/user/orders
   * Get user's orders
   */
  getOrders = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { status, page = 1, limit = 20 } = req.query;

      const result = await this.ordersService.getUserOrders(userId, {
        status: status as string,
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
      });

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch orders',
      });
    }
  };

  /**
   * GET /api/user/orders/:id
   * Get specific order details
   */
  getOrder = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const order = await this.ordersService.getOrderById(userId, id);

      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Order not found',
      });
    }
  };

  /**
   * GET /api/user/orders/number/:orderNumber
   * Get order by order number
   */
  getOrderByNumber = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { orderNumber } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const order = await this.ordersService.getOrderByNumber(userId, orderNumber);

      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Order not found',
      });
    }
  };

  /**
   * GET /api/user/statistics
   * Get user order statistics
   */
  getStatistics = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const stats = await this.ordersService.getOrderStatistics(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch statistics',
      });
    }
  };

  /**
   * POST /api/user/orders/:id/cancel
   * Cancel an order
   */
  cancelOrder = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const order = await this.ordersService.cancelOrder(userId, id);

      res.json({
        success: true,
        data: order,
        message: 'Order cancelled successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel order',
      });
    }
  };

  // ==================== Invoice Endpoints ====================

  /**
   * GET /api/user/invoices
   * Get list of user invoices
   */
  getInvoices = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { page = 1, limit = 20 } = req.query;

      const invoices = await this.invoiceService.getUserInvoices(userId, {
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
      });

      res.json({
        success: true,
        data: invoices,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch invoices',
      });
    }
  };

  /**
   * GET /api/user/invoices/:orderId
   * Get invoice data for an order
   */
  getInvoice = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { orderId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const invoice = await this.invoiceService.getInvoiceData(userId, orderId);

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Invoice not found',
      });
    }
  };

  /**
   * GET /api/user/invoices/:orderId/download
   * Download invoice as PDF
   */
  downloadInvoice = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { orderId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Get invoice data to get the invoice number for filename
      const invoice = await this.invoiceService.getInvoiceData(userId, orderId);
      const pdfBuffer = await this.invoiceService.generateInvoicePDF(userId, orderId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${invoice.invoiceNumber}.pdf`
      );
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to generate invoice',
      });
    }
  };
}

export default UserDashboardController;
