import 'dotenv/config';
import { Sequelize } from 'sequelize';

const esProduccion = process.env.DB_HOST && process.env.DB_HOST.includes('render.com');

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        timezone: '-03:00',
        logging: false,
        
        dialectOptions: esProduccion ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}
    }
);

try {
    await sequelize.authenticate();
    console.log('¡Sequelize se conectó con éxito a PostgreSQL!');
} catch (error) {
    console.error('Error al conectar Sequelize con la BD:', error);
}

export default sequelize;