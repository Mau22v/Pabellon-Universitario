import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";


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


// Evento al hacer clic en el botón de registro
document.getElementById("registro").addEventListener('click', function(e) {
    e.preventDefault(); // Evitar recarga de la página
  
    // Obtener valores del formulario
    const correo = document.getElementById("correo").value;
    const contraseña = document.getElementById("contraseña").value;
    const matricula = document.getElementById("matricula").value;
    const nombre = document.getElementById("nombre").value;
    const cardexFile = document.getElementById("cardex").files[0];
    const horarioFile = document.getElementById("horario").files[0];
    const polizaFile = document.getElementById("poliza").files[0];
    const credencialFile = document.getElementById("credencial").files[0];
    const cartaFile = document.getElementById("carta").files[0];
    const reglamentoFile = document.getElementById("reglamento").files[0];

    let uid;
    createUserWithEmailAndPassword(auth, correo, contraseña)
        .then((userCredential) => {
            const user = userCredential.user;
            uid = user.uid;
            // Paso 2: Subir archivos a Cloudinary
            return Promise.all([
                subirArchivoACloudinary(cardexFile, "cardex", matricula),
                subirArchivoACloudinary(horarioFile, "horario", matricula),
                subirArchivoACloudinary(polizaFile, "poliza", matricula),
                subirArchivoACloudinary(credencialFile, "credencial", matricula),
                subirArchivoACloudinary(cartaFile, "carta", matricula),
                subirArchivoACloudinary(reglamentoFile, "reglamento", matricula),
            ]);
        })

    .then(([cardexRes, horarioRes, polizaRes, credencialRes, cartaRes, reglamentoRes]) => {
        console.log("Cardex URL:", cardexRes.secure_url);
        console.log("Horario URL:", horarioRes.secure_url);
        console.log("Poliza URL:", polizaRes.secure_url);
        console.log("Credencial URL:", credencialRes.secure_url);
        console.log("Carta URL:", cartaRes.secure_url);
        console.log("Reglamento URL:", reglamentoRes.secure_url)

        // Guardar los datos en Firebase
        return set(ref(db, "usuarios/" + uid), {
            correo: correo,
            matricula: matricula,
            nombre: nombre,
            rol: "vendedor",
            cardexUrl: cardexRes.secure_url,
            horarioUrl: horarioRes.secure_url,
            polizaUrl: polizaRes.secure_url,
            credencialUrl : credencialRes.secure_url,
            cartaUrl: cartaRes.secure_url,
            reglamentoUrl: reglamentoRes.secure_url,
        });
    })
    .then(() => {
        alert("Información registrada correctamente, pendiente a aprobación");
    })
    .catch(error => {
        alert("Error al registrar usuario: " + error.message);
        console.error(error);
    });
});

// Función para subir un archivo a Cloudinary
function subirArchivoACloudinary(archivo, carpeta, nombreArchivo) {
    const url = "https://api.cloudinary.com/v1_1/dwmwoo4lk/auto/upload"; // Cambia "dwmwoo4lk" si es necesario
    
    const formData = new FormData();

    formData.append("file", archivo);
    formData.append("upload_preset", "pabellon_unsigned"); // Tu preset sin firmar
    /*formData.append("resource_type", "raw");*/ 
    formData.append("public_id", `datsP/${carpeta}_${nombreArchivo}`); // sin .pdf al final


    return fetch(url, {
        method: "POST",
        body: formData
    }).then(res => res.json());
}
