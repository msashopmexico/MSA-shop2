let auth0Client = null;
let tallaSeleccionada = null;

async function initAuth() {
  // Crea el cliente Auth0 usando el objeto global "auth0"
  auth0Client = await auth0.createAuth0Client({
    domain: "dev-r83h8xsmacihkvil.us.auth0.com",
    client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
    cacheLocation: "localstorage",
    redirect_uri: window.location.origin
  });

  // Maneja callback de redirección
  if (window.location.search.includes("code=")) {
    await auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  const logged = await auth0Client.isAuthenticated();
  updateAuthButtons(logged);
}

function updateAuthButtons(logged) {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");

  if (logged) {
    loginBtn.textContent = "Cerrar sesión";
    loginBtn.onclick = () => auth0Client.logout({ returnTo: window.location.origin });
    registerBtn.style.display = "none";
  } else {
    loginBtn.textContent = "Iniciar sesión";
    loginBtn.onclick = () => auth0Client.loginWithRedirect();
    registerBtn.textContent = "Registrarse";
    registerBtn.onclick = () => auth0Client.loginWithRedirect({ screen_hint: "signup" });
    registerBtn.style.display = "inline-block";
  }
}

// Funciones del carrito
function seleccionarTalla(talla) {
  tallaSeleccionada = talla;
  document.getElementById("tallaSeleccionada").textContent = talla;
}

async function agregarCarrito() {
  if (!tallaSeleccionada) return alert("Selecciona una talla primero.");

  const logged = await auth0Client.isAuthenticated();
  if (!logged) return alert("Debes iniciar sesión para agregar al carrito.");

  document.getElementById("miModal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("miModal").style.display = "none";
}

function irUpload() {
  window.location.href = "upload.html?talla=" + tallaSeleccionada;
}

window.onload = initAuth;
