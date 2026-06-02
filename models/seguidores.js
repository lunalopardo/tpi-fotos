import { DataTypes } from 'sequelize';
import sequelize from './config.js';

const Seguidor = sequelize.define('seguidores', {
    id_seguidor: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        allowNull: false
    },
    id_seguido: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default Seguidor;