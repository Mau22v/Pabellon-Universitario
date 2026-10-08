const solicitudesBtn = document.getElementById("solicitudes-btn");
const solicitudesContenedor = document.getElementById("container-solicitudes");

const inicioBtn = document.getElementById("inicio-btn");
const inicioContenedor = document.getElementById("container-inicio");

const activosBtn = document.getElementById("activos-btn");
const activosContenedor = document.getElementById("container-activos");


    const adminBtn = document.getElementById("admin-menu");
    const optionsMenu = document.getElementById("admin-options");
    const adminBtnOculto = document.getElementById("admin-menu-oculto");
    const optionsMenuOculto = document.getElementById("admin-options-oculto");
    const adminBtnOculto2 = document.getElementById("admin-menu-oculto2");
    const optionsMenuOculto2 = document.getElementById("admin-options-oculto2");

    adminBtn.addEventListener("click", function() {
        optionsMenu.style.display = (optionsMenu.style.display === "none") ? "block" : "none";
    });

    adminBtnOculto.addEventListener("click", function() {
        optionsMenuOculto.style.display = (optionsMenuOculto.style.display === "none") ? "block" : "none";
    });

    adminBtnOculto2.addEventListener("click", function() {
        optionsMenuOculto2.style.display = (optionsMenuOculto2.style.display === "none") ? "block" : "none";
    });

function mostrarSeccion(seccionMostrada) {
    inicioContenedor.style.display = "none";
    solicitudesContenedor.style.display = "none";
    activosContenedor.style.display = "none";

    // Muestra la sección seleccionada
    seccionMostrada.style.display = "block";
}

// Eventos para cambiar de sección
inicioBtn.addEventListener("click", () => {
    mostrarSeccion(inicioContenedor);
});

solicitudesBtn.addEventListener("click", () => {
    mostrarSeccion(solicitudesContenedor);
});

activosBtn.addEventListener("click", () => {
    mostrarSeccion(activosContenedor);
});

// Mostrar la sección de inicio por defecto
mostrarSeccion(inicioContenedor);
