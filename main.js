let auth0Client = null;
let tallaSeleccionada = null;

// Función para esperar a que Auth0 se cargue
function waitForAuth0() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      if (typeof auth0 !== 'undefined') {
        clearInterval(check);
        resolve(auth0);
      } else if (attempts > 50) { // 5 segundos máximo
        clearInterval(check);
        reject(new Error('Auth0 no se cargó'));
      }
    }, 100);
  });
}

async function initAuth() {
  try {
    console.log('🔧 Inicializando Auth0...');
    
    // Esperar a que Auth0 se cargue
    await waitForAuth0();
    console.log('✅ Auth0 SDK cargado');

    // Configurar Auth0
    auth0Client = await auth0.createAuth0Client({
      domain: "dev-r83h8xsmacihkvil.us.auth0.com",
      client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
      cacheLocation: "localstorage",
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    });

    console.log('✅ Cliente Auth0 creado');

    // Manejar callback después del login
    if (window.location.search.includes('code=')) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Actualizar UI
    const isAuthenticated = await auth0Client.isAuthenticated();
    updateAuthButtons(isAuthenticated);

  } catch (error) {
    console.error('❌ Error inicializando Auth0:', error);
    // Modo desarrollo - funcionamiento sin Auth0
    setupFallbackAuth();
  }
}

function setupFallbackAuth() {
  console.log('🔧 Usando modo desarrollo (sin Auth0)');
  let loggedIn = false;
  
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");
  
  if (!loginBtn || !registerBtn) return;
  
  loginBtn.textContent = "Iniciar sesión";
  loginBtn.onclick = () => {
    loggedIn = true;
    updateAuthButtons(true);
    alert('✅ Sesión iniciada (modo desarrollo)');
  };
  
  registerBtn.textContent = "Registrarse";
  registerBtn.onclick = () => {
    loggedIn = true;
    updateAuthButtons(true);
    alert('✅ Registro exitoso (modo desarrollo)');
  };
  
  updateAuthButtons(loggedIn);
}

function updateAuthButtons(isAuthenticated) {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");

  if (!loginBtn || !registerBtn) return;

  if (isAuthenticated && auth0Client) {
    loginBtn.textContent = "Cerrar sesión";
    loginBtn.onclick = () => auth0Client.logout({
      logoutParams: { returnTo: window.location.origin }
    });
    registerBtn.style.display = "none";
  } else if (isAuthenticated) {
    // Modo desarrollo
    loginBtn.textContent = "Cerrar sesión";
    loginBtn.onclick = () => {
      updateAuthButtons(false);
      alert('Sesión cerrada');
    };
    registerBtn.style.display = "none";
  } else {
    loginBtn.textContent = "Iniciar sesión";
    registerBtn.textContent = "Registrarse";
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
  
  // Resaltar botón seleccionado
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

  // Si Auth0 no está disponible, usar modo desarrollo
  if (!auth0Client) {
    document.getElementById("miModal").style.display = "flex";
    return;
  }

  try {
    const isAuthenticated = await auth0Client.isAuthenticated();
    if (!isAuthenticated) {
      alert("🔐 Debes iniciar sesión para agregar al carrito.");
      await auth0Client.loginWithRedirect();
      return;
    }

    document.getElementById("miModal").style.display = "flex";
  } catch (error) {
    console.error('Error:', error);
    alert("Error de autenticación");
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
  // Guardar la talla en localStorage para la página de upload
  localStorage.setItem('tallaSeleccionada', tallaSeleccionada);
  window.location.href = "upload.html?talla=" + tallaSeleccionada;
}

// Inicializar
window.onload = initAuth;