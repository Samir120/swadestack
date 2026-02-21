import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface InternalNoteAttributes {
  id: string;
  targetType: 'customer' | 'order';
  targetId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InternalNoteCreationAttributes extends Optional<InternalNoteAttributes, 'id'> {}

class InternalNote extends Model<InternalNoteAttributes, InternalNoteCreationAttributes> implements InternalNoteAttributes {
  public id!: string;
  public targetType!: 'customer' | 'order';
  public targetId!: string;
  public authorId!: string;
  public authorName!: string;
  public content!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InternalNote.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    targetType: {
      type: DataTypes.ENUM('customer', 'order'),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    authorName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'InternalNotes',
    timestamps: true,
    indexes: [
      { fields: ['targetType', 'targetId'] },
      { fields: ['authorId'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default InternalNote;
