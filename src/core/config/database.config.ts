import { registerAs } from '@nestjs/config';

/**
 * 数据库配置
 */
export default registerAs('db', () => ({
  type: process.env.DB_TYPE || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'nest_next_app',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
}));
