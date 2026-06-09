import Usuario from './usuario.js';
import Publicacion from './publicacion.js';
import Valoracion from './valoracion.js';
import Comentario from './comentario.js';
import Seguidor from './seguidor.js';


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

    // Muchos a muchos
    // foreignKey: dice que columna representa al usuario que origina la acción (el que sigue).
    // otherKey: dice que columna representa al usuario que recibe la acción (el seguido).

    // Un user puede seguir a muchos users
    Usuario.belongsToMany(Usuario, {
        through: Seguidor,
        as: 'misSeguidos',
        foreignKey: 'id_seguidor',
        otherKey: 'id_seguido'
    });

    // Un user puede ser seguido por muchos users
    Usuario.belongsToMany(Usuario, {
        through: Seguidor,
        as: 'misSeguidores',
        foreignKey: 'id_seguido',
        otherKey: 'id_seguidor'
    });

    Seguidor.belongsTo(Usuario, { foreignKey: 'id_seguidor', as: 'Seguidores' });
    Seguidor.belongsTo(Usuario, { foreignKey: 'id_seguido', as: 'Seguidos' });
}