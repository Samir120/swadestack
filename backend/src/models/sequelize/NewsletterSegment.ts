import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export type SegmentType = 'auto' | 'manual';

export interface NewsletterSegmentAttributes {
  id: string;
  name: string;
  description?: string;
  type: SegmentType;
  rules?: object;
  subscriberCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsletterSegmentCreationAttributes
  extends Optional<NewsletterSegmentAttributes, 'id' | 'subscriberCount' | 'createdAt' | 'updatedAt'> {}

class NewsletterSegment
  extends Model<NewsletterSegmentAttributes, NewsletterSegmentCreationAttributes>
  implements NewsletterSegmentAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public type!: SegmentType;
  public rules?: object;
  public subscriberCount!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsletterSegment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('auto', 'manual'),
      allowNull: false,
    },
    rules: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    subscriberCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'NewsletterSegments',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
    ],
  }
);

export default NewsletterSegment;
