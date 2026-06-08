import Usuario from './usuario.js';
import Publicacion from './publicacion.js';
import Valoracion from './valoracion.js';
import Comentario from './comentario.js'


export function asociarClases() {
    Publicacion.belongsTo(Usuario, { foreignKey: 'id_usuario' });
    Usuario.hasMany(Publicacion, { foreignKey: 'id_usuario' });

    Valoracion.belongsTo(Usuario, { foreignKey: 'id_usuario' });
    Valoracion.belongsTo(Publicacion, { foreignKey: 'id_publicacion' });

    Publicacion.hasMany(Valoracion, { foreignKey: 'id_publicacion' });
    Usuario.hasMany(Valoracion, { foreignKey: 'id_usuario' });

    Comentario.belongsTo(Publicacion, { foreignKey: 'id_publicacion' });
    Publicacion.hasMany(Comentario, { foreignKey: 'id_publicacion' });

    Comentario.belongsTo(Usuario, { foreignKey: 'id_usuario' });
    Usuario.hasMany(Comentario, { foreignKey: 'id_usuario' });
}