const fileInput = document.getElementById('img');
const contenedorImgs = document.getElementById('imgsBase64');
const errores = document.getElementById('errores');

fileInput.addEventListener('change', async (e) => {
    contenedorImgs.innerHTML = '';
    if (errores) errores.innerHTML = '';

    // Convertimos la FileList nativa a un Array de JavaScript
    const archivos = Array.from(e.target.files);

    // Filtramos los archivos válidos
    const archivosValidos = archivos.filter(file => {
        if (typeof validarFile === 'function') {
            const resultado = validarFile(file);
            if (!resultado) {
                const li = document.createElement('li');
                li.innerText = `Error imagen ${file.name}`;
                if (errores) errores.appendChild(li);
                return false;
            }
        }
        return true;
    });

    // Ordenamos ALFABÉTICAMENTE por el nombre real del archivo para que los users puedan tener algún control sobre el orden
    archivosValidos.sort((a, b) => a.name.localeCompare(b.name));

    const leerArchivoAsincronico = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    };

    try {
        // Leemos todos los archivos en paralelo, pero Promise.all nos garantiza mantener el orden del array ordenado
        const resultadosBase64 = await Promise.all(archivosValidos.map(file => leerArchivoAsincronico(file)));

        resultadosBase64.forEach(base64Result => {
            const textArea = document.createElement('textarea');
            textArea.style.display = 'none';
            textArea.value = base64Result;
            textArea.name = 'imagenesBase64[]';

            contenedorImgs.appendChild(textArea);
        });

    } catch (error) {
        console.error("Error al procesar el ordenamiento de las imágenes:", error);
    }
});