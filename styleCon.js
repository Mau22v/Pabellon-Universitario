import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, update, get, set, push, remove} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
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


const contenedorMesas = {};  // Diccionario para guardar referencias
const mesas = Array.from({ length: 24 }, (_, i) => i + 1);
const contenedor = document.getElementById('mapa');
const nombre = document.getElementById("rec-negocio");
const descripcion = document.getElementById("rec-des");
const horario = document.getElementById("rec-hr");
const ubicacion = document.getElementById("rec-ub");
const fotoPerfil = document.getElementById("img-preview");
const fotoPortada = document.getElementById("preview-portada");
const productosContenedor = document.getElementById("products-container");

function cargarProductosPorMesa() {
  const usuariosRef = ref(db, 'usuarios/');

  get(usuariosRef).then(snapshot => {
    if (snapshot.exists()) {
      const usuarios = snapshot.val();

      Object.keys(usuarios).forEach(uid => {
        const usuario = usuarios[uid];
        const ubicacion = usuario.ubicacion;

        if (ubicacion && contenedorMesas[ubicacion]) {
          // Guardar datos en el elemento HTML de la mesa
          const mesaDiv = contenedorMesas[ubicacion];
          mesaDiv.dataset.uid = uid;
          mesaDiv.dataset.nombre = usuario.perfil?.titulo;
          mesaDiv.dataset.descripcion = usuario.perfil?.descripcion;
          mesaDiv.dataset.horario = usuario.horario;
          mesaDiv.dataset.ubicacion = usuario.ubicacion;
          mesaDiv.dataset.fotoPerfil = usuario.perfil?.fotoPerfilUrl;
          mesaDiv.dataset.fotoPortada = usuario.perfil?.fotoPortadaUrl;
          mesaDiv.dataset.productos = JSON.stringify(usuario.productos || {});
        }
      });
    }
  }).catch(error => {
    console.error("Error al cargar usuarios:", error);
  });
}

mesas.forEach(id => {
  const divMesa = document.createElement('div');
  divMesa.classList.add('mesa');
  divMesa.textContent = `Mesa ${id}`;

  contenedor.appendChild(divMesa);
  // Guardar referencia en el diccionario
  contenedorMesas[`No. Mesa ${id}`] = divMesa;

  // Asignar evento con impresión en consola
  divMesa.onclick = () => {
    const nombre = divMesa.dataset.nombre;
    const descripcion = divMesa.dataset.descripcion;
    const horario = divMesa.dataset.horario;
    const ubicacion = divMesa.dataset.ubicacion;
    const fotoPerfil = divMesa.dataset.fotoPerfil;
    const fotoPortada = divMesa.dataset.fotoPortada;
    const productos = JSON.parse(divMesa.dataset.productos || "{}");


    
    if(nombre && descripcion){
      document.getElementById("rec-negocio").textContent = nombre;
      document.getElementById("rec-des").textContent = descripcion;
      document.getElementById("rec-hr").textContent = horario;
      document.getElementById("rec-ub").textContent = ubicacion;
      document.getElementById("img-preview").src = fotoPerfil;
      document.getElementById("preview-portada").src = fotoPortada;
    } else {
      document.getElementById("rec-negocio").textContent = "Sin información";
      document.getElementById("rec-des").textContent = "Sin descripción";
      document.getElementById("rec-hr").textContent = "Horario no disponible";
      document.getElementById("rec-ub").textContent = "Ubicación no disponible";
      document.getElementById("img-preview").src = "/PaginaUsuario/Perfil-Usuario.jpg";
      document.getElementById("preview-portada").src = "/PaginaUsuario/img/blog-2.jpg";
    }

    productosContenedor.innerHTML = ""; // Limpiar contenedor

    if (productosContenedor) {
      productosContenedor.innerHTML = "";
    
      if (Object.keys(productos).length > 0) {
        Object.keys(productos).forEach(key => {
          const producto = productos[key];
          const productoDiv = document.createElement("div");
          productoDiv.classList.add("product");

          let imagenesHTML = "";

          if (Array.isArray(producto.imagenes)) {
            imagenesHTML = producto.imagenes.map(url => `<img src="${url}" alt="Producto" class="img-producto" />`).join('');
          }
    
          productoDiv.innerHTML = `
            <h4>${producto.titulo || "Sin título"}</h4>
            <p>${producto.descripcion || "Sin descripción"}</p>
            ${imagenesHTML}
          `;
    
          productosContenedor.appendChild(productoDiv);
        });
      } else {
        productosContenedor.innerHTML = "<p>No hay productos registrados.</p>";
      }
    } else {
      console.warn("products-container no existe en el DOM");
    }    
    mostrarDetalles(id);  // Puedes usar este id si quieres mostrar productos en el modal
    
  };
});



function mostrarDetalles() {
  document.getElementById('modal').classList.add('open');
  // Desplazamos las mesas más a la derecha
  document.getElementById('mapa').style.transform = 'translateX(658px)';
}

document.getElementById('cerrarModalBtn').addEventListener('click', cerrarModal);
function cerrarModal() {
  document.getElementById('modal').classList.remove('open');
  // Volvemos las mesas a su posición original
  document.getElementById('mapa').style.transform = 'translateX(0)';
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    cargarProductosPorMesa(); 
  } else {
    console.warn("Usuario no autenticado.");
  }
});
