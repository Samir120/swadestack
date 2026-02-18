import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database';

export interface CompanyLegalSettingsAttributes {
  id: string;

  // Company Identity
  companyName: string;
  tradingName: string | null;
  orgNumber: string;
  vatNumber: string;
  managingDirector: string | null;

  // Contact Info
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  phoneNumber: string;

  // Checkout Consent
  showCheckoutConsent: boolean;
  checkoutConsentText_en: string | null;
  checkoutConsentText_sv: string | null;

  // Footer Legal Notice
  showFooterLegalEntity: boolean;

  // Invoice Disclaimer
  showInvoiceDisclaimer: boolean;
  invoiceDisclaimer_en: string | null;
  invoiceDisclaimer_sv: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

class CompanyLegalSettings extends Model<CompanyLegalSettingsAttributes> implements CompanyLegalSettingsAttributes {
  public id!: string;

  // Company Identity
  public companyName!: string;
  public tradingName!: string | null;
  public orgNumber!: string;
  public vatNumber!: string;
  public managingDirector!: string | null;

  // Contact Info
  public streetAddress!: string;
  public postalCode!: string;
  public city!: string;
  public country!: string;
  public email!: string;
  public phoneNumber!: string;

  // Footer Legal Notice
  public showFooterLegalEntity!: boolean;

  // Checkout Consent
  public showCheckoutConsent!: boolean;
  public checkoutConsentText_en!: string | null;
  public checkoutConsentText_sv!: string | null;

  // Invoice Disclaimer
  public showInvoiceDisclaimer!: boolean;
  public invoiceDisclaimer_en!: string | null;
  public invoiceDisclaimer_sv!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CompanyLegalSettings.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Company Identity
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    tradingName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    orgNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    vatNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    managingDirector: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Contact Info
    streetAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Sweden',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    phoneNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    // Footer Legal Notice
    showFooterLegalEntity: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    // Checkout Consent
    showCheckoutConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    checkoutConsentText_en: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    checkoutConsentText_sv: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Invoice Disclaimer
    showInvoiceDisclaimer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    invoiceDisclaimer_en: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    invoiceDisclaimer_sv: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'CompanyLegalSettings',
    timestamps: true,
  }
);

export default CompanyLegalSettings;
