import { Request, Response, NextFunction } from 'express';
import CouponsService from '../../services/CouponsService';
import ServicesRepository from '../../integration/repositories/ServicesRepository';
import { CartItemContext } from '../../models/dto/CouponDTO';

export class CouponsController {
  private couponsService: CouponsService;
  private servicesRepository: ServicesRepository;

  constructor() {
    this.couponsService = new CouponsService();
    this.servicesRepository = new ServicesRepository();
  }

  validate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, orderTotal, email, items } = req.body;

      if (!code || !orderTotal || !email) {
        res.status(400).json({ success: false, message: 'Code, orderTotal, and email are required' });
        return;
      }

      // Build cart context from items if provided (enables applicableTo filtering)
      let cartItems: CartItemContext[] | undefined;
      if (items && Array.isArray(items) && items.length > 0) {
        const serviceIds = items.map((i: any) => i.serviceId);
        const services = await this.servicesRepository.findByIds(serviceIds);

        cartItems = services.map(service => {
          const item = items.find((i: any) => i.serviceId === service.id);
          const itemPrice = service.discountPrice != null
            ? parseFloat(service.discountPrice.toString())
            : parseFloat(service.price.toString());
          return {
            serviceId: service.id,
            serviceCategoryId: service.serviceCategoryId,
            quantity: item?.quantity || 1,
            price: itemPrice,
            isGamingPC: false,
          };
        });
      }

      const result = await this.couponsService.validateCoupon(code, parseFloat(orderTotal), email, cartItems);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupons = await this.couponsService.getAll();
      res.status(200).json({ success: true, data: coupons });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const coupon = await this.couponsService.getById(id);

      if (!coupon) {
        res.status(404).json({ success: false, message: 'Coupon not found' });
        return;
      }

      res.status(200).json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupon = await this.couponsService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const coupon = await this.couponsService.update(id, req.body);

      if (!coupon) {
        res.status(404).json({ success: false, message: 'Coupon not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.couponsService.delete(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Coupon not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const coupon = await this.couponsService.toggleActive(id);

      if (!coupon) {
        res.status(404).json({ success: false, message: 'Coupon not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Active status updated',
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new CouponsController();
