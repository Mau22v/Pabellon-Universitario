import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referencias a elementos del DOM
const listaSolicitudes = document.getElementById("lista-solicitudes");
const solicitudesBtn = document.getElementById("solicitudes-btn");

function cargarSolicitudes() {
    const usuariosRef = ref(db, "usuarios");

    get(usuariosRef).then((snapshot) => {
        let contador = 0; 
        if (snapshot.exists()) {
            listaSolicitudes.innerHTML = ""; // Limpiar la lista antes de cargar

            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                const matricula = childSnapshot.key;  // Obtener la matrícula del usuario

                // Verificar si el usuario no ha sido aceptado ni rechazado
                if (userData.rol !== 'admin' && userData.aceptado === undefined && userData.rechazado === undefined) {
                    contador++;
                    //Contedor principal
                    const contenedorPrincipal = document.createElement("div");
                    contenedorPrincipal.classList.add("solicitud-div");

                    const datosGenerales = document.createElement("div");
                    datosGenerales.classList.add("datos-generales");

                    datosGenerales.innerHTML = `
                    <strong><ion-icon name="mail-outline"></ion-icon>Correo:</strong> ${userData.correo} <br>
                    <strong><ion-icon name="person-circle-outline"></ion-icon>Nombre:</strong> ${userData.nombre} <br>
                    <strong><ion-icon name="id-card-outline"></ion-icon>Matrícula:</strong> ${userData.matricula} <br>
                    <strong><ion-icon name="document-outline"></ion-icon>Kardex:</strong> <a href="${userData.cardexUrl}" target="_blank">Ver Kardex</a><br>
                    <strong><ion-icon name="alarm-outline"></ion-icon>Horario:</strong> <a href="${userData.horarioUrl}" target="_blank">Ver Horario</a><br>
                `;

                    const otrosDocumentos = document.createElement("div");
                    otrosDocumentos.classList.add("otros-documentos");

                    otrosDocumentos.innerHTML = `
                    <strong><ion-icon name="newspaper-outline"></ion-icon>Poliza:</strong> <a href="${userData.polizaUrl}" target="_blank">Ver Poliza</a><br>
                    <strong><ion-icon name="id-card-outline"></ion-icon>Credencial Estudiante:</strong> <a href="${userData.credencialUrl}" target="_blank">Ver Credencial</a><br>
                    <strong><ion-icon name="document-outline"></ion-icon>Carta de Motivos:</strong> <a href="${userData.cartaUrl}" target="_blank">Ver Carta de Motivos</a><br>
                    <strong><ion-icon name="checkmark-circle-outline"></ion-icon>Acept.del Reglamento:</strong> <a href="${userData.reglamentoUrl}" target="_blank">Ver Acept. del Reglamento</a><br>
                 `;

                    const divBotones = document.createElement("div");
                    divBotones.classList.add("div-botones");

                    divBotones.innerHTML = `
                    <button class="aceptar-btn" data-matricula="${matricula}">Aceptar</button>
                    <button class="rechazar-btn" data-matricula="${matricula}">Rechazar</button>
                    <textarea class="motivos-textarea" data-matricula="${matricula}" placeholder="Escribe aquí los motivos..."></textarea>
                 `;
                    
                    contenedorPrincipal.appendChild(datosGenerales);
                    contenedorPrincipal.appendChild(otrosDocumentos);
                    contenedorPrincipal.appendChild(divBotones);
                    listaSolicitudes.appendChild(contenedorPrincipal);

                    // Agregar eventos a los botones de aceptar
                    document.querySelectorAll(".aceptar-btn").forEach((button) => {
                        button.addEventListener("click", (event) => {
                            const matricula = event.target.getAttribute("data-matricula");
                            aceptarUsuario(matricula);
                        });
                    });

                    // Agregar eventos a los botones de rechazar
                    document.querySelectorAll(".rechazar-btn").forEach((button) => {
                        button.addEventListener("click", (event) => {
                            const matricula = event.target.getAttribute("data-matricula");
                                    const textarea = event.target.parentElement.querySelector(".motivos-textarea");
                                    const motivo = textarea.value.trim();

                                    if (!motivo) {
                                        alert("Por favor escribe un motivo para rechazar.");
                                        return;
                                    }

                                    rechazarUsuario(matricula, motivo);
                        });
                    });
                }
            });
            document.getElementById("contador-pendientes").textContent = contador; 

        } else {
            listaSolicitudes.innerHTML = "<h3>No hay solicitudes pendientes.</h3>";
        }
    }).catch((error) => {
        console.error("Error al obtener las solicitudes:", error);
    });
}

// Función para aceptar usuario
function aceptarUsuario(matricula) {
    const usuarioRef = ref(db, `usuarios/${matricula}`);

    update(usuarioRef, {aceptado: true })
        .then(() => {
            alert(`Usuario con matrícula ${matricula} aceptado.`);
            cargarSolicitudes(); // Recargar la lista de solicitudes
        })
        .catch((error) => {
            console.error("Error al aceptar usuario:", error);
        });
}

// Función para rechazar usuario
function rechazarUsuario(matricula, motivo) {
    const usuarioRef = ref(db, `usuarios/${matricula}`);

    update(usuarioRef, {
        rechazado: true,
        aceptado: false,
        motivoRechazo: motivo
    })
    .then(() => {
        alert(`Usuario con matrícula ${matricula} rechazado con motivo: ${motivo}`);
        cargarSolicitudes(); // Recargar la lista
    })
    .catch((error) => {
        console.error("Error al rechazar usuario:", error);
    });
}


// Evento para cargar solicitudes cuando el admin acceda a la sección
solicitudesBtn.addEventListener("click", () => {
    document.getElementById("container-inicio").classList.add("oculto");
    document.getElementById("container-solicitudes").classList.remove("oculto");
    cargarSolicitudes();
});
