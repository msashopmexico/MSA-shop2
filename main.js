let auth0Client = null;
let tallaSeleccionada = null;

async function initAuth() {
  try {
    console.log('🔧 Inicializando Auth0...');
    
    // Esperar a que Auth0 se cargue
    if (typeof auth0 === 'undefined') {
      console.error('Auth0 no disponible');
      setupFallbackAuth();
      return;
    }

    // Configurar Auth0 para Netlify
    auth0Client = await auth0.createAuth0Client({
      domain: "dev-r83h8xsmacihkvil.us.auth0.com",
      client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
      cacheLocation: "localstorage",
      authorizationParams: {
        redirect_uri: "https://msa-shop.netlify.app"
      }
    });

    console.log('✅ Cliente Auth0 creado');

    // MANEJO MEJORADO del callback después del login
    if (window.location.search.includes('code=')) {
      console.log('🔄 Detectado callback de Auth0, procesando...');
      try {
        const { appState } = await auth0Client.handleRedirectCallback();
        console.log('✅ Login exitoso, redirigiendo...');
        
        // Limpiar URL
        window.history.replaceState({}, document.title, "/");
        
        // Redirigir a página principal
        window.location.href = "https://msa-shop.netlify.app";
        
      } catch (error) {
        console.error('Error en callback:', error);
      }
      return;
    }

    // Verificar si ya está autenticado
    const isAuthenticated = await auth0Client.isAuthenticated();
    console.log('👤 Usuario autenticado:', isAuthenticated);
    updateAuthButtons(isAuthenticated);

  } catch (error) {
    console.error('❌ Error inicializando Auth0:', error);
    setupFallbackAuth();
  }
}

function setupFallbackAuth() {
  console.log('🔧 Usando modo desarrollo');
  let loggedIn = localStorage.getItem('dev_logged_in') === 'true';
  
  updateAuthButtons(loggedIn);
}

function updateAuthButtons(isAuthenticated) {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");

  if (!loginBtn || !registerBtn) return;

  if (isAuthenticated) {
    if (auth0Client) {
      // Modo Auth0 real
      loginBtn.textContent = "Cerrar sesión";
      loginBtn.onclick = () => auth0Client.logout({
        logoutParams: { 
          returnTo: "https://msa-shop.netlify.app" 
        }
      });
    } else {
      // Modo desarrollo
      loginBtn.textContent = "Cerrar sesión";
      loginBtn.onclick = () => {
        localStorage.setItem('dev_logged_in', 'false');
        updateAuthButtons(false);
        alert('Sesión cerrada');
      };
    }
    registerBtn.style.display = "none";
  } else {
    if (auth0Client) {
      // Modo Auth0 real
      loginBtn.textContent = "Iniciar sesión";
      loginBtn.onclick = () => login();
      registerBtn.textContent = "Registrarse";
      registerBtn.onclick = () => login({ 
        authorizationParams: { screen_hint: "signup" } 
      });
    } else {
      // Modo desarrollo
      loginBtn.textContent = "Iniciar sesión";
      loginBtn.onclick = () => {
        localStorage.setItem('dev_logged_in', 'true');
        updateAuthButtons(true);
        alert('✅ Sesión iniciada (modo desarrollo)');
      };
      registerBtn.textContent = "Registrarse";
      registerBtn.onclick = () => {
        localStorage.setItem('dev_logged_in', 'true');
        updateAuthButtons(true);
        alert('✅ Registro exitoso (modo desarrollo)');
      };
    }
    registerBtn.style.display = "inline-block";
  }
}

async function login(options = {}) {
  if (!auth0Client) {
    alert('Auth0 no disponible');
    return;
  }
  
  try {
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: "https://msa-shop.netlify.app",
        ...options.authorizationParams
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
  }
}

// Funciones del carrito (sin cambios)
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

  // Verificar autenticación
  let isAuthenticated = false;
  
  if (auth0Client) {
    try {
      isAuthenticated = await auth0Client.isAuthenticated();
    } catch (error) {
      console.error('Error verificando auth:', error);
    }
  } else {
    // Modo desarrollo
    isAuthenticated = localStorage.getItem('dev_logged_in') === 'true';
  }

  if (!isAuthenticated) {
    alert("🔐 Debes iniciar sesión para agregar al carrito.");
    if (auth0Client) {
      await login();
    } else {
      // En modo desarrollo, simular login
      localStorage.setItem('dev_logged_in', 'true');
      updateAuthButtons(true);
    }
    return;
  }

  document.getElementById("miModal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("miModal").style.display = "none";
}

function irUpload() {
  if (!tallaSeleccionada) {
    alert("Selecciona una talla primero");
    return;
  }
  localStorage.setItem('tallaSeleccionada', tallaSeleccionada);
  window.location.href = "upload.html?talla=" + tallaSeleccionada;
}

// Inicializar
window.onload = initAuth;