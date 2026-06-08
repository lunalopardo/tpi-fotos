import sequelize from '../models/config.js';
import Usuario from '../models/usuario.js';
import { encriptarContrasenia } from '../helpers/hash.js';

const usersToCreate = [
    { nombre_usuario: 'Thrall', email: 'warchief@gmail.com' },
    { nombre_usuario: 'Garrosh', email: 'hellscream@warsong.gg' },
    { nombre_usuario: 'Cairne', email: 'bloodhoof@gmail.com' },
    { nombre_usuario: 'Voljin', email: 'shadowhunter@gmail.com' },
    { nombre_usuario: 'Varok', email: 'saurfang@gmail.com' },
    { nombre_usuario: 'LorThemar', email: 'regentlord@silvermoon.gov' },
    { nombre_usuario: 'GrandApothecary', email: 'putress@gmail.com' },
    { nombre_usuario: 'BobTheUndead', email: 'bob@gmail.com' },
    { nombre_usuario: 'ZugZug99', email: 'peon@gmail.com' }
];

async function seed() {
    try {
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
                console.log(`+ Creado con éxito: ${user.nombre_usuario}`);
            } else {
                console.log(`- Ya existía en la BD (No se reemplazó): ${user.nombre_usuario}`);
            }
        }

        console.log('Seeding finalizado con éxito!');
    } catch (error) {
        console.error('Error en el seeder:', error);
    } finally {
        sequelize.close();
    }
}

seed();