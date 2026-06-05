const fileInput = document.getElementById('img');
const contenedorImgs = document.getElementById('imgsBase64');
const errores = document.getElementById('errores');

fileInput.addEventListener('change', (e) => {
    contenedorImgs.innerHTML = '';
    if (errores) errores.innerHTML = '';
    
    const archivos = e.target.files;
    
    for (let i = 0; i < archivos.length; i++) {
        const file = archivos[i];
        
        if (typeof validarFile === 'function') {
            const resultado = validarFile(file);
            if (!resultado) {
                const li = document.createElement('li');
                li.innerText = `Error imagen ${file.name}`;
                if (errores) errores.appendChild(li);
                continue;
            }
        }

        const reader = new FileReader();
        reader.onload = () => {        
            const textArea = document.createElement('textarea');
            textArea.style.display = 'none'; 
            textArea.value = reader.result;
            
            textArea.name = 'imagenesBase64[]'; 
            
            contenedorImgs.appendChild(textArea);
        };
        
        reader.readAsDataURL(file);
    }
});