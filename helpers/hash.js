import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const encriptarContrasenia = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verificarContrasenia = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};