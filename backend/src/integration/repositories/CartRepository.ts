import { BaseDAO } from '../dao/BaseDAO';
import Cart from '../../models/sequelize/Cart';
import CartItem from '../../models/sequelize/CartItem';
import Service from '../../models/sequelize/Service';
import ServiceCategory from '../../models/sequelize/ServiceCategory';
import PCConfiguration from '../../models/sequelize/PCConfiguration';

export class CartRepository extends BaseDAO<Cart> {
  constructor() {
    super(Cart);
  }

  /**
   * Find cart by user ID with items eager-loaded
   */
  async findByUserId(userId: string): Promise<Cart | null> {
    return await this.model.findOne({
      where: { userId } as any,
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Service,
              as: 'service',
              include: [
                {
                  model: ServiceCategory,
                  as: 'serviceCategory',
                },
              ],
            },
            {
              model: PCConfiguration,
              as: 'pcConfiguration',
            },
          ],
        },
      ],
    });
  }

  /**
   * Find or create cart for a user
   */
  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const [cart] = await this.findOrCreate(
      { userId } as any,
      { userId }
    );
    return cart;
  }

  /**
   * Clear all items from a user's cart and set forceCleared flag
   * Keeps the cart row so the frontend can detect the admin clear on next fetch
   */
  async clearCart(userId: string): Promise<void> {
    const cart = await this.model.findOne({ where: { userId } as any });
    if (!cart) return;

    await CartItem.destroy({ where: { cartId: cart.id } as any });
    await cart.update({ forceCleared: true } as any);
  }

  /**
   * Remove a single item from a cart and flag as admin-modified
   */
  async removeItem(cartId: string, itemId: string): Promise<void> {
    await CartItem.destroy({
      where: { id: itemId, cartId } as any,
    });
    await this.model.update(
      { adminModified: true } as any,
      { where: { id: cartId } as any }
    );
  }

  /**
   * Update lastReminderSentAt on a cart
   */
  async updateReminderSent(cartId: string): Promise<void> {
    await this.model.update(
      { lastReminderSentAt: new Date() } as any,
      { where: { id: cartId } as any }
    );
  }
}

export default CartRepository;
