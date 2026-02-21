import CartRepository from '../integration/repositories/CartRepository';
import CartItem from '../models/sequelize/CartItem';
import sequelize from '../config/database';

interface SyncServiceItem {
  serviceId: string;
  quantity: number;
  itemData: Record<string, any>;
}

interface SyncPCItem {
  pcConfigurationId: string;
  itemData: Record<string, any>;
}

interface SyncComponentItem {
  pcComponentId: string;
  quantity: number;
  itemData: Record<string, any>;
}

export class CartSyncService {
  private cartRepository: CartRepository;

  constructor() {
    this.cartRepository = new CartRepository();
  }

  /**
   * Sync cart from frontend — atomically replace all items
   */
  async syncCart(
    userId: string,
    items: SyncServiceItem[],
    pcItems: SyncPCItem[],
    componentItems: SyncComponentItem[] = []
  ): Promise<void> {
    await sequelize.transaction(async (t) => {
      // Get or create the cart
      const cart = await this.cartRepository.findOrCreateByUserId(userId);

      // Delete existing items
      await CartItem.destroy({
        where: { cartId: cart.id } as any,
        transaction: t,
      });

      // Insert new service items
      const cartItems = items.map((item) => ({
        cartId: cart.id,
        serviceId: item.serviceId,
        quantity: item.quantity,
        itemData: item.itemData,
      }));

      // Insert new PC items
      const pcCartItems = pcItems.map((item) => ({
        cartId: cart.id,
        pcConfigurationId: item.pcConfigurationId,
        quantity: 1,
        itemData: item.itemData,
      }));

      // Insert new component items
      const componentCartItems = componentItems.map((item) => ({
        cartId: cart.id,
        pcComponentId: item.pcComponentId,
        quantity: item.quantity,
        itemData: item.itemData,
      }));

      const allItems = [...cartItems, ...pcCartItems, ...componentCartItems];
      if (allItems.length > 0) {
        await CartItem.bulkCreate(allItems, { transaction: t });
      }

      // Reset admin flags and touch updatedAt
      cart.forceCleared = false;
      cart.adminModified = false;
      await cart.changed('updatedAt', true);
      await cart.save({ transaction: t });
    });
  }

  /**
   * Get cart with items for a user
   */
  async getCart(userId: string): Promise<{
    items: any[];
    updatedAt: Date | null;
    forceCleared: boolean;
    adminModified: boolean;
  }> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      return { items: [], updatedAt: null, forceCleared: false, adminModified: false };
    }

    // If admin force-cleared, return empty items + the flag
    if (cart.forceCleared) {
      return { items: [], updatedAt: cart.updatedAt, forceCleared: true, adminModified: false };
    }

    const items = (cart as any).items || [];
    return {
      items: items.map((item: any) => ({
        id: item.id,
        serviceId: item.serviceId,
        pcConfigurationId: item.pcConfigurationId,
        pcComponentId: item.pcComponentId,
        quantity: item.quantity,
        itemData: item.itemData,
      })),
      updatedAt: cart.updatedAt,
      forceCleared: false,
      adminModified: cart.adminModified || false,
    };
  }
}

export default CartSyncService;
