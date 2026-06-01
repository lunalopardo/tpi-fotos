import Usuario from '../models/Usuario.js';

export const getRegistro = (req, res) => {
    res.render('registro', { titulo: 'Crear Cuenta - Fotaza 2' });
};

export const postRegistro = async (req, res) => {
    const { nombre_usuario, email, contrasenia } = req.body;

    try {
        await Usuario.create({
            nombre_usuario: nombre_usuario,
            email: email,
            contrasenia: contrasenia
        });

        res.send('<h1>¡Usuario creado con éxito usando Sequelize!</h1><a href="/">Volver al inicio</a>');
        
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        
        // Sequelize maneja los errores UNIQUE de una forma más descriptiva
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.render('registro', { 
                titulo: 'Crear Cuenta - Fotaza 2', 
                error: 'El nombre de usuario o el email ya están registrados.' 
            });
        }
        
        res.status(500).send('Hubo un error al procesar el registro.');
    }
};