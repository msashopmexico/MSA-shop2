let auth0Client = null;
let tallaSeleccionada = null;

async function initAuth() {
  try {
    console.log('🔧 Inicializando Auth0...');
    
    // Verificar más específicamente si auth0 está disponible
    if (typeof auth0 === 'undefined' || !auth0.createAuth0Client) {
      console.error('❌ Auth0 SDK no está disponible');
      showAuthError();
      return;
    }

    console.log('✅ Auth0 SDK cargado correctamente');
    
    // Configurar Auth0 con tus credenciales
    auth0Client = await auth0.createAuth0Client({
      domain: "dev-r83h8xsmacihkvil.us.auth0.com",
      client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
      cacheLocation: "localstorage",
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    });

    console.log('✅ Cliente Auth0 creado');
    
    // Manejar callback de redirección
    if (window.location.search.includes("state=") && 
        (window.location.search.includes("code=") || 
         window.location.search.includes("error="))) {
      console.log('🔄 Procesando callback de Auth0...');
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Actualizar UI
    const isAuthenticated = await auth0Client.isAuthenticated();
    console.log('👤 Estado de autenticación:', isAuthenticated);
    updateAuthButtons(isAuthenticated);

  } catch (error) {
    console.error('❌ Error inicializando Auth0:', error);
    showAuthError();
  }
}

function showAuthError() {
  const authButtons = document.querySelector('.auth-buttons');
  if (authButtons) {
    authButtons.innerHTML = `
      <button style="background: #e74c3c; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;" 
              onclick="location.reload()">
        🔄 Recargar (Error Auth0)
      </button>
    `;
  }
}

function updateAuthButtons(isAuthenticated) {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");

  if (!loginBtn || !registerBtn) {
    console.warn('⚠️ Botones de auth no encontrados');
    return;
  }

  if (isAuthenticated) {
    loginBtn.textContent = "Cerrar sesión";
    loginBtn.onclick = () => logout();
    registerBtn.style.display = "none";
    console.log('✅ UI actualizada: usuario autenticado');
  } else {
    loginBtn.textContent = "Iniciar sesión";
    loginBtn.onclick = () => login();
    registerBtn.textContent = "Registrarse";
    registerBtn.onclick = () => login({ authorizationParams: { screen_hint: "signup" } });
    registerBtn.style.display = "inline-block";
    console.log('✅ UI actualizada: usuario no autenticado');
  }
}

async function login(options = {}) {
  if (!auth0Client) {
    alert('❌ Auth0 no está inicializado. Recarga la página.');
    return;
  }
  
  try {
    console.log('🔐 Iniciando proceso de login...');
    await auth0Client.loginWithRedirect(options);
  } catch (error) {
    console.error('❌ Error en login:', error);
    alert('Error al iniciar sesión');
  }
}

async function logout() {
  if (!auth0Client) return;
  
  try {
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  } catch (error) {
    console.error('❌ Error en logout:', error);
  }
}

// Funciones del carrito
function seleccionarTalla(talla) {
  tallaSeleccionada = talla;
  const tallaElement = document.getElementById("tallaSeleccionada");
  if (tallaElement) {
    tallaElement.textContent = talla;
  }
  
  // Resaltar botón seleccionado
  document.querySelectorAll('.tallas button').forEach(btn => {
    btn.classList.remove('seleccionada');
  });
  event.target.classList.add('seleccionada');
  
  console.log(`📏 Talla seleccionada: ${talla}`);
}

async function agregarCarrito() {
  if (!tallaSeleccionada) {
    alert("❌ Selecciona una talla primero.");
    return;
  }

  if (!auth0Client) {
    alert("❌ Error de autenticación. Recarga la página.");
    return;
  }

  try {
    const isAuthenticated = await auth0Client.isAuthenticated();
    if (!isAuthenticated) {
      alert("🔐 Debes iniciar sesión para agregar al carrito.");
      await login();
      return;
    }

    console.log('🛒 Abriendo modal de confirmación');
    document.getElementById("miModal").style.display = "flex";
  } catch (error) {
    console.error('❌ Error en agregarCarrito:', error);
    alert("❌ Error al verificar autenticación");
  }
}

function cerrarModal() {
  document.getElementById("miModal").style.display = "none";
  console.log('❌ Modal cerrado');
}

function irUpload() {
  if (!tallaSeleccionada) {
    alert("Selecciona una talla primero");
    return;
  }
  console.log(`🎨 Redirigiendo a upload con talla: ${tallaSeleccionada}`);
  window.location.href = "upload.html?talla=" + tallaSeleccionada;
}

// Inicializar cuando la página cargue
window.onload = initAuth;

// También inicializar cuando el DOM esté listo como respaldo
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM cargado');
});