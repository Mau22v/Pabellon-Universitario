import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, update, get, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
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

function cargarDatos() {
  const imgPerfil = document.getElementById("img-perfil");
  const imgPortada = document.querySelector(".perfil-usuario-portada");
  const tituloElemento = document.querySelector(".perfil-usuario-body .titulo");
  const textoElemento = document.querySelector(".perfil-usuario-body .texto");
  const user = auth.currentUser;

  if (user) {
    const uid = user.uid;
    const userRef = ref(db, 'usuarios/' + uid + '/perfil/');
    get(userRef).then(snapshot => {
      const userData = snapshot.val();

      if (userData) {
        if (userData.fotoPerfilUrl) {
          imgPerfil.src = userData.fotoPerfilUrl;
        } else {
          imgPerfil.src = 'default-perfil.jpg';
        }

        if (userData.fotoPortadaUrl) {
          imgPortada.style.backgroundImage = `url('${userData.fotoPortadaUrl}')`;
        } else {
          imgPortada.style.backgroundImage = 'url("default-portada.jpg")';
        }

        if (userData.titulo) {
          tituloElemento.textContent = userData.titulo;
        } else {
          inputTitulo.value = tituloElemento.textContent;
        }

        if (userData.descripcion) {
          textoElemento.textContent = userData.descripcion;
        } else {
          inputTexto.value = textoElemento.textContent;
        }

      } else {
        imgPerfil.src = 'Perfil-Usuario.jpg';
        imgPortada.style.backgroundImage = 'nlog-2.jpg';
      }
    }).catch(error => {
      console.error("Error al recuperar los datos del usuario:", error);
    });
  } else {
    imgPerfil.src = 'default-perfil.jpg';
    imgPortada.style.backgroundImage = "";
  }
}



// DOMContentLoaded para la inicialización
document.addEventListener("DOMContentLoaded", () => {

  const btnAbrirModal = document.getElementById("btn-abrir-modal");
  const modal = document.getElementById("modal");
  const btnCerrarModal = document.getElementById("btn-cerrar-modal");
  const btnCambiarFoto = document.getElementById("btn-cambiar-foto");
  const inputFile = document.getElementById("input-file");
  const imgPerfil = document.getElementById("img-perfil");
  const imgPreview = document.getElementById("img-preview");
  const btnGuardarCambios = document.getElementById("btn-guardar-cambios");

  const btnCambiarPortada = document.getElementById("btn-cambiar-portada");
  const modalPortada = document.getElementById("modal-portada");
  const inputPortada = document.getElementById("input-portada");
  const btnElegirPortada = document.getElementById("btn-elegir-portada");
  const imgPortada = document.querySelector(".perfil-usuario-portada");
  const previewPortada = document.getElementById("preview-portada");
  const btnCancelarPortada = document.getElementById("btn-cancelar-portada");
  const btnGuardarPortada = document.getElementById("btn-guardar-portada");


  const btnEditar = document.getElementById("btn-editar-bio");
  const modalEditarBio = document.getElementById("modal-editar-bio");
  const inputTitulo = document.getElementById("input-titulo-bio");
  const inputTexto = document.getElementById("input-texto-bio");
  const btnGuardarBio = document.getElementById("guardar-bio");
  const btnCerrarBio = document.getElementById("cerrar-modal-bio");


  const defaultFile = "Perfil-Usuario.jpg";
  let tempPortada = "";

  // Cambiar foto de perfil
  btnAbrirModal.addEventListener("click", () => {
    modal.showModal();
    imgPreview.src = imgPerfil ? imgPerfil.src : defaultFile;
    inputFile.value = "";
  });

  btnCerrarModal.addEventListener("click", () => modal.close());

  btnCambiarFoto.addEventListener("click", () => inputFile.click());

  inputFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => imgPreview.src = e.target.result;
      reader.readAsDataURL(file);
    } else {
      imgPreview.src = defaultFile;
    }
  });

  btnGuardarCambios.addEventListener("click", async () => {
    const file = inputFile.files[0];
    if (file) {
      try {
        const user = auth.currentUser;
        if (user) {
          const uid = user.uid;
          const resultado = await subirArchivoACloudinary(file, "fotoPerfil", uid);
          imgPerfil.src = resultado.secure_url;
          const userRef = ref(db, 'usuarios/' + uid + '/perfil');
          await update(userRef, {
            fotoPerfilUrl: resultado.secure_url
          });
          console.log("Imagen de perfil actualizada correctamente.");
        }
      } catch (error) {
        console.error("Error subiendo imagen de perfil:", error);
      }
    }
    modal.close();
  });

  // Cambiar portada
  btnCambiarPortada.addEventListener("click", () => {
    modalPortada.showModal();
    inputPortada.value = "";
    const bg = window.getComputedStyle(imgPortada).backgroundImage;
    const bgURL = bg.slice(5, -2);
    previewPortada.src = bgURL;
    tempPortada = bgURL;
  });

  btnElegirPortada.addEventListener("click", () => inputPortada.click());

  inputPortada.addEventListener("change", e => {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewPortada.src = e.target.result;
        tempPortada = e.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  btnCancelarPortada.addEventListener("click", () => modalPortada.close());

  btnGuardarPortada.addEventListener("click", async () => {
    const file = inputPortada.files[0];
    if (file) {
      try {
        const user = auth.currentUser;
        if (user) {
          const uid = user.uid;
          const resultado = await subirArchivoACloudinary(file, "fotoPortada", uid);
          imgPortada.style.backgroundImage = `url('${resultado.secure_url}')`;
          const userRef = ref(db, 'usuarios/' + uid + '/perfil');
          await update(userRef, {
            fotoPortadaUrl: resultado.secure_url
          });
        }
      } catch (error) {
        console.error("Error subiendo imagen de portada:", error);
      }
    }
    modalPortada.close();
  });

  // Editar bio
  btnEditar.addEventListener("click", () => {
    inputTitulo.value = document.querySelector(".perfil-usuario-body .titulo").textContent;
    inputTexto.value = document.querySelector(".perfil-usuario-body .texto").textContent;
    modalEditarBio.showModal();
  });


  btnGuardarBio.addEventListener("click", () => {
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid;
      const userRef = ref(db, 'usuarios/' + uid + '/perfil');

      try {
        // Puedes usar update, pero asegurándote que la ruta existe
        update(userRef, {
          titulo: inputTitulo.value,
          descripcion: inputTexto.value
        })
          .then(() => {
            console.log("Texto actualizado en Firebase");

            // Actualizamos la vista también
            document.querySelector(".perfil-usuario-body .titulo").textContent = inputTitulo.value;
            document.querySelector(".perfil-usuario-body .texto").textContent = inputTexto.value;
          })
          .catch((error) => {
            console.error("Error al actualizar la descripción", error);
          });

      } catch (error) {
        console.error("Error general al subir datos:", error);
      }
    }

    modalEditarBio.close();
  });


  btnCerrarBio.addEventListener("click", () => modalEditarBio.close());


  onAuthStateChanged(auth, (user) => {
    if (user) {
      cargarDatos();
      console.log("Usuario autenticado.");
    } else {
      console.log("No hay usuario autenticado.");
    }
  });

});
