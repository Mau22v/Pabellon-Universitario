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

//Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

//Referencias al contenedor 
const activosBtn = document.getElementById("activos-btn");
const listaActivos = document.getElementById("lista-activos");

function obtenerListaActivos() {
    const usuariosRef = ref(db, "usuarios");
    get(usuariosRef).then((snapshot) => {
        if (snapshot.exists()) {
            listaActivos.innerHTML = ""; // Limpiar antes de agregar datos
            let contador = 0;
            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                const matricula = childSnapshot.key;

                if (userData.rol === "vendedor" && userData.aceptado === true) {
                    contador++;
                    // Contenedor principal que agrupa solicitud y acciones
                    const contenedor = document.createElement("div");
                    contenedor.classList.add("contenedor-activos");

                    // Div con información del vendedor
                    const div = document.createElement("div");
                    div.classList.add("solicitud");

                    const negocio = userData.perfil?.titulo || "Sin Actualizar"; 
                    div.innerHTML = `
                        <p><strong><ion-icon name="mail-outline"></ion-icon>Correo:</strong> ${userData.correo}</p>
                        <p><strong><ion-icon name="person-circle-outline"></ion-icon>Nombre:</strong> ${userData.nombre}</p>
                        <p><strong><ion-icon name="id-card-outline"></ion-icon>Matrícula:</strong> ${userData.matricula}</p>
                        <p><strong><ion-icon name="alarm-outline"></ion-icon>Horario:</strong> ${userData.horario || "No asignado"}</p> 
                        <p><strong><ion-icon name="map-outline"></ion-icon>Ubicacion:</strong>${userData.ubicacion || "No asignado"}</p>
                        <p><strong><ion-icon name="storefront-outline"></ion-icon>Negocio:</strong> ${negocio} </p>
                    `;

                    // Div con las acciones
                    const accionesDiv = document.createElement("div");
                    accionesDiv.classList.add("acciones");

                    const label = document.createElement("label");
                    const input = document.createElement("input");
                    const button = document.createElement("button");
                    label.textContent = "Asignación de Horarios:";
                    input.type = "time";
                    input.value = "00:00"
                    button.textContent = "Asignar Horario";
                    button.addEventListener("click", () => {
                        const usuarioRef = ref(db, `usuarios/${matricula}`);
                    
                        update(usuarioRef, { horario: input.value })
                            .then(() => {
                                console.log("Horario actualizado correctamente");
                            })
                            .catch((error) => {
                                console.error("Error al actualizar horario:", error);
                            });
                    });
                    
                    const label1 = document.createElement("label");
                    const input1 = document.createElement("input");
                    const button1 = document.createElement("button");
                    label1.textContent = "Asignación de Ubicacion:";
                    input1.type = "text";
                    input1.value = "No. Mesa";
                    button1.textContent = "Asignar Ubicacion";
                    button1.addEventListener("click", () => {
                        const usuarioRef = ref(db, `usuarios/${matricula}`);
                    
                        update(usuarioRef, { ubicacion: input1.value })
                            .then(() => {
                                console.log("Ubicación actualizado correctamente");
                            })
                            .catch((error) => {
                                console.error("Error al actualizar ubicación:", error);
                            });
                    });

                    // Agregar elementos al div de acciones
                    accionesDiv.appendChild(label);
                    accionesDiv.appendChild(input);
                    accionesDiv.appendChild(button);
                    accionesDiv.appendChild(label1);
                    accionesDiv.appendChild(input1);
                    accionesDiv.appendChild(button1);
                    // Agregar solicitud y acciones al contenedor principal
                    contenedor.appendChild(div);
                    contenedor.appendChild(accionesDiv);

                    // Agregar el contenedor principal a la lista de activos
                    listaActivos.appendChild(contenedor);
                }
            });

            document.getElementById("contador-activos").textContent = contador; 
        }
         if (contador === 0) {
                listaActivos.innerHTML = `
                    <div class="mensaje-vacio">
                    <p><strong>Sin Vendedores Activos</strong></p>
                    </div>
                `;
            } else  {
            listaActivos.innerHTML = `
                <div class="mensaje-error">
                    <p><strong>No se encontraron datos de vendedores.</strong></p>
                </div>
            `;
            }  
    }).catch(error => console.error("Error obteniendo usuarios:", error));
}

// Evento para cargar solicitudes cuando el admin acceda a la sección
activosBtn.addEventListener("click", () => {
    document.getElementById("container-inicio").classList.add("oculto");
    document.getElementById("container-activos").classList.remove("oculto");

    // Llamar a la función para actualizar la lista de activos
    obtenerListaActivos();
});



