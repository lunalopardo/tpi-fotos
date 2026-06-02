import { DataTypes } from 'sequelize';
import sequelize from './config.js';

const Valoracion = sequelize.define('valoraciones', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    id_publicacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    puntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default Valoracion;