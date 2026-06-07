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