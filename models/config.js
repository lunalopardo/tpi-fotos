// import pkg from 'pg';
// const { Pool } = pkg;
// import dotenv from 'dotenv';

// dotenv.config(); 

// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: parseInt(process.env.DB_PORT || '5432', 10),
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     max: 10, 
//     //idleTimeoutMillis: 30000
// });


// pool.query('SELECT NOW()', (err, res) => {
//     if (err) {
//         console.error(' Error al conectar con PostgreSQL:', err.message);
//     } else {
//         console.log('Base de datos conectada con éxito.');
//     }
// });


// export const query = (text, params) => pool.query(text, params);

import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

try {
    await sequelize.authenticate();
    console.log('¡Sequelize se conectó con éxito a PostgreSQL!');
} catch (error) {
    console.error('Error al conectar Sequelize con la BD:', error);
}

export default sequelize;