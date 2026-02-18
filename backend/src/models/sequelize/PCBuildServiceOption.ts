import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// Price type enum
export type PriceType = 'fixed' | 'percentage';

// Model attributes interface
export interface PCBuildServiceOptionAttributes {
  id: string;

  // Bilingual service name
  name_en: string;
  name_sv: string;

  // Bilingual description
  desc_en?: string;
  desc_sv?: string;

  // Pricing
  priceType: PriceType; // 'fixed' = flat fee, 'percentage' = % of component total
  amount: number; // Either fixed amount (e.g., 2500 SEK) or percentage (e.g., 10 for 10%)

  // Service details
  estimatedBuildTime_en?: string; // e.g., "3-5 business days"
  estimatedBuildTime_sv?: string; // e.g., "3-5 arbetsdagar"
  warrantyInfo_en?: string;
  warrantyInfo_sv?: string;

  // Status
  isActive: boolean;
  isDefault: boolean; // Only one option should be default (e.g., DIY option)

  createdAt?: Date;
  updatedAt?: Date;
}

// Creation attributes
interface PCBuildServiceOptionCreationAttributes extends Optional<
  PCBuildServiceOptionAttributes,
  'id' | 'desc_en' | 'desc_sv' | 'estimatedBuildTime_en' | 'estimatedBuildTime_sv' |
  'warrantyInfo_en' | 'warrantyInfo_sv' | 'isActive' | 'isDefault' | 'createdAt' | 'updatedAt'
> {}

// Model class
class PCBuildServiceOption extends Model<
  PCBuildServiceOptionAttributes,
  PCBuildServiceOptionCreationAttributes
> implements PCBuildServiceOptionAttributes {

  public id!: string;

  public name_en!: string;
  public name_sv!: string;

  public desc_en?: string;
  public desc_sv?: string;

  public priceType!: PriceType;
  public amount!: number;

  public estimatedBuildTime_en?: string;
  public estimatedBuildTime_sv?: string;
  public warrantyInfo_en?: string;
  public warrantyInfo_sv?: string;

  public isActive!: boolean;
  public isDefault!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to calculate service charge based on component total
  public calculateCharge(componentTotal: number): number {
    // Parse amount as PostgreSQL DECIMAL returns as string
    const amount = typeof this.amount === 'string' ? parseFloat(this.amount) : this.amount;

    if (this.priceType === 'fixed') {
      return amount;
    } else {
      // Percentage-based calculation
      return (componentTotal * amount) / 100;
    }
  }

  // Helper method to get service name in specified language
  public getName(language: 'en' | 'sv' = 'en'): string {
    return language === 'en' ? this.name_en : this.name_sv;
  }

  // Helper method to get description in specified language
  public getDescription(language: 'en' | 'sv' = 'en'): string | undefined {
    return language === 'en' ? this.desc_en : this.desc_sv;
  }

  // Helper method to get build time in specified language
  public getBuildTime(language: 'en' | 'sv' = 'en'): string | undefined {
    return language === 'en' ? this.estimatedBuildTime_en : this.estimatedBuildTime_sv;
  }

  // Helper method to get warranty info in specified language
  public getWarrantyInfo(language: 'en' | 'sv' = 'en'): string | undefined {
    return language === 'en' ? this.warrantyInfo_en : this.warrantyInfo_sv;
  }
}

// Initialize model
PCBuildServiceOption.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Bilingual service name
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
    },
    name_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
    },

    // Bilingual description
    desc_en: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    desc_sv: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Pricing
    priceType: {
      type: DataTypes.ENUM('fixed', 'percentage'),
      allowNull: false,
      validate: {
        isIn: [['fixed', 'percentage']],
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
        validateAmount(value: number) {
          if (this.priceType === 'percentage' && value > 100) {
            throw new Error('Percentage amount cannot exceed 100');
          }
          if (value < 0) {
            throw new Error('Amount must be non-negative');
          }
        },
      },
    },

    // Service details
    estimatedBuildTime_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estimatedBuildTime_sv: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    warrantyInfo_en: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    warrantyInfo_sv: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Status
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'PCBuildServiceOptions',
    timestamps: true,
    indexes: [
      {
        fields: ['isActive'],
      },
      {
        fields: ['isDefault'],
      },
      {
        fields: ['isActive', 'isDefault'],
      },
    ],
  }
);

export default PCBuildServiceOption;
