let auth0Client = null;
let tallaSeleccionada = null;

async function initAuth() {
  // VERIFICAR que auth0 está disponible antes de usarlo
  if (typeof auth0 === 'undefined') {
    console.error('Auth0 SDK no cargado. Reintentando...');
    setTimeout(initAuth, 100); // Reintentar después de 100ms
    return;
  }

  try {
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
  } catch (error) {
    console.error('Error inicializando Auth0:', error);
  }
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
  // VERIFICAR que auth0Client existe antes de usarlo
  if (!auth0Client) {
    alert("Sistema de autenticación no disponible. Por favor recarga la página.");
    return;
  }

  if (!tallaSeleccionada) return alert("Selecciona una talla primero.");

  try {
    const logged = await auth0Client.isAuthenticated();
    if (!logged) return alert("Debes iniciar sesión para agregar al carrito.");

    document.getElementById("miModal").style.display = "flex";
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    alert("Error al verificar autenticación");
  }
}

function cerrarModal() {
  document.getElementById("miModal").style.display = "none";
}

function irUpload() {
  window.location.href = "upload.html?talla=" + tallaSeleccionada;
}

// Inicializar cuando la página cargue
window.onload = initAuth;