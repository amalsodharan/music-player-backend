import { Sequelize, Op } from 'sequelize';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';
import musicModel from './modules/musicModel.js';
import userModel from './modules/userModule.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'mysql',
    dialectModule: mysql2,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialectOptions: { decimalNumbers: true },
    logging: false,
  }
);

const Music = musicModel(sequelize, Sequelize);
const User = userModel(sequelize, Sequelize);

const Models = { Music, User, Op };

const connection = {};

export default async function connectDB() {
  if (connection.isConnected) {
    console.log('=> Using existing connection.');
    return Models;
  }

  await sequelize.sync();
  await sequelize.authenticate();
  connection.isConnected = true;
  console.log('=> Created a new connection.');
  return Models;
}
