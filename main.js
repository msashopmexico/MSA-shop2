let auth0Client = null;
let tallaSeleccionada = null;
let auth0RetryCount = 0;
const MAX_RETRIES = 10;

async function initAuth() {
  // Verificar si auth0 está disponible
  if (typeof auth0 === 'undefined') {
    auth0RetryCount++;
    
    if (auth0RetryCount >= MAX_RETRIES) {
      console.error('Auth0 SDK no se pudo cargar después de ' + MAX_RETRIES + ' intentos');
      showAuth0Error();
      return;
    }
    
    console.log('Auth0 SDK no cargado. Reintentando... (' + auth0RetryCount + '/' + MAX_RETRIES + ')');
    setTimeout(initAuth, 500); // Aumentar el tiempo de espera
    return;
  }

  try {
    // Resetear contador cuando se carga correctamente
    auth0RetryCount = 0;
    
    // Crea el cliente Auth0
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
    showAuth0Error();
  }
}

function showAuth0Error() {
  // Mostrar mensaje de error al usuario
  const authButtons = document.querySelector('.auth-buttons');
  if (authButtons) {
    authButtons.innerHTML = '<span style="color: red;">Error de autenticación</span>';
  }
}

function updateAuthButtons(logged) {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");

  if (!loginBtn || !registerBtn) return;

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
  const tallaElement = document.getElementById("tallaSeleccionada");
  if (tallaElement) {
    tallaElement.textContent = talla;
  }
}

async function agregarCarrito() {
  if (!tallaSeleccionada) {
    alert("Selecciona una talla primero.");
    return;
  }

  if (!auth0Client) {
    alert("Sistema de autenticación no disponible. Por favor inicia sesión manualmente.");
    // Redirigir a login manualmente
    window.location.href = `https://dev-r83h8xsmacihkvil.us.auth0.com/authorize?client_id=PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code`;
    return;
  }

  try {
    const logged = await auth0Client.isAuthenticated();
    if (!logged) {
      alert("Debes iniciar sesión para agregar al carrito.");
      await auth0Client.loginWithRedirect();
      return;
    }

    const modal = document.getElementById("miModal");
    if (modal) {
      modal.style.display = "flex";
    }
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    alert("Error al verificar autenticación. Por favor recarga la página.");
  }
}

function cerrarModal() {
  const modal = document.getElementById("miModal");
  if (modal) {
    modal.style.display = "none";
  }
}

function irUpload() {
  window.location.href = "upload.html?talla=" + tallaSeleccionada;
}

// Inicializar cuando la página cargue
window.onload = initAuth;

// También intentar inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Si window.onload no se disparó, intentar initAuth
  if (!auth0Client && typeof auth0 !== 'undefined') {
    initAuth();
  }
});