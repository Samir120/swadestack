import { Request, Response, NextFunction } from 'express';
import CustomerService from '../../services/CustomerService';
import AuditLogService from '../../services/AuditLogService';
import { AuthEmailService } from '../../services/AuthEmailService';

export class CustomerController {
  private customerService: CustomerService;
  private auditLogService: AuditLogService;
  private authEmailService: AuthEmailService;

  constructor() {
    this.customerService = new CustomerService();
    this.auditLogService = new AuditLogService();
    this.authEmailService = new AuthEmailService();
  }

  private getAdmin(req: Request) {
    const user = (req as any).user;
    return {
      id: user.id,
      name: user.email,
      ip: req.ip || req.socket.remoteAddress,
    };
  }

  // ==================== PART 1 ====================

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, status, sortBy, sortOrder, page, pageSize } = req.query;
      const result = await this.customerService.getCustomers({
        search: search as string,
        status: status as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.customerService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerProfile(id);
      if (!customer) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.updateCustomer(id, req.body);
      if (!customer) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Customer updated successfully', data: customer });
    } catch (error: any) {
      if (error.message === 'Email is already in use by another account') {
        res.status(409).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  exportCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, status } = req.query;
      const csv = await this.customerService.exportCustomersCSV({
        search: search as string,
        status: status as string,
      });
      const date = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="customers-export-${date}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  };

  // ==================== PART 2: Account Actions ====================

  changeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, reason, endDate } = req.body;

      if (!['active', 'suspended', 'deactivated'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status. Must be: active, suspended, or deactivated' });
        return;
      }

      const customer = await this.customerService.changeAccountStatus(id, status, { reason, endDate }, this.getAdmin(req));
      if (!customer) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }
      res.status(200).json({ success: true, message: `Account status changed to ${status}`, data: customer });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.verifyEmail(id, this.getAdmin(req));
      if (!customer) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Email verified successfully', data: customer });
    } catch (error) {
      next(error);
    }
  };

  revokeVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.revokeVerification(id, this.getAdmin(req));
      if (!customer) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Verification revoked', data: customer });
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.customerService.resendVerification(id);
      if (!result) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }
      // TODO: Send actual verification email via email service
      res.status(200).json({ success: true, message: 'Verification email queued' });
    } catch (error: any) {
      if (error.message === 'Email is already verified') {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.customerService.triggerPasswordReset(id);
      if (!result) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }

      try {
        await this.authEmailService.sendPasswordReset({
          email: result.email,
          userName: result.firstName,
          resetToken: result.token,
          language: 'en',
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        res.status(500).json({ success: false, message: 'Failed to send password reset email' });
        return;
      }

      res.status(200).json({ success: true, message: 'Password reset email queued' });
    } catch (error) {
      next(error);
    }
  };

  forceLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.customerService.forceLogout(id, this.getAdmin(req));
      res.status(200).json({ success: true, message: 'All sessions invalidated' });
    } catch (error) {
      next(error);
    }
  };

  deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const anonymize = req.query.anonymize === 'true';
      await this.customerService.deleteCustomer(id, anonymize, this.getAdmin(req));
      const message = anonymize ? 'Account anonymized successfully' : 'Account deleted successfully';
      res.status(200).json({ success: true, message });
    } catch (error: any) {
      if (error.message === 'Customer not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  // ==================== PART 2: Addresses ====================

  getAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const addresses = await this.customerService.getAddresses(id);
      res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      next(error);
    }
  };

  createAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const address = await this.customerService.createAddress(id, req.body, this.getAdmin(req));
      res.status(201).json({ success: true, message: 'Address created', data: address });
    } catch (error) {
      next(error);
    }
  };

  updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, addrId } = req.params;
      const address = await this.customerService.updateAddress(id, addrId, req.body, this.getAdmin(req));
      res.status(200).json({ success: true, message: 'Address updated', data: address });
    } catch (error: any) {
      if (error.message === 'Address not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, addrId } = req.params;
      await this.customerService.deleteAddress(id, addrId, this.getAdmin(req));
      res.status(200).json({ success: true, message: 'Address deleted' });
    } catch (error: any) {
      if (error.message === 'Address not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  setAddressDefault = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, addrId } = req.params;
      await this.customerService.setAddressDefault(id, addrId, this.getAdmin(req));
      res.status(200).json({ success: true, message: 'Default address updated' });
    } catch (error: any) {
      if (error.message === 'Address not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  // ==================== PART 3: Cart ====================

  getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const cart = await this.customerService.getCustomerCart(id);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  };

  clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.customerService.clearCustomerCart(id);
      res.status(200).json({ success: true, message: 'Cart cleared' });
    } catch (error) {
      next(error);
    }
  };

  removeCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, itemId } = req.params;
      await this.customerService.removeCartItem(id, itemId);
      res.status(200).json({ success: true, message: 'Item removed' });
    } catch (error: any) {
      if (error.message === 'Cart not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  sendCartReminder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.customerService.sendCartReminder(id);
      res.status(200).json({ success: true, message: 'Cart reminder email queued' });
    } catch (error: any) {
      if (error.message.includes('already sent') || error.message === 'Cart is empty') {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Customer not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  // ==================== PART 3: Orders ====================

  getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { search, status, dateFrom, dateTo, page, pageSize } = req.query;
      const result = await this.customerService.getCustomerOrders(id, {
        search: search as string,
        status: status as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // ==================== PART 4: Notes ====================

  getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, pageSize } = req.query;
      const result = await this.customerService.getCustomerNotes(
        id,
        page ? parseInt(page as string) : 1,
        pageSize ? parseInt(pageSize as string) : 50,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  createNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        res.status(400).json({ success: false, message: 'Content is required' });
        return;
      }

      const admin = this.getAdmin(req);
      const note = await this.customerService.createCustomerNote(id, content, admin);
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  };

  updateNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { noteId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        res.status(400).json({ success: false, message: 'Content is required' });
        return;
      }

      const admin = this.getAdmin(req);
      const note = await this.customerService.updateCustomerNote(noteId, content, admin.id);
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

  deleteNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { noteId } = req.params;
      const admin = this.getAdmin(req);
      await this.customerService.deleteCustomerNote(noteId, admin.id);
      res.status(200).json({ success: true, message: 'Note deleted' });
    } catch (error: any) {
      if (error.message === 'Note not found' || error.message === 'You can only delete your own notes') {
        res.status(error.message === 'Note not found' ? 404 : 403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  // ==================== PART 4: Activity ====================

  getLoginActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, pageSize } = req.query;
      const result = await this.customerService.getCustomerLoginActivity(
        id,
        page ? parseInt(page as string) : 1,
        pageSize ? parseInt(pageSize as string) : 50,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // ==================== PART 4: Emails ====================

  getEmailHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { page, pageSize } = req.query;
      const result = await this.customerService.getCustomerEmails(
        id,
        page ? parseInt(page as string) : 1,
        pageSize ? parseInt(pageSize as string) : 50,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  sendCustomEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { subject, body, language } = req.body;

      if (!subject || !body) {
        res.status(400).json({ success: false, message: 'Subject and body are required' });
        return;
      }

      const admin = this.getAdmin(req);
      await this.customerService.sendCustomEmail(id, { subject, body, language }, admin);
      res.status(200).json({ success: true, message: 'Email queued successfully' });
    } catch (error: any) {
      if (error.message === 'Customer not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  // ==================== Audit Logs ====================

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { targetType, targetId, page, pageSize } = req.query;

      if (!targetType || !targetId) {
        res.status(400).json({ success: false, message: 'targetType and targetId are required' });
        return;
      }

      const result = await this.auditLogService.getLogsForTarget(
        targetType as string,
        targetId as string,
        page ? parseInt(page as string) : 1,
        pageSize ? parseInt(pageSize as string) : 20
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default new CustomerController();
