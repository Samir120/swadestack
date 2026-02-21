import { Request, Response, NextFunction } from 'express';
import OrdersService from '../../services/OrdersService';
import KlarnaService from '../../services/KlarnaService';
import PartialPaymentService from '../../services/PartialPaymentService';
import AuditLogService from '../../services/AuditLogService';
import ProductSearchService from '../../services/ProductSearchService';

export class OrdersController {
  private ordersService: OrdersService;
  private klarnaService: KlarnaService;
  private partialPaymentService: PartialPaymentService;
  private auditLogService: AuditLogService;
  private productSearchService: ProductSearchService;

  constructor() {
    this.ordersService = new OrdersService();
    this.klarnaService = new KlarnaService();
    this.partialPaymentService = new PartialPaymentService();
    this.auditLogService = new AuditLogService();
    this.productSearchService = new ProductSearchService();
  }

  private getAdmin(req: Request) {
    const user = (req as any).user;
    return {
      id: user.id,
      name: user.email,
      ip: req.ip || req.socket.remoteAddress,
    };
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

      if (!phase || !['initial', 'final', 'full', 'additional'].includes(phase)) {
        res.status(400).json({
          success: false,
          message: 'Valid phase (initial, final, full, additional) is required',
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
  // ==================== PART 4: Order Admin Detail ====================

  getAdminDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.ordersService.getOrderDetailForAdmin(id);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  // ==================== PART 4: Order Modification ====================

  modifyOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const admin = this.getAdmin(req);
      const order = await this.ordersService.modifyOrder(id, req.body, admin);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Order modified', data: order });
    } catch (error) {
      next(error);
    }
  };

  getAdjustments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const adjustments = await this.ordersService.getOrderAdjustments(id);
      res.status(200).json({ success: true, data: adjustments });
    } catch (error) {
      next(error);
    }
  };

  deleteAdjustment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, adjustmentId } = req.params;
      const admin = this.getAdmin(req);
      await this.ordersService.deleteOrderAdjustment(id, adjustmentId, admin);
      res.status(200).json({ success: true, message: 'Adjustment deleted' });
    } catch (error: any) {
      if (error.message === 'Adjustment not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  // ==================== PART 4: Order Notes ====================

  getOrderNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, pageSize } = req.query;
      const result = await this.ordersService.getOrderNotes(
        id,
        page ? parseInt(page as string) : 1,
        pageSize ? parseInt(pageSize as string) : 50,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  createOrderNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      if (!content || !content.trim()) {
        res.status(400).json({ success: false, message: 'Content is required' });
        return;
      }
      const admin = this.getAdmin(req);
      const note = await this.ordersService.createOrderNote(id, content, admin);
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  };

  updateOrderNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { noteId } = req.params;
      const { content } = req.body;
      if (!content || !content.trim()) {
        res.status(400).json({ success: false, message: 'Content is required' });
        return;
      }
      const admin = this.getAdmin(req);
      const note = await this.ordersService.updateOrderNote(noteId, content, admin.id);
      if (!note) {
        res.status(404).json({ success: false, message: 'Note not found' });
        return;
      }
      res.status(200).json({ success: true, data: note });
    } catch (error: any) {
      if (error.message === 'Note not found' || error.message === 'You can only edit your own notes') {
        res.status(error.message === 'Note not found' ? 404 : 403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  deleteOrderNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { noteId } = req.params;
      const admin = this.getAdmin(req);
      await this.ordersService.deleteOrderNote(noteId, admin.id);
      res.status(200).json({ success: true, message: 'Note deleted' });
    } catch (error: any) {
      if (error.message === 'Note not found' || error.message === 'You can only delete your own notes') {
        res.status(error.message === 'Note not found' ? 404 : 403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  // ==================== PART 4: Order Activity (Audit Logs) ====================

  getOrderActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, pageSize } = req.query;
      const result = await this.auditLogService.getLogsForTarget(
        'Order',
        id,
        page ? parseInt(page as string) : 1,
        pageSize ? parseInt(pageSize as string) : 20,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // ==================== PART 4: Order Emails ====================

  getOrderEmails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, pageSize } = req.query;
      const result = await this.ordersService.getOrderEmails(
        id,
        page ? parseInt(page as string) : 1,
        pageSize ? parseInt(pageSize as string) : 50,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  sendOrderEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { subject, body, language } = req.body;
      if (!subject || !body) {
        res.status(400).json({ success: false, message: 'Subject and body are required' });
        return;
      }
      const admin = this.getAdmin(req);
      await this.ordersService.sendOrderEmail(id, { subject, body, language }, admin);
      res.status(200).json({ success: true, message: 'Email queued successfully' });
    } catch (error: any) {
      if (error.message === 'Order not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };
  // ==================== Catalog Search ====================

  searchCatalog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, category, page, pageSize } = req.query;
      const result = await this.productSearchService.search({
        query: query as string | undefined,
        category: category as string | undefined,
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : 6,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // ==================== Order Lock Override ====================

  overrideLock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const admin = this.getAdmin(req);
      await this.ordersService.overrideOrderLock(id, admin);
      res.status(200).json({ success: true, message: 'Order lock overridden' });
    } catch (error: any) {
      if (error.message === 'Order not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Order is not in a locked status') {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };
}

export default new OrdersController();
