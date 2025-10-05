import { createAuth0Client } from "https://cdn.jsdelivr.net/npm/@auth0/auth0-spa-js@2/dist/auth0-spa-js.production.js";

let auth0 = null;
let userProfile = null;
let tallaSeleccionada = null;

window.onload = async () => {
  auth0 = await createAuth0Client({
    domain: "dev-r83h8xsmacihkvil.us.auth0.com",
    client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
    cacheLocation: "localstorage",
    redirect_uri: window.location.origin
  });

  // Manejar redirección de login
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  const isAuthenticated = await auth0.isAuthenticated();
  if (isAuthenticated) {
    userProfile = await auth0.getUser();
    document.getElementById("btn-login").style.display = "none";
    document.getElementById("btn-logout").style.display = "inline-block";
  }

  // Botones
  document.getElementById("btn-login").addEventListener("click", () => auth0.loginWithRedirect());
  document.getElementById("btn-logout").addEventListener("click", () => auth0.logout({ returnTo: window.location.origin }));
}

// Seleccionar talla
window.seleccionarTalla = (talla) => {
  tallaSeleccionada = talla;
  alert("Talla seleccionada: " + talla);
}

// Agregar al carrito
window.agregarCarrito = () => {
  if (!tallaSeleccionada) {
    alert("Selecciona una talla antes de continuar.");
    return;
  }
  if (!userProfile) {
    alert("Debes iniciar sesión para agregar productos al carrito.");
    auth0.loginWithRedirect();
    return;
  }
  localStorage.setItem("productoTemp", JSON.stringify({ nombre:"Camiseta Lisa Negra", precio:250, talla:tallaSeleccionada }));
  window.location.href = "upload.html";
}
