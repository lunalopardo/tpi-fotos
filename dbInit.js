import sequelize from './models/config.js';
import Usuario from './models/usuario.js';
import { asociarClases } from './models/asociaciones.js';
import { encriptarContrasenia } from './helpers/hash.js';

const usersToCreate = [
    { nombre_usuario: 'Thrall', email: 'warchief@gmail.com' },
    { nombre_usuario: 'Cairne', email: 'bloodhoof@gmail.com' },
    { nombre_usuario: 'Voljin', email: 'shadowhunter@gmail.com' },
    { nombre_usuario: 'Varok', email: 'saurfang@gmail.com' },
    { nombre_usuario: 'GrandApothecary', email: 'putress@gmail.com' },
    { nombre_usuario: 'BobTheUndead', email: 'bob@gmail.com' },
    { nombre_usuario: 'ZugZug99', email: 'peon@gmail.com' },
    { nombre_usuario: 'admin', email: 'admin@gmail.com' }
];

async function inicializarBaseDeDatos() {
    try {
        await sequelize.authenticate();
        asociarClases(); 
        // force: true borra las tablas existentes y las crea desde cero
        await sequelize.sync({ force: true });

        for (const user of usersToCreate) {
            const passwordEncriptada = await encriptarContrasenia('password');

            const [usuario, creado] = await Usuario.findOrCreate({
                where: { email: user.email },
                defaults: {
                    nombre_usuario: user.nombre_usuario,
                    contrasenia: passwordEncriptada
                }
            });

            if (creado) {
                console.log(`  + Creado con éxito: ${user.nombre_usuario}`);
            } else {
                console.log(`  - Ya existía en la BD: ${user.nombre_usuario}`);
            }
        }
        console.log('Seeding finalizado con éxito.');
        console.log('DB_INIT COMPLETADO!');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

inicializarBaseDeDatos();