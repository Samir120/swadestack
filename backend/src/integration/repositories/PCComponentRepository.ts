import { BaseDAO } from '../dao/BaseDAO';
import { Op } from 'sequelize';
import PCComponent, { ComponentType } from '../../models/sequelize/PCComponent';

export class PCComponentRepository extends BaseDAO<PCComponent> {
  constructor() {
    super(PCComponent);
  }

  /**
   * Find components by type with optional filters
   */
  async findByType(
    componentType: ComponentType,
    filters?: {
      isActive?: boolean;
      manufacturer?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Promise<PCComponent[]> {
    const where: any = { componentType };

    if (filters) {
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
      if (filters.manufacturer) {
        where.manufacturer = filters.manufacturer;
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price[Op.gte] = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price[Op.lte] = filters.maxPrice;
        }
      }
    }

    return await this.model.findAll({
      where,
      order: [
        ['manufacturer', 'ASC'],
        ['price', 'ASC'],
      ],
    });
  }

  /**
   * Find components by type with pagination
   */
  async findByTypeWithPagination(
    componentType: ComponentType,
    limit: number = 50,
    offset: number = 0,
    filters?: {
      isActive?: boolean;
      manufacturer?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Promise<{ components: PCComponent[]; total: number }> {
    const where: any = { componentType };

    if (filters) {
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
      if (filters.manufacturer) {
        where.manufacturer = filters.manufacturer;
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price[Op.gte] = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price[Op.lte] = filters.maxPrice;
        }
      }
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      order: [
        ['manufacturer', 'ASC'],
        ['price', 'ASC'],
      ],
      limit,
      offset,
    });

    return { components: rows, total: count };
  }

  /**
   * Search components by query string (name, manufacturer, model number)
   */
  async searchComponents(
    query: string,
    filters?: {
      componentType?: ComponentType;
      isActive?: boolean;
      limit?: number;
    }
  ): Promise<PCComponent[]> {
    const where: any = {
      [Op.or]: [
        { name_en: { [Op.iLike]: `%${query}%` } },
        { name_sv: { [Op.iLike]: `%${query}%` } },
        { manufacturer: { [Op.iLike]: `%${query}%` } },
        { modelNumber: { [Op.iLike]: `%${query}%` } },
      ],
    };

    if (filters) {
      if (filters.componentType) {
        where.componentType = filters.componentType;
      }
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
    }

    return await this.model.findAll({
      where,
      order: [['manufacturer', 'ASC'], ['price', 'ASC']],
      limit: filters?.limit || 50,
    });
  }

  /**
   * Find components by IDs (bulk fetch)
   */
  async getBulkByIds(componentIds: string[]): Promise<PCComponent[]> {
    return await this.model.findAll({
      where: {
        id: componentIds,
      },
    });
  }

  /**
   * Find active components by IDs
   */
  async getActiveBulkByIds(componentIds: string[]): Promise<PCComponent[]> {
    return await this.model.findAll({
      where: {
        id: componentIds,
        isActive: true,
      },
    });
  }

  /**
   * Get all manufacturers for a component type
   */
  async getManufacturers(componentType?: ComponentType): Promise<string[]> {
    const where: any = { isActive: true };
    if (componentType) {
      where.componentType = componentType;
    }

    const components = await this.model.findAll({
      attributes: ['manufacturer'],
      where,
      group: ['manufacturer'],
      order: [['manufacturer', 'ASC']],
    });

    return components.map((c) => c.manufacturer);
  }

  /**
   * Update component stock
   */
  async updateStock(componentId: string, quantity: number): Promise<void> {
    await this.model.update({ stock: quantity }, { where: { id: componentId } });
  }

  /**
   * Increment stock
   */
  async incrementStock(componentId: string, quantity: number): Promise<void> {
    const component = await this.findById(componentId);
    if (component) {
      component.stock += quantity;
      await component.save();
    }
  }

  /**
   * Decrement stock
   */
  async decrementStock(componentId: string, quantity: number): Promise<boolean> {
    const component = await this.findById(componentId);
    if (!component || component.stock < quantity) {
      return false; // Insufficient stock
    }

    component.stock -= quantity;
    await component.save();
    return true;
  }

  /**
   * Find components with low stock
   */
  async findLowStock(threshold: number = 5): Promise<PCComponent[]> {
    return await this.model.findAll({
      where: {
        stock: { [Op.lte]: threshold },
        isActive: true,
      },
      order: [['stock', 'ASC']],
    });
  }

  /**
   * Find components compatible with specifications
   * (For suggesting alternatives based on specific specs)
   */
  async findCompatible(
    componentType: ComponentType,
    specificationKey: string,
    specificationValue: any,
    limit: number = 10
  ): Promise<PCComponent[]> {
    // This is a simplified version - more complex queries may need raw SQL
    // For now, we'll fetch all of type and filter in-memory
    const components = await this.findByType(componentType, { isActive: true });

    return components
      .filter((component) => {
        const spec = component.specifications as any;
        return spec[specificationKey] === specificationValue;
      })
      .slice(0, limit);
  }

  /**
   * Find active components with pagination and optional type/filters
   */
  async findActiveWithPagination(
    limit: number = 50,
    offset: number = 0,
    componentType?: ComponentType,
    filters?: {
      manufacturer?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Promise<{ components: PCComponent[]; total: number }> {
    const where: any = { isActive: true };
    if (componentType) {
      where.componentType = componentType;
    }
    if (filters) {
      if (filters.manufacturer) {
        where.manufacturer = filters.manufacturer;
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price[Op.gte] = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price[Op.lte] = filters.maxPrice;
        }
      }
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      order: [
        ['componentType', 'ASC'],
        ['manufacturer', 'ASC'],
        ['price', 'ASC'],
      ],
      limit,
      offset,
    });

    return { components: rows, total: count };
  }

  /**
   * Find all components regardless of isActive status (Admin)
   */
  async findAllComponents(
    limit: number = 50,
    offset: number = 0,
    componentType?: ComponentType
  ): Promise<{ components: PCComponent[]; total: number }> {
    const where: any = {};
    if (componentType) {
      where.componentType = componentType;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      order: [
        ['componentType', 'ASC'],
        ['manufacturer', 'ASC'],
        ['price', 'ASC'],
      ],
      limit,
      offset,
    });

    return { components: rows, total: count };
  }

  /**
   * Toggle component active status
   */
  async toggleActive(id: string): Promise<PCComponent | null> {
    const component = await this.findById(id);
    if (!component) return null;

    component.isActive = !component.isActive;
    await component.save();
    return component;
  }

  /**
   * Update component price
   */
  async updatePrice(id: string, price: number): Promise<void> {
    await this.model.update({ price }, { where: { id } });
  }

  /**
   * Get component count by type
   */
  async getCountByType(componentType: ComponentType, isActive?: boolean): Promise<number> {
    const where: any = { componentType };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return await this.count(where);
  }
}

export default PCComponentRepository;
