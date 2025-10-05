let auth0Client = null;
let tallaSeleccionada = null;

async function initAuth() {
  try {
    console.log('🚀 Iniciando Auth0...');
    
    // Verificar que Auth0 está cargado
    if (typeof auth0 === 'undefined') {
      console.error('❌ Auth0 SDK no cargado');
      showError('Auth0 no disponible. Recarga la página.');
      return;
    }

    console.log('✅ Auth0 SDK detectado');

    // Configuración CORRECTA para Netlify
    auth0Client = await auth0.createAuth0Client({
      domain: "dev-r83h8xsmacihkvil.us.auth0.com",
      client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
      cacheLocation: "localstorage",
      authorizationParams: {
        redirect_uri: "https://msa-shop.netlify.app"
      }
    });

    console.log('✅ Cliente Auth0 creado');

    // Manejar el callback después del login
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      console.log('🔄 Procesando callback de login...');
      try {
        await auth0Client.handleRedirectCallback();
        console.log('✅ Login exitoso, limpiando URL...');
        // Limpiar la URL después del login
        window.history.replaceState({}, document.title, "/");
      } catch (error) {
        console.error('❌ Error en callback:', error);
      }
    }

    // Verificar estado de autenticación
    const isAuthenticated = await auth0Client.isAuthenticated();
    console.log('🔐 Usuario autenticado:', isAuthenticated);
    
    updateAuthButtons(isAuthenticated);

  } catch (error) {
    console.error('💥 Error crítico:', error);
    showError('Error de autenticación. Usando modo seguro.');
    setupFallbackMode();
  }
}

function showError(message) {
  console.error('❌', message);
}

function setupFallbackMode() {
  console.log('🔧 Activando modo de respaldo...');
  // Aquí podrías mostrar botones alternativos si quieres
}

function updateAuthButtons(isAuthenticated) {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");

  if (!loginBtn || !registerBtn) {
    console.warn('⚠️ Botones no encontrados');
    return;
  }

  if (isAuthenticated) {
    // Usuario LOGUEADO
    loginBtn.textContent = "Cerrar sesión";
    loginBtn.onclick = () => logout();
    registerBtn.style.display = "none";
    console.log('✅ UI: Usuario autenticado');
  } else {
    // Usuario NO logueado
    loginBtn.textContent = "Iniciar sesión";
    loginBtn.onclick = () => login();
    registerBtn.textContent = "Registrarse";
    registerBtn.onclick = () => register();
    registerBtn.style.display = "inline-block";
    console.log('✅ UI: Usuario no autenticado');
  }
}

async function login() {
  if (!auth0Client) {
    alert('⚠️ Sistema de autenticación no disponible');
    return;
  }

  try {
    console.log('🔐 Iniciando login...');
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: "https://msa-shop.netlify.app"
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    alert('Error al iniciar sesión');
  }
}

async function register() {
  if (!auth0Client) {
    alert('⚠️ Sistema de autenticación no disponible');
    return;
  }

  try {
    console.log('📝 Iniciando registro...');
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        redirect_uri: "https://msa-shop.netlify.app"
      }
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    alert('Error en el registro');
  }
}

async function logout() {
  if (!auth0Client) return;

  try {
    await auth0Client.logout({
      logoutParams: {
        returnTo: "https://msa-shop.netlify.app"
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
  
  document.querySelectorAll('.tallas button').forEach(btn => {
    btn.classList.remove('seleccionada');
  });
  event.target.classList.add('seleccionada');
}

async function agregarCarrito() {
  if (!tallaSeleccionada) {
    alert("❌ Selecciona una talla primero.");
    return;
  }

  if (!auth0Client) {
    alert("❌ Error de sistema. Recarga la página.");
    return;
  }

  try {
    const isAuthenticated = await auth0Client.isAuthenticated();
    
    if (!isAuthenticated) {
      alert("🔐 Debes iniciar sesión para agregar al carrito.");
      await login();
      return;
    }

    document.getElementById("miModal").style.display = "flex";
  } catch (error) {
    console.error('❌ Error en agregarCarrito:', error);
    alert("Error al verificar autenticación");
  }
}

function cerrarModal() {
  document.getElementById("miModal").style.display = "none";
}

function irUpload() {
  if (!tallaSeleccionada) {
    alert("Selecciona una talla primero");
    return;
  }
  window.location.href = "upload.html?talla=" + tallaSeleccionada;
}

// Inicializar cuando la página cargue
window.onload = initAuth;