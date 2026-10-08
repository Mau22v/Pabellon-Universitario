import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, update, get, set, push, remove } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"; // Asegúrate de importar esto si estás en módulo.

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Función para subir archivo a Cloudinary
function subirArchivoACloudinary(archivo, carpeta, nombreArchivo) {
    const url = "https://api.cloudinary.com/v1_1/dwmwoo4lk/auto/upload";
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", "pabellon_unsigned");
    formData.append("public_id", `datsP/${carpeta}_${nombreArchivo}`);

    return fetch(url, {
        method: "POST",
        body: formData
    }).then(res => res.json());
}


function cargarProductos() {
    const user = auth.currentUser;

    if (!user) return;

    const uid = user.uid;
    const productosRef = ref(db, 'usuarios/' + uid + '/productos');


    get(productosRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const productos = snapshot.val();

                Object.keys(productos).forEach(key => {
                    const producto = productos[key];
                    // Crear el contenedor del producto igual que en agregarEliminarP()

                    const contenedorProducto = document.createElement("div");
                    contenedorProducto.classList.add("agregarEliminarProductos");
                    contenedorProducto.setAttribute("data-key", key);

                    const datosGenerales = document.createElement("div");
                    datosGenerales.classList.add("datos-generales");
                    const h2 = datosGenerales.querySelector("h2");
                    const p = datosGenerales.querySelector("p");
                    datosGenerales.innerHTML = `
                        <h2>${producto.titulo}</h2>
                        <p>Descripción: ${producto.descripcion}</p>
                    `;

                    const galeria = document.createElement("div");
                    galeria.classList.add("galeria-imagenes");

                    // Agregar imágenes si existen
                    if (producto.imagenes && Array.isArray(producto.imagenes)) {
                        producto.imagenes.forEach(url => {
                            const img = document.createElement("img");
                            img.src = url;
                            galeria.appendChild(img);
                        });
                    }

                    const divBoton = document.createElement("div");
                    divBoton.classList.add("div-boton");

                    divBoton.innerHTML = `
                       <button class="editar-btn">Editar</button>
                    `;

                    contenedorProducto.appendChild(datosGenerales);
                    contenedorProducto.appendChild(galeria);
                    contenedorProducto.appendChild(divBoton);

                    contenedorAgreEli.appendChild(contenedorProducto);

                    const botonEditar = divBoton.querySelector(".editar-btn");

botonEditar.addEventListener("click", function () {
    if (contenedorProducto.querySelector(".form-editar")) return;

    const h2 = datosGenerales.querySelector("h2");
    const p = datosGenerales.querySelector("p");

    const formEditar = document.createElement("div");
    formEditar.classList.add("form-editar");

    // Crea el HTML antes de acceder a los botones
    formEditar.innerHTML = `
        <input type="text" class="nuevo-titulo" value="${h2.textContent}">
        <textarea class="nueva-descripcion">${p.textContent.replace("Descripción: ", "")}</textarea>
        <button class="guardar-cambios">Guardar</button>
    `;

    contenedorProducto.appendChild(formEditar);

    // Ahora ya existe el botón en el DOM, ahora sí se puede usar querySelector
    const botonGuardar = formEditar.querySelector(".guardar-cambios");

    if (botonGuardar) {
        botonGuardar.addEventListener("click", async function () {
            const nuevoTitulo = formEditar.querySelector(".nuevo-titulo").value.trim();
            const nuevaDescripcion = formEditar.querySelector(".nueva-descripcion").value.trim();

            const key = contenedorProducto.getAttribute("data-key");
            const nuevoProductoRef = ref(db, `usuarios/${auth.currentUser.uid}/productos/${key}`);


            update(nuevoProductoRef, {
                titulo: nuevoTitulo,
                descripcion: nuevaDescripcion
            })
            .then(() => {
                h2.textContent = nuevoTitulo;
                p.textContent = "Descripción: " + nuevaDescripcion;
                formEditar.remove();
            })
            .catch((error) => {
                console.error("Error al actualizar el producto:", error);
            });
        });
    } else {
        console.error("No se encontró el botón .guardar-cambios");
    }
});

                    



                });
            } else {
                console.log("No hay productos guardados.");
            }
        })
        .catch(error => {
            console.error("Error al cargar productos:", error);
        });
}

function cargarDatos() {
    const user = auth.currentUser;
    if (!user) return;

    const uid = user.uid;
    const datosRef = ref(db, 'usuarios/' + uid);
    get(datosRef).then(snapshot => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            document.getElementById("hr-asignado").textContent = "Horario Asignado: " + userData.horario || "No asignado";
            document.getElementById("ms-asignado").textContent = "Ubicacion Asignada: " + userData.ubicacion || "Sin mesa";
            // luego llamas a cargar productos
        }
    });
}

const contenedorAgreEli = document.getElementById("agregarEliminarProductos");

// Función para agregar un producto
function agregarEliminarP() {
    // Contenedor principal para el nuevo producto
    const contenedorProducto = document.createElement("div");
    contenedorProducto.classList.add("agregarEliminarProductos");

    // Datos generales del producto
    const datosGenerales = document.createElement("div");
    datosGenerales.classList.add("datos-generales");

    datosGenerales.innerHTML = `
        <h2>Nombre Producto</h2>
        <p>Descripción: </p>
    `;

    // Galería de imágenes (vacía al principio)
    const galeria = document.createElement("div");
    galeria.classList.add("galeria-imagenes");

    // Input para cargar imágenes
    const inputImagenes = document.createElement("input");
    inputImagenes.type = "file";
    inputImagenes.accept = "image/*";
    inputImagenes.multiple = true;

    // Cuando se cargan imágenes, se agregan a la galería
    inputImagenes.addEventListener("change", function (event) {
        const archivos = event.target.files;
        // Para cada imagen seleccionada
        for (let i = 0; i < archivos.length; i++) {
            const archivo = archivos[i];
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement("img");
                img.src = e.target.result; // Cargar la imagen en la galería
                galeria.appendChild(img);
            };
            reader.readAsDataURL(archivo); // Leer el archivo como URL de datos
        }
    });

    // Botones para editar
    const divBoton = document.createElement("div");
    divBoton.classList.add("div-boton");

    divBoton.innerHTML = `
        <button class="editar-btn">Editar</button>
    `;

    // Append de los elementos
    datosGenerales.appendChild(inputImagenes)
    contenedorProducto.appendChild(datosGenerales);
    contenedorProducto.appendChild(galeria);       // Agregar galería
    contenedorProducto.appendChild(divBoton);

    // Agregar el nuevo producto al contenedor
    contenedorAgreEli.appendChild(contenedorProducto);

    // Evento para editar
    const botonEditar = divBoton.querySelector(".editar-btn");
    botonEditar.addEventListener("click", function () {
        mostrarFormularioEditar(contenedorProducto, datosGenerales, inputImagenes);
    });

}

function mostrarFormularioEditar(contenedorProducto, datosGenerales, inputImagenes) {
    if (contenedorProducto.querySelector(".form-editar")) return;

    const h2 = datosGenerales.querySelector("h2");
    const p = datosGenerales.querySelector("p");


    const formEditar = document.createElement("div");
    formEditar.classList.add("form-editar");

    formEditar.innerHTML = `
        <input type="text" class="nuevo-titulo" value="${h2.textContent}">
        <textarea class="nueva-descripcion">${p.textContent.replace("Descripción: ", "")}</textarea>
        <button class="guardar-cambios">Guardar</button>
    `;

    contenedorProducto.appendChild(formEditar);

    formEditar.querySelector(".guardar-cambios").addEventListener("click", async function () {
        const nuevoTitulo = formEditar.querySelector(".nuevo-titulo").value.trim();
        const nuevaDescripcion = formEditar.querySelector(".nueva-descripcion").value.trim();
        const archivos = inputImagenes.files;
        if (!archivos || archivos.length === 0) {
            alert("Por favor, selecciona al menos una imagen.");
            return;
        }

        const user = auth.currentUser;

        if (user) {
            const uid = user.uid;
            const productosRef = ref(db, 'usuarios/' + uid + '/productos');
            const nuevoProductoRef = push(productosRef);

            const urlsImagenes = [];

            for (let i = 0; i < archivos.length; i++) {
                const archivo = archivos[i];
                const nombre = archivo.name.split('.')[0] + "_" + Date.now() + "_" + i;
                try {
                    const respuesta = await subirArchivoACloudinary(archivo, "productos", nombre);
                    if (respuesta.secure_url) {
                        urlsImagenes.push(respuesta.secure_url);
                    }
                } catch (error) {
                    console.error("Error al subir imagen:", error);
                }
            }

            console.log("Total de archivos seleccionados:", archivos.length);



            set(nuevoProductoRef, {
                titulo: nuevoTitulo,
                descripcion: nuevaDescripcion,
                imagenes: urlsImagenes
            })
                .then(() => {
                    console.log("Producto guardado correctamente");
                    h2.textContent = nuevoTitulo;
                    p.textContent = "Descripción: " + nuevaDescripcion;
                    formEditar.remove();
                })
                .catch((error) => {
                    console.error("Error al guardar el producto:", error);
                });
        }
    });
}


// Asignar el evento "click" a los botones cuando la página se carga
document.querySelector(".agregar-producto").addEventListener("click", agregarEliminarP);
document.querySelector(".eliminar-producto").addEventListener("click", function () {
    const productos = contenedorAgreEli.querySelectorAll(".agregarEliminarProductos");
    if (productos.length > 0) {
        const ultimoProducto = productos[productos.length - 1];
        const key = ultimoProducto.getAttribute("data-key");

        // Verificar que el elemento <h2> existe y obtener su texto
        const h2 = ultimoProducto.querySelector("h2");
        const titulo = h2 ? h2.textContent : "Sin título";

        // Mostrar en consola qué se va a borrar
        console.log(`Eliminando producto con key: ${key}, título: ${titulo}`);

        // Eliminar del DOM
        ultimoProducto.remove();

        // Eliminar de Firebase
        const user = auth.currentUser;
        if (user && key) {
            const productoRef = ref(db, 'usuarios/' + user.uid + '/productos/' + key);
            remove(productoRef)
                .then(() => {
                    console.log("Producto eliminado de la base de datos.");
                })
                .catch(error => {
                    console.error("Error al eliminar de la base de datos:", error);
                });
        }
    }
});


onAuthStateChanged(auth, (user) => {
    if (user) {
        cargarDatos();
        cargarProductos();   // Carga los productos del usuario
        console.log("Cargados")
    } else {
        console.warn("No hay usuario autenticado");
    }
});


