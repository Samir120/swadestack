import { Op } from 'sequelize';
import { BaseDAO } from '../dao/BaseDAO';
import RefreshToken from '../../models/sequelize/RefreshToken';

export class RefreshTokenRepository extends BaseDAO<RefreshToken> {
  constructor() {
    super(RefreshToken);
  }

  async findValidByToken(token: string): Promise<RefreshToken | null> {
    return await this.model.findOne({
      where: {
        token,
        isRevoked: false,
        expiresAt: { [Op.gt]: new Date() },
      } as any,
    });
  }

  async revokeToken(token: string): Promise<void> {
    await this.model.update(
      { isRevoked: true } as any,
      { where: { token } as any }
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.model.update(
      { isRevoked: true } as any,
      { where: { userId, isRevoked: false } as any }
    );
  }

  async deleteExpiredTokens(): Promise<number> {
    return await this.model.destroy({
      where: {
        [Op.or]: [
          { isRevoked: true },
          { expiresAt: { [Op.lt]: new Date() } },
        ],
      } as any,
    });
  }
}

export default RefreshTokenRepository;
