import { Request, Response, NextFunction } from 'express';
import PCConfigurationService from '../../services/PCConfigurationService';
import PCConfigurationPDFService from '../../services/PCConfigurationPDFService';
import { mapPCConfigurationToDTO } from '../../models/dto/PCConfigurationDTO';
import OrdersService from '../../services/OrdersService';
import CouponsService from '../../services/CouponsService';

// Extend Request to include user (from auth middleware)
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class PCConfigurationController {
  private configService: PCConfigurationService;
  private pdfService: PCConfigurationPDFService;
  private ordersService: OrdersService;
  private couponsService: CouponsService;

  constructor() {
    this.configService = new PCConfigurationService();
    this.pdfService = new PCConfigurationPDFService();
    this.ordersService = new OrdersService();
    this.couponsService = new CouponsService();
  }

  /**
   * Verify the authenticated user owns the configuration (or is admin)
   */
  private async verifyOwnership(req: AuthRequest, res: Response, configId: string): Promise<boolean> {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return false;
    }
    // Admins can access any configuration
    if (userRole === 'admin') return true;
    const config = await this.configService.getConfigurationById(configId);
    if (!config) {
      res.status(404).json({ success: false, message: 'Configuration not found' });
      return false;
    }
    if (config.userId !== userId) {
      res.status(403).json({ success: false, message: 'You do not own this configuration' });
      return false;
    }
    return true;
  }

  /**
   * GET /api/pc-configurations?status=saved
   * Get all configurations for authenticated user
   */
  getUserConfigurations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const status = req.query.status as any;
      const configurations = await this.configService.getUserConfigurations(userId, status);

      res.status(200).json({
        success: true,
        data: configurations.map(mapPCConfigurationToDTO),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-configurations/:id
   * Get configuration by ID
   */
  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const configuration = await this.configService.getConfigurationById(id);

      if (!configuration) {
        res.status(404).json({
          success: false,
          message: 'Configuration not found',
        });
        return;
      }

      // Verify ownership (allow if user owns it or is admin)
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'admin';
      if (configuration.userId !== userId && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have access to this configuration',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: mapPCConfigurationToDTO(configuration),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations
   * Create new configuration
   */
  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: Login required to save configurations',
        });
        return;
      }

      const { name_en, name_sv } = req.body;
      const configuration = await this.configService.createConfiguration(userId, {
        en: name_en,
        sv: name_sv,
      });

      res.status(201).json({
        success: true,
        message: 'Configuration created successfully',
        data: mapPCConfigurationToDTO(configuration),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/pc-configurations/:id
   * Delete configuration
   */
  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      await this.configService.deleteConfiguration(id, userId);

      res.status(200).json({
        success: true,
        message: 'Configuration deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations/:id/components
   * Add component to configuration
   */
  addComponent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!(await this.verifyOwnership(req, res, id))) return;

      const { componentType, componentId, quantity, slotIndex, slotType } = req.body;

      if (!componentType || !componentId) {
        res.status(400).json({
          success: false,
          message: 'Component type and component ID are required',
        });
        return;
      }

      const configuration = await this.configService.addComponentToConfig(
        id,
        componentType,
        componentId,
        quantity || 1,
        slotIndex,
        slotType
      );

      res.status(200).json({
        success: true,
        message: 'Component added successfully',
        data: mapPCConfigurationToDTO(configuration),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/pc-configurations/:id/components/:type
   * Remove component from configuration
   */
  removeComponent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, type } = req.params;
      if (!(await this.verifyOwnership(req, res, id))) return;

      const slotIndex = req.query.slotIndex ? parseInt(req.query.slotIndex as string) : undefined;

      const configuration = await this.configService.removeComponentFromConfig(id, type, slotIndex);

      res.status(200).json({
        success: true,
        message: 'Component removed successfully',
        data: mapPCConfigurationToDTO(configuration),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations/:id/validate
   * Validate configuration
   */
  validate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!(await this.verifyOwnership(req, res, id))) return;

      const save = req.body?.save === true;
      const validationResult = await this.configService.validateAndSaveConfiguration(id, save);

      res.status(200).json({
        success: true,
        message: validationResult.isValid
          ? 'Configuration is valid'
          : 'Configuration has validation errors',
        data: validationResult,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations/validate-selection
   * Validate if a component can be added to a configuration (pre-add validation)
   */
  validateSelection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { configId, componentType, componentId } = req.body;

      if (!configId || !componentType || !componentId) {
        res.status(400).json({
          success: false,
          message: 'configId, componentType, and componentId are required',
        });
        return;
      }

      const result = await this.configService.validateComponentSelection(
        configId,
        componentType,
        componentId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations/:id/build-service
   * Toggle build service for configuration
   */
  toggleBuildService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!(await this.verifyOwnership(req, res, id))) return;

      const { includesBuildService, buildServiceOptionId } = req.body;

      if (includesBuildService === undefined) {
        res.status(400).json({
          success: false,
          message: 'includesBuildService is required',
        });
        return;
      }

      const configuration = await this.configService.toggleBuildService(
        id,
        includesBuildService,
        buildServiceOptionId
      );

      res.status(200).json({
        success: true,
        message: 'Build service updated successfully',
        data: mapPCConfigurationToDTO(configuration),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-configurations/:id/price
   * Calculate configuration price breakdown
   */
  calculatePrice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!(await this.verifyOwnership(req, res, id))) return;

      const priceBreakdown = await this.configService.calculateConfigurationPrice(id);

      res.status(200).json({
        success: true,
        data: priceBreakdown,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations/:id/duplicate
   * Duplicate configuration
   */
  duplicate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      if (!(await this.verifyOwnership(req, res, id))) return;

      const duplicatedConfig = await this.configService.duplicateConfiguration(id, userId);

      res.status(201).json({
        success: true,
        message: 'Configuration duplicated successfully',
        data: mapPCConfigurationToDTO(duplicatedConfig),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-configurations/stats/summary
   * Get configuration statistics (Admin)
   */
  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.configService.getConfigurationStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations/:id/checkout
   * Checkout PC configuration - creates an order without partial payment
   * PC configurations always use full payment regardless of amount
   */
  checkout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: Login required to checkout',
        });
        return;
      }

      const { id } = req.params;
      const { email, firstName, lastName, address, city, postalCode, country } = req.body;

      // Get and validate configuration
      const configuration = await this.configService.getConfigurationById(id);

      if (!configuration) {
        res.status(404).json({
          success: false,
          message: 'Configuration not found',
        });
        return;
      }

      // Verify ownership
      if (configuration.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have access to this configuration',
        });
        return;
      }

      // Verify configuration is valid
      if (!configuration.isValid) {
        res.status(400).json({
          success: false,
          message: 'Configuration is not valid. Please fix compatibility issues before checkout.',
        });
        return;
      }

      // Verify configuration has components
      const hasComponents = configuration.components &&
        Object.keys(configuration.components).some(key =>
          (configuration.components as any)[key] !== null &&
          (configuration.components as any)[key] !== undefined
        );

      if (!hasComponents) {
        res.status(400).json({
          success: false,
          message: 'Configuration has no components. Please add components before checkout.',
        });
        return;
      }

      // Calculate total price
      const priceBreakdown = await this.configService.calculateConfigurationPrice(id);
      const totalAmount = priceBreakdown.grandTotal;

      // Create order for PC configuration (NO partial payment for PC configs)
      const order = await this.ordersService.createPCConfigurationOrder({
        userId,
        email,
        firstName,
        lastName,
        address,
        city,
        postalCode,
        country,
        pcConfigurationId: id,
        totalAmount,
        currency: priceBreakdown.currency,
        configurationSnapshot: {
          components: configuration.components,
          includesBuildService: configuration.includesBuildService,
          buildServiceCharge: configuration.buildServiceCharge,
          priceBreakdown,
        },
      });

      // Mark configuration as ordered
      await this.configService.convertConfigurationToOrder(id, order.id);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-configurations/:id/pdf
   * Export configuration as PDF
   */
  exportPDF = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const language = (req.query.lang as 'en' | 'sv') || 'en';

      // Get configuration
      const configuration = await this.configService.getConfigurationById(id);

      if (!configuration) {
        res.status(404).json({
          success: false,
          message: 'Configuration not found',
        });
        return;
      }

      // Verify ownership (allow if user owns it or is admin)
      const isAdmin = req.user?.role === 'admin';
      if (configuration.userId !== userId && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have access to this configuration',
        });
        return;
      }

      // Generate PDF
      const pdfBuffer = await this.pdfService.generateConfigurationPDF(configuration, language);

      // Generate filename
      const configName = language === 'en' ? configuration.name_en : configuration.name_sv;
      const displayName = configName || `Configuration-${configuration.id.substring(0, 8)}`;
      const safeFileName = displayName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fileName = `PC-Configuration-${safeFileName}.pdf`;

      // Send PDF as response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  // =====================================================
  // PRE-CONFIGURED PC ENDPOINTS
  // =====================================================

  /**
   * GET /api/pc-configurations/pre-configured (PUBLIC)
   * Get all pre-configured PCs with optional filtering
   */
  getPreConfiguredPCs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tier, minPrice, maxPrice, limit, offset } = req.query;

      const filters: any = {};
      if (tier) filters.tier = tier as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);

      const result = await this.configService.getPreConfiguredPCs(
        filters,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: {
          configurations: result.configurations.map(mapPCConfigurationToDTO),
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-configurations/pre-configured/featured (PUBLIC)
   * Get featured pre-configured PCs for home page
   */
  getFeaturedPCs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const configurations = await this.configService.getFeaturedPCs(limit);

      res.status(200).json({
        success: true,
        data: configurations.map(mapPCConfigurationToDTO),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-configurations/pre-configured/:id (PUBLIC)
   * Get single pre-configured PC by ID
   */
  getPreConfiguredById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const configuration = await this.configService.getPreConfiguredById(id);

      if (!configuration) {
        res.status(404).json({
          success: false,
          message: 'Pre-configured PC not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: mapPCConfigurationToDTO(configuration),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations/pre-configured/:id/order (AUTH)
   * Order a pre-configured PC - creates a copy for the user
   */
  orderPreConfiguredPC = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: Login required to order',
        });
        return;
      }

      const { id } = req.params;
      const userConfig = await this.configService.orderPreConfiguredPC(id, userId);

      res.status(201).json({
        success: true,
        message: 'Pre-configured PC added to your configurations',
        data: mapPCConfigurationToDTO(userConfig),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations/pre-configured/:id/direct-checkout
   * Checkout a pre-configured PC directly (no user copy needed)
   * Supports both authenticated and guest checkout
   */
  directCheckoutPreConfiguredPC = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { email, firstName, lastName, couponCode } = req.body;

      if (!email || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          message: 'email, firstName, and lastName are required',
        });
        return;
      }

      // Get pre-configured PC
      const preConfiguredPC = await this.configService.getPreConfiguredById(id);

      if (!preConfiguredPC) {
        res.status(404).json({
          success: false,
          message: 'Pre-configured PC not found',
        });
        return;
      }

      // Verify it has components
      const hasComponents = preConfiguredPC.components &&
        Object.keys(preConfiguredPC.components).some(key =>
          (preConfiguredPC.components as any)[key] !== null &&
          (preConfiguredPC.components as any)[key] !== undefined
        );

      if (!hasComponents) {
        res.status(400).json({
          success: false,
          message: 'Pre-configured PC has no components',
        });
        return;
      }

      // Calculate total: use discounted price if available, plus build service
      const componentPrice = Number(preConfiguredPC.discountedPrice ?? preConfiguredPC.totalPrice) || 0;
      const buildCharge = preConfiguredPC.includesBuildService ? (Number(preConfiguredPC.buildServiceCharge) || 0) : 0;
      let totalAmount = componentPrice + buildCharge;

      // Validate and apply coupon if provided
      let couponId: string | undefined;
      let validatedCouponCode: string | undefined;
      let discountAmount = 0;

      if (couponCode) {
        const couponResult = await this.couponsService.validateCoupon(
          couponCode, totalAmount, email
        );
        if (!couponResult.valid) {
          res.status(400).json({
            success: false,
            message: couponResult.error || 'Invalid coupon',
          });
          return;
        }
        couponId = couponResult.couponId;
        validatedCouponCode = couponResult.code;
        discountAmount = couponResult.discountAmount || 0;
        totalAmount = Math.max(0, totalAmount - discountAmount);
      }

      // Create order
      const order = await this.ordersService.createPCConfigurationOrder({
        userId: req.user?.id,
        email,
        firstName,
        lastName,
        pcConfigurationId: id,
        totalAmount,
        currency: preConfiguredPC.currency || 'SEK',
        couponId,
        couponCode: validatedCouponCode,
        discountAmount,
        configurationSnapshot: {
          components: preConfiguredPC.components,
          includesBuildService: preConfiguredPC.includesBuildService,
          buildServiceCharge: preConfiguredPC.buildServiceCharge,
          name_en: preConfiguredPC.name_en,
          name_sv: preConfiguredPC.name_sv,
          tier: preConfiguredPC.tier,
        },
      });

      // Increment coupon usage after order creation
      if (couponId) {
        await this.couponsService.incrementUsage(couponId, discountAmount);
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // =====================================================
  // ADMIN PRE-CONFIGURED PC ENDPOINTS
  // =====================================================

  /**
   * GET /api/pc-configurations/admin/all (ADMIN)
   * Get all configurations for admin
   */
  getAllConfigurationsAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, isPreConfigured, limit, offset } = req.query;

      const filters: any = {};
      if (status) filters.status = status as string;
      if (isPreConfigured !== undefined) filters.isPreConfigured = isPreConfigured === 'true';

      const result = await this.configService.getAllConfigurationsAdmin(
        filters,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: {
          configurations: result.configurations.map(mapPCConfigurationToDTO),
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-configurations/admin/pre-configured (ADMIN)
   * Get all pre-configured PCs for admin
   */
  getAdminPreConfiguredPCs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tier, limit, offset } = req.query;

      const filters: any = {};
      if (tier) filters.tier = tier as string;

      const result = await this.configService.getPreConfiguredPCs(
        filters,
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: {
          configurations: result.configurations.map(mapPCConfigurationToDTO),
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations/admin/pre-configured (ADMIN)
   * Create new pre-configured PC
   */
  createPreConfiguredPC = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        name_en,
        name_sv,
        components,
        totalPrice,
        discountedPrice,
        tier,
        imageUrl,
        imageUrls,
        shortDescription_en,
        shortDescription_sv,
        isFeatured,
        displayOrder,
        includesBuildService,
        buildServiceCharge,
      } = req.body;

      if (!name_en || !name_sv || totalPrice === undefined) {
        res.status(400).json({
          success: false,
          message: 'name_en, name_sv, and totalPrice are required',
        });
        return;
      }

      const configuration = await this.configService.createPreConfiguredPC({
        name_en,
        name_sv,
        components: components || {},
        totalPrice,
        discountedPrice,
        tier,
        imageUrl,
        imageUrls,
        shortDescription_en,
        shortDescription_sv,
        isFeatured,
        displayOrder,
        includesBuildService,
        buildServiceCharge,
      });

      res.status(201).json({
        success: true,
        message: 'Pre-configured PC created successfully',
        data: mapPCConfigurationToDTO(configuration),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-configurations/admin/pre-configured/:id/promote (ADMIN)
   * Promote an existing configuration to pre-configured PC
   */
  promoteToPreConfigured = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        name_en,
        name_sv,
        tier,
        imageUrl,
        imageUrls,
        shortDescription_en,
        shortDescription_sv,
        isFeatured,
        displayOrder,
        discountedPrice,
        includesBuildService,
        buildServiceCharge,
        buildServiceSnapshot,
      } = req.body;

      const configuration = await this.configService.promoteToPreConfigured(id, {
        name_en,
        name_sv,
        tier,
        imageUrl,
        imageUrls,
        shortDescription_en,
        shortDescription_sv,
        isFeatured,
        displayOrder,
        discountedPrice,
        includesBuildService,
        buildServiceCharge,
        buildServiceSnapshot,
      });

      res.status(200).json({
        success: true,
        message: 'Configuration promoted to pre-configured PC',
        data: mapPCConfigurationToDTO(configuration),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/pc-configurations/admin/pre-configured/:id (ADMIN)
   * Update pre-configured PC
   */
  updatePreConfiguredPC = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const configuration = await this.configService.updatePreConfiguredPC(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Pre-configured PC updated successfully',
        data: mapPCConfigurationToDTO(configuration),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/pc-configurations/admin/pre-configured/:id/featured (ADMIN)
   * Toggle featured status
   */
  toggleFeatured = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const newStatus = await this.configService.toggleFeaturedStatus(id);

      res.status(200).json({
        success: true,
        message: `Featured status set to ${newStatus}`,
        data: { isFeatured: newStatus },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/pc-configurations/admin/pre-configured/:id (ADMIN)
   * Delete pre-configured PC
   */
  deletePreConfiguredPC = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.configService.deletePreConfiguredPC(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Pre-configured PC not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Pre-configured PC deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-configurations/admin/pre-configured/stats (ADMIN)
   * Get pre-configured PC statistics
   */
  getPreConfiguredStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.configService.getPreConfiguredStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new PCConfigurationController();
