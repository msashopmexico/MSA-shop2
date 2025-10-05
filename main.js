import { createAuth0Client } from "https://cdn.jsdelivr.net/npm/@auth0/auth0-spa-js@2/dist/auth0-spa-js.production.esm.js";

let auth0 = null;
let tallaSeleccionada = null;

// Inicializar Auth0
async function initAuth() {
  auth0 = await createAuth0Client({
    domain: "dev-r83h8xsmacihkvil.us.auth0.com",
    client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
    cacheLocation: "localstorage",
    redirect_uri: window.location.origin
  });

  // Detectar login
  const isAuthenticated = await auth0.isAuthenticated();
  toggleAuthButtons(isAuthenticated);

  // Manejo de callback
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
    toggleAuthButtons(true);
  }
}

function toggleAuthButtons(loggedIn) {
  document.getElementById("btn-login").style.display = loggedIn ? "none" : "inline-block";
  document.getElementById("btn-logout").style.display = loggedIn ? "inline-block" : "none";
}

// Botones login/logout
document.getElementById("btn-login").addEventListener("click", async () => {
  await auth0.loginWithRedirect();
});

document.getElementById("btn-logout").addEventListener("click", () => {
  auth0.logout({ returnTo: window.location.origin });
});

// Selección de talla
window.seleccionarTalla = function(talla) {
  tallaSeleccionada = talla;
  alert("Talla seleccionada: " + talla);
};

// Agregar al carrito (solo si está logueado)
window.agregarCarrito = async function() {
  if (!await auth0.isAuthenticated()) {
    alert("Debes iniciar sesión para agregar al carrito");
    return;
  }
  if (!tallaSeleccionada) {
    alert("Selecciona una talla antes de agregar al carrito");
    return;
  }

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push({ producto: "Camiseta Lisa Negra", precio: 250, talla: tallaSeleccionada });
  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert("Producto agregado al carrito. Ahora sube tu diseño.");
  window.location.href = "upload.html";
};

initAuth();
