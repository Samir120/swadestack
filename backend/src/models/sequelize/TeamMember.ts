import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface TeamMemberAttributes {
  id: string;
  name_en: string;
  name_sv: string;
  role_en: string;
  role_sv: string;
  bio_en: string;
  bio_sv: string;
  image_url: string;
  image_file?: string;
  linkedin_url?: string;
  sort_order: number;
  is_active: boolean;
}

interface TeamMemberCreationAttributes extends Optional<TeamMemberAttributes, 'id' | 'is_active' | 'sort_order' | 'linkedin_url' | 'image_file'> {}

class TeamMember extends Model<TeamMemberAttributes, TeamMemberCreationAttributes> implements TeamMemberAttributes {
  public id!: string;
  public name_en!: string;
  public name_sv!: string;
  public role_en!: string;
  public role_sv!: string;
  public bio_en!: string;
  public bio_sv!: string;
  public image_url!: string;
  public image_file?: string;
  public linkedin_url?: string;
  public sort_order!: number;
  public is_active!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TeamMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    bio_en: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bio_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_file: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded image data',
    },
    linkedin_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'TeamMember',
    timestamps: true,
    indexes: [
      { fields: ['is_active'] },
      { fields: ['sort_order'] },
    ],
  }
);

export default TeamMember;
