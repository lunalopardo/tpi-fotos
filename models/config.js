import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

try {
    await sequelize.authenticate();
    console.log('¡Sequelize se conectó con éxito a PostgreSQL!');
} catch (error) {
    console.error('Error al conectar Sequelize con la BD:', error);
}

export default sequelize;