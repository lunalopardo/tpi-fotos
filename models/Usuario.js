import { DataTypes } from 'sequelize';
import sequelize from './config.js';

const Usuario = sequelize.define('usuarios', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_usuario: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    contrasenia: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    rol: {
        type: DataTypes.STRING(20),
        defaultValue: 'usuario'
    },
    activo: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default Usuario;