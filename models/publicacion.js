import { DataTypes } from 'sequelize';
import sequelize from './config.js';

const Publicacion = sequelize.define('publicaciones', {
    id_publicacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    rutas_archivos: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    copyright: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    marca_agua_texto: {
        type: DataTypes.STRING(100)
    },
    etiquetas: {
        type: DataTypes.STRING(255)
    },
    estado: {
        type: DataTypes.STRING(20),
        defaultValue: 'activa'
    },
    comentarios_cerrados: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    denuncias_cantidad: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    fecha_subida: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default Publicacion;