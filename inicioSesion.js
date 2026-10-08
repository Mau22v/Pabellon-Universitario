import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

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
const auth = getAuth();
// Evento de clic en el formulario de inicio de sesión
document.getElementById("login").addEventListener("click", function(e) {
    e.preventDefault(); // Evitar que el formulario recargue la página

    /*Obtenemos datos del formulario*/
    const correo = document.getElementById("correoi").value;
    const contraseña = document.getElementById("contraseñai").value;

    /*majenador de la Firebase*/
    const auth = getAuth();
    signInWithEmailAndPassword(auth, correo, contraseña)
        .then((userCredential) => {             // Autenticación exitosa
            const user = userCredential.user;
            checkUserRole(user.uid);            // Llamar a la función para verificar el rol
        })
        .catch((error) => {
            let message;
            switch (error.code) {
                case "auth/user-not-found":
                    message = "El correo no está registrado.";
                    break;
                case "auth/wrong-password":
                    message = "Contraseña incorrecta.";
                    break;
                case "auth/invalid-email":
                    message = "El correo no es válido.";
                    break;
                default:
                    message = "Error al iniciar sesión: " + error.message;
            }
            alert(message);
        });        
});

const recuperarContra = document.getElementById("olvidaste-contrasena");

recuperarContra.addEventListener("click", function(e){
    e.preventDefault();
    const email = document.getElementById("correoi").value.trim();

    if (!email){
        alert("Por favor ingresa tu correo para recuperar la contraseña");
        return;
    }

    sendPasswordResetEmail(auth, email)
    .then(() => {
        alert("Se ha enviado un correo para restablecer tu contraseña");
    })
    .catch((error) => {
        console.error("Error al enviar el correo de recuperacion", error);
        if (error.code === 'auth/user-not-found') {
            alert("No existe un usuario con ese correo.");
        } else {
            alert("Ocurrió un error al intentar enviar el correo.");
        }
    });
});

// Función para verificar el rol del usuario en Realtime Database
function checkUserRole(uid) {
    const db = getDatabase();     // Referencia a la BD
    const userRef = ref(db, 'usuarios/' + uid);     // Referencia a los datos

    get(userRef)
        .then((snapshot) => {           // Snapshot tiene los datos al momento de la consulta
            if (snapshot.exists()) {    // Verifica existencia de los datos
                const userData = snapshot.val();

                if (userData.rol === "admin") {
                    window.location.href = "/admin.html";

                } else if (userData.rol === "vendedor") {
                    if (userData.aceptado === true) {
                        window.location.href = "/PaginaUsuario/Perfil-Usuario.html";


                    } else if (userData.rechazado === true) {
                         alert("Fuiste rechazado por: " + (userData.motivoRechazo || "sin especificar"));
                    } else {
                        alert("No has sido aceptado por el administrador");
                    }

                } else {
                    alert("Rol no reconocido.");
                }

            } else {
                alert("No se encontró el usuario en la base de datos.");
            }
        })
        .catch((error) => {
            alert("Error al verificar el rol: " + error.message);
        });
}

