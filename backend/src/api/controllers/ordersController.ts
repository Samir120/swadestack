import { Request, Response, NextFunction } from 'express';
import OrdersService from '../../services/OrdersService';
import KlarnaService from '../../services/KlarnaService';
import PartialPaymentService from '../../services/PartialPaymentService';

export class OrdersController {
  private ordersService: OrdersService;
  private klarnaService: KlarnaService;
  private partialPaymentService: PartialPaymentService;

  constructor() {
    this.ordersService = new OrdersService();
    this.klarnaService = new KlarnaService();
    this.partialPaymentService = new PartialPaymentService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.ordersService.createOrder(req.body);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.ordersService.getOrderById(id);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  getByNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderNumber } = req.params;
      const order = await this.ordersService.getOrderByNumber(orderNumber);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status as any;

      const result = await this.ordersService.getAllOrders(page, limit, status);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.ordersService.updateOrderStatus(id, req.body);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Order status updated',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.ordersService.cancelOrder(id);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Order cancelled',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.ordersService.getStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get payment status and summary for an order
   * GET /api/orders/:id/payment-status
   */
  getPaymentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const summary = await this.partialPaymentService.getPaymentSummary(id);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark order ready for final payment (Admin only)
   * POST /api/orders/:id/mark-ready-final-payment
   */
  markReadyForFinalPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).user?.id;

      if (!adminUserId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const order = await this.ordersService.markOrderReadyForFinalPayment(id, adminUserId);

      res.status(200).json({
        success: true,
        message: 'Order marked ready for final payment',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create Klarna checkout session for an order
   * POST /api/orders/:id/klarna-checkout
   */
  createKlarnaCheckout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { phase } = req.body;

      if (!phase || !['initial', 'final', 'full'].includes(phase)) {
        res.status(400).json({
          success: false,
          message: 'Valid phase (initial, final, full) is required',
        });
        return;
      }

      const result = await this.klarnaService.createCheckoutOrder(id, phase);

      res.status(200).json({
        success: true,
        data: {
          htmlSnippet: result.htmlSnippet,
          klarnaOrderId: result.klarnaOrderId,
          paymentId: result.paymentId,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle Klarna push notification (webhook)
   * POST /api/orders/klarna/push
   * Note: This endpoint is called by Klarna, no authentication required
   */
  handleKlarnaPush = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get parameters from query string (set in merchant_urls.push)
      const orderId = req.query.order_id as string;
      const phase = req.query.phase as 'initial' | 'final' | 'full';
      const paymentId = req.query.payment_id as string | undefined;

      // Get Klarna order ID from request body
      const { order_id: klarnaOrderId } = req.body;

      if (!klarnaOrderId) {
        res.status(400).json({
          success: false,
          message: 'Missing Klarna order ID',
        });
        return;
      }

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Missing order ID in query parameters',
        });
        return;
      }

      await this.klarnaService.handlePushNotification(
        klarnaOrderId,
        orderId,
        phase,
        paymentId
      );

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Klarna push notification error:', error);
      // Return 200 to prevent Klarna from retrying
      res.status(200).json({ received: true, error: 'Processing failed' });
    }
  };

  /**
   * Get Klarna confirmation snippet for an order
   * GET /api/orders/:id/klarna-confirmation
   */
  getKlarnaConfirmation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await this.klarnaService.getConfirmationSnippet(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create refund for a Klarna order
   * POST /api/orders/:id/refund
   */
  createRefund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { klarnaOrderId, amount } = req.body;

      if (!klarnaOrderId) {
        res.status(400).json({
          success: false,
          message: 'Klarna order ID is required',
        });
        return;
      }

      await this.klarnaService.createRefund(klarnaOrderId, amount);

      res.status(200).json({
        success: true,
        message: 'Refund created successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new OrdersController();
