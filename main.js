let auth0Client = null;
let tallaSeleccionada = null;
let authInitialized = false;

async function initAuth() {
  // Evitar múltiples inicializaciones
  if (authInitialized) return;
  authInitialized = true;

  try {
    console.log('🚀 Iniciando Auth0...');
    
    if (typeof auth0 === 'undefined') {
      console.error('❌ Auth0 SDK no cargado');
      showFallbackAuth();
      return;
    }

    // Configuración para Netlify
    auth0Client = await auth0.createAuth0Client({
      domain: "dev-r83h8xsmacihkvil.us.auth0.com",
      client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
      cacheLocation: "localstorage",
      authorizationParams: {
        redirect_uri: window.location.origin + "/"
      }
    });

    console.log('✅ Cliente Auth0 creado');

    // VERIFICAR SI ESTAMOS EN UN CALLBACK - CORREGIDO
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams = urlParams.has('code') || urlParams.has('error');
    
    if (hasAuthParams) {
      console.log('🔄 Procesando callback de Auth0...');
      try {
        const result = await auth0Client.handleRedirectCallback();
        console.log('✅ Callback exitoso, usuario:', result.user);
        
        // Limpiar URL SIN recargar inmediatamente
        const cleanUrl = window.location.origin + "/";
        window.history.replaceState({}, document.title, cleanUrl);
        
      } catch (error) {
        console.error('❌ Error en callback:', error);
      }
    }

    // Verificar autenticación
    const isAuthenticated = await auth0Client.isAuthenticated();
    console.log('🔐 Usuario autenticado:', isAuthenticated);
    
    updateAuthButtons(isAuthenticated);

  } catch (error) {
    console.error('💥 Error inicializando Auth0:', error);
    showFallbackAuth();
  }
}

function showFallbackAuth() {
  console.log('🔧 Usando autenticación local');
  let loggedIn = localStorage.getItem('userLoggedIn') === 'true';
  let userEmail = localStorage.getItem('userEmail') || 'Usuario';
  
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");
  
  if (!loginBtn || !registerBtn) return;
  
  if (loggedIn) {
    loginBtn.textContent = `Cerrar (${userEmail})`;
    loginBtn.onclick = () => {
      localStorage.setItem('userLoggedIn', 'false');
      showFallbackAuth();
      alert('👋 Sesión cerrada');
    };
    registerBtn.style.display = "none";
  } else {
    loginBtn.textContent = "Iniciar sesión";
    loginBtn.onclick = () => {
      const email = prompt('📧 Email (modo desarrollo):', 'cliente@msashop.com');
      if (email) {
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        showFallbackAuth();
        alert(`✅ Sesión iniciada como: ${email}`);
      }
    };
    registerBtn.textContent = "Registrarse";
    registerBtn.onclick = () => {
      const email = prompt('📧 Email para registro:', 'nuevo@msashop.com');
      if (email) {
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        showFallbackAuth();
        alert(`✅ Cuenta creada: ${email}`);
      }
    };
    registerBtn.style.display = "inline-block";
  }
}

function updateAuthButtons(isAuthenticated) {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");

  if (!loginBtn || !registerBtn) return;

  if (isAuthenticated) {
    loginBtn.textContent = "Cerrar sesión";
    loginBtn.onclick = () => logout();
    registerBtn.style.display = "none";
    console.log('✅ Botones: Usuario autenticado');
  } else {
    loginBtn.textContent = "Iniciar sesión";
    loginBtn.onclick = () => login();
    registerBtn.textContent = "Registrarse";
    registerBtn.onclick = () => register();
    registerBtn.style.display = "inline-block";
    console.log('✅ Botones: Usuario no autenticado');
  }
}

async function login() {
  if (!auth0Client) {
    alert('⚠️ Redirigiendo a Auth0...');
    // Fallback directo a Auth0
    window.location.href = `https://dev-r83h8xsmacihkvil.us.auth0.com/authorize?response_type=code&client_id=PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf&redirect_uri=${encodeURIComponent('https://msa-shop.netlify.app/')}`;
    return;
  }

  try {
    console.log('🔐 Iniciando flujo de login...');
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: 'https://msa-shop.netlify.app/'
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    // Fallback manual
    window.location.href = `https://dev-r83h8xsmacihkvil.us.auth0.com/authorize?response_type=code&client_id=PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf&redirect_uri=${encodeURIComponent('https://msa-shop.netlify.app/')}`;
  }
}

async function register() {
  if (!auth0Client) {
    alert('⚠️ Redirigiendo a registro Auth0...');
    window.location.href = `https://dev-r83h8xsmacihkvil.us.auth0.com/authorize?response_type=code&client_id=PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf&redirect_uri=${encodeURIComponent('https://msa-shop.netlify.app/')}&screen_hint=signup`;
    return;
  }

  try {
    console.log('📝 Iniciando flujo de registro...');
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        redirect_uri: 'https://msa-shop.netlify.app/'
      }
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    window.location.href = `https://dev-r83h8xsmacihkvil.us.auth0.com/authorize?response_type=code&client_id=PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf&redirect_uri=${encodeURIComponent('https://msa-shop.netlify.app/')}&screen_hint=signup`;
  }
}

async function logout() {
  if (!auth0Client) {
    // Limpiar modo local
    localStorage.setItem('userLoggedIn', 'false');
    showFallbackAuth();
    return;
  }

  try {
    await auth0Client.logout({
      logoutParams: {
        returnTo: 'https://msa-shop.netlify.app/'
      }
    });
  } catch (error) {
    console.error('❌ Error en logout:', error);
  }
}

// Funciones del carrito - MEJORADAS
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
    alert("❌ Por favor selecciona una talla primero.");
    return;
  }

  // Verificar autenticación de forma más robusta
  let isAuthenticated = false;
  
  if (auth0Client) {
    try {
      isAuthenticated = await auth0Client.isAuthenticated();
    } catch (error) {
      console.log('⚠️ Fallback a autenticación local');
      isAuthenticated = localStorage.getItem('userLoggedIn') === 'true';
    }
  } else {
    isAuthenticated = localStorage.getItem('userLoggedIn') === 'true';
  }

  if (!isAuthenticated) {
    alert("🔐 Debes iniciar sesión para agregar productos al carrito.");
    
    if (auth0Client) {
      if (confirm('¿Quieres iniciar sesión con Auth0?')) {
        await login();
      }
    } else {
      if (confirm('¿Iniciar sesión en modo desarrollo?')) {
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', 'cliente@msashop.com');
        showFallbackAuth();
        // Reintentar después de login
        setTimeout(() => agregarCarrito(), 500);
      }
    }
    return;
  }

  // Si está autenticado, mostrar modal
  console.log('🛒 Abriendo modal de confirmación');
  document.getElementById("miModal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("miModal").style.display = "none";
  console.log('❌ Modal cerrado');
}

function irUpload() {
  if (!tallaSeleccionada) {
    alert("⚠️ Por favor selecciona una talla primero.");
    return;
  }
  console.log(`🎨 Redirigiendo a upload con talla: ${tallaSeleccionada}`);
  window.location.href = "upload.html?talla=" + encodeURIComponent(tallaSeleccionada);
}

// Inicialización mejorada
window.addEventListener('load', function() {
  console.log('📄 Página cargada, inicializando Auth...');
  initAuth();
});

// También inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 DOM listo');
});