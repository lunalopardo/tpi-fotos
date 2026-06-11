## TRABAJO INTEGRADOR DE WEB 2

Este es el proyecto "Fotaza 2" para Programación Web II. Es una plataforma para compartir, valorar y comentar fotografías. Próximamente se podrá mostrar interés en comprarlas! 

### Cómo ponerlo en marcha (Local)

Para que el proyecto funcione, seguí estos pasos:

1. Instalar dependencias: 
```bash
npm install
```
2. Configurar variables de entorno:
- Copiar el archivo _.env.example_ y renombrarlo a _.env._ 
- Rellenarlo con sus datos de conexión a PostgreSQL.

3. Inicializar la Base de Datos: 
```bash
npm run db:init
```
4. Iniciar la app: 
```bash
npm start
```
Luego, acceder a http://localhost:3000.


#### Usuario de prueba
De momento todos los usuarios tienen el mismo nivel de permiso, así que pueden crear uno nuevo o usar este:

Usuario: admin
Contraseña: password


### Lo implementado hasta esta instancia (Estado actual)
Hasta ahora, el proyecto cuenta con las funcionalidades mínimas para la regularización:

- Registro y login de usuarios con sesiones.
- Creación de publicaciones con una o más imágenes y etiquetas.
- Copyright:
    - Lógica de marca de agua en imágenes con Copyright (a elegir por el usuario o predeterminada).
    - Solo los usuarios que están logueados pueden ver las publicaciones con Copyright.
- Sección de comentarios en cada publicación & opción de cerrar comentarios desde la creación de la misma.
- Sistema de estrellas para calificar publicaciones.
- Sistema de "Seguir/ Dejar de seguir" usuarios
- Perfil de usuarios con: seguidos, seguidores y publicaciones.
- Buscador: 
    - Filtros para encontrar publicaciones por título o etiquetas.
    - Filtros para encontrar autores.
    - Filtros para ordenar por antigüedad o valoración.


### Pendientes (Para la etapa del final)
Para la entrega final, me falta implementar:

- Sistema de denuncias de publicaciones y comentarios.
- Motor de notificaciones en tiempo real.
- Gestión de favoritos y colecciones personales.
- Panel de "Validador de contenidos" para administradores.
- La opción de mostrar interés en comprar una imagen y mensajería interna.

