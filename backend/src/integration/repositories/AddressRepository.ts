import { BaseDAO } from '../dao/BaseDAO';
import Address, { AddressType } from '../../models/sequelize/Address';

export class AddressRepository extends BaseDAO<Address> {
  constructor() {
    super(Address);
  }

  async findByUserId(userId: string): Promise<Address[]> {
    return await this.model.findAll({
      where: { userId } as any,
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  async findByUserIdAndType(userId: string, type: AddressType): Promise<Address[]> {
    return await this.model.findAll({
      where: { userId, type } as any,
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Address | null> {
    return await this.model.findOne({
      where: { id, userId } as any,
    });
  }

  async clearDefaultForType(userId: string, type: AddressType): Promise<void> {
    await this.model.update(
      { isDefault: false } as any,
      { where: { userId, type, isDefault: true } as any }
    );
  }

  async setDefault(id: string, userId: string, type: AddressType): Promise<void> {
    await this.clearDefaultForType(userId, type);
    await this.model.update(
      { isDefault: true } as any,
      { where: { id, userId } as any }
    );
  }

  async deleteByIdAndUser(id: string, userId: string): Promise<number> {
    return await this.model.destroy({
      where: { id, userId } as any,
    });
  }

  async deleteAllByUserId(userId: string): Promise<number> {
    return await this.model.destroy({
      where: { userId } as any,
    });
  }
}

export default AddressRepository;
