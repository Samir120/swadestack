import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export interface ContactMessageAttributes {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  language: 'en' | 'sv';
  status: 'new' | 'read' | 'replied' | 'archived';
  isRead: boolean;
  adminNotes?: string;
  repliedAt?: Date;
  repliedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContactMessageCreationAttributes
  extends Optional<ContactMessageAttributes, 'id' | 'status' | 'isRead' | 'createdAt' | 'updatedAt'> {}

class ContactMessage
  extends Model<ContactMessageAttributes, ContactMessageCreationAttributes>
  implements ContactMessageAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public phone?: string;
  public subject!: string;
  public message!: string;
  public language!: 'en' | 'sv';
  public status!: 'new' | 'read' | 'replied' | 'archived';
  public isRead!: boolean;
  public adminNotes?: string;
  public repliedAt?: Date;
  public repliedBy?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ContactMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    language: {
      type: DataTypes.ENUM('en', 'sv'),
      allowNull: false,
      defaultValue: 'en',
    },
    status: {
      type: DataTypes.ENUM('new', 'read', 'replied', 'archived'),
      allowNull: false,
      defaultValue: 'new',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    repliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    repliedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'ContactMessages',
    timestamps: true,
    indexes: [
      {
        fields: ['status'],
      },
      {
        fields: ['isRead'],
      },
      {
        fields: ['email'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['repliedBy'],
      },
    ],
  }
);

export default ContactMessage;
