import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';
import bcrypt from 'bcrypt';

// Account status type
export type AccountStatus = 'active' | 'suspended' | 'deactivated';

// User attributes interface
export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  userType: 'personal' | 'company';
  accountStatus: AccountStatus;
  suspensionReason?: string | null;
  suspensionEndDate?: Date | null;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  company?: string;
  organizationNumber?: string;
  vatNumber?: string;
  lastLoginAt?: Date | null;
  lastLoginIp?: string | null;
  lastLoginUserAgent?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'accountStatus' | 'suspensionReason' | 'suspensionEndDate' | 'isEmailVerified' | 'emailVerificationToken' | 'emailVerificationExpires' | 'resetPasswordToken' | 'resetPasswordExpires' | 'lastLoginAt' | 'lastLoginIp' | 'lastLoginUserAgent'> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public role!: 'admin' | 'user';
  public userType!: 'personal' | 'company';
  public accountStatus!: AccountStatus;
  public suspensionReason?: string | null;
  public suspensionEndDate?: Date | null;
  public isEmailVerified!: boolean;
  public emailVerificationToken?: string | null;
  public emailVerificationExpires?: Date | null;
  public resetPasswordToken?: string | null;
  public resetPasswordExpires?: Date | null;
  public phone?: string;
  public address?: string;
  public city?: string;
  public postalCode?: string;
  public country?: string;
  public avatarUrl?: string;
  public dateOfBirth?: Date;
  public company?: string;
  public organizationNumber?: string;
  public vatNumber?: string;
  public lastLoginAt?: Date | null;
  public lastLoginIp?: string | null;
  public lastLoginUserAgent?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public toJSON(): Omit<UserAttributes, 'password'> {
    const { password, ...values } = this.get();
    return values;
  }
}

// Initialize model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
    },
    userType: {
      type: DataTypes.ENUM('personal', 'company'),
      allowNull: false,
      defaultValue: 'personal',
    },
    accountStatus: {
      type: DataTypes.ENUM('active', 'suspended', 'deactivated'),
      allowNull: false,
      defaultValue: 'active',
    },
    suspensionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    suspensionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Sweden',
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    organizationNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    vatNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLoginIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    lastLoginUserAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'Users',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
