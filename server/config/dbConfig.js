import { Sequelize } from 'sequelize';
import 'dotenv/config';

const database = new Sequelize(
    process.env.DB,
    process.env.USER,
    process.env.PASSWORD,
    {
        host: process.env.HOST,
        dialect: process.env.DIALECT,
        port: process.env.PORT,
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