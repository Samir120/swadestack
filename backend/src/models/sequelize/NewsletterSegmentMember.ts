import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export interface NewsletterSegmentMemberAttributes {
  id: string;
  segmentId: string;
  subscriberId: string;
  addedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsletterSegmentMemberCreationAttributes
  extends Optional<NewsletterSegmentMemberAttributes, 'id' | 'addedAt' | 'createdAt' | 'updatedAt'> {}

class NewsletterSegmentMember
  extends Model<NewsletterSegmentMemberAttributes, NewsletterSegmentMemberCreationAttributes>
  implements NewsletterSegmentMemberAttributes {
  public id!: string;
  public segmentId!: string;
  public subscriberId!: string;
  public addedAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsletterSegmentMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    segmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'NewsletterSegments',
        key: 'id',
      },
    },
    subscriberId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'NewsletterSubscribers',
        key: 'id',
      },
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'NewsletterSegmentMembers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['segmentId', 'subscriberId'],
      },
      {
        fields: ['segmentId'],
      },
      {
        fields: ['subscriberId'],
      },
    ],
  }
);

export default NewsletterSegmentMember;
