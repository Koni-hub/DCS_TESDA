import { Sequelize } from 'sequelize';
import 'dotenv/config';

const database = new Sequelize(
    process.env.DB,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
        dialectOptions: {
            connectTimeout: 60000,
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

export default database;