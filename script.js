const container = document.querySelector(".container");
const btnInicioSesion = document.getElementById("btn-inicio-sesion");
const btnRegistrate = document.getElementById("btn-registrate");

btnInicioSesion.addEventListener("click", ()=> {
    container.classList.remove("toggle");
});


btnRegistrate.addEventListener("click", ()=> {
    container.classList.add("toggle");
});

