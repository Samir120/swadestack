import { Sequelize } from 'sequelize';
import { config } from './environment';

export const sequelize = new Sequelize({
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  dialect: 'postgres',
  logging: config.env === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Only auto-sync schema in development — use migrations in production
    if (config.env === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized (dev mode)');
    }
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

export default sequelize;
