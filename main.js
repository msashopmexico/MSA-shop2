// Firebase Configuration - USA TUS CREDENCIALES EXISTENTES
const firebaseConfig = {
  apiKey: "AIzaSyBLicSBL_Lua8LSol5Retp1NIrNnjycpRw",
  authDomain: "msa-shop-f6215.firebaseapp.com",
  projectId: "msa-shop-f6215",
  storageBucket: "msa-shop-f6215.appspot.com",
  messagingSenderId: "519359225705",
  appId: "1:519359225705:web:388d485eb324427b1c67f8"
};

let tallaSeleccionada = null;
let authMode = 'login'; // 'login' or 'register'

// Inicializar Firebase
function initFirebase() {
  try {
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado');
    
    // Escuchar cambios de autenticación
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // Usuario logueado
        console.log('👤 Usuario autenticado:', user.email);
        updateAuthUI(true, user.email);
      } else {
        // Usuario no logueado
        console.log('🔐 Usuario no autenticado');
        updateAuthUI(false);
      }
    });
    
  } catch (error) {
    console.error('❌ Error Firebase:', error);
    setupLocalAuth();
  }
}

function updateAuthUI(isLoggedIn, userEmail = '') {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");

  if (!loginBtn || !registerBtn) return;

  if (isLoggedIn) {
    loginBtn.textContent = `Cerrar (${userEmail})`;
    loginBtn.onclick = () => logout();
    registerBtn.style.display = "none";
  } else {
    loginBtn.textContent = "Iniciar sesión";
    loginBtn.onclick = () => showAuthModal('login');
    registerBtn.textContent = "Registrarse";
    registerBtn.onclick = () => showAuthModal('register');
    registerBtn.style.display = "inline-block";
  }
}

function showAuthModal(mode) {
  authMode = mode;
  document.getElementById('authTitle').textContent = 
    mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta';
  document.getElementById('authSwitch').textContent = mode === 'login' ? 
    '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión aquí';
  
  // Limpiar campos
  document.getElementById('authEmail').value = '';
  document.getElementById('authPassword').value = '';
  
  document.getElementById('authModal').style.display = 'flex';
}

function cerrarAuthModal() {
  document.getElementById('authModal').style.display = 'none';
}

function toggleAuthMode() {
  showAuthModal(authMode === 'login' ? 'register' : 'login');
}

async function procesarAuth() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  if (!email || !password) {
    alert('❌ Por favor completa todos los campos');
    return;
  }

  try {
    if (authMode === 'register') {
      // REGISTRO con Firebase
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      alert('✅ ¡Cuenta creada exitosamente!');
    } else {
      // LOGIN con Firebase
      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert('✅ Sesión iniciada correctamente');
    }
    cerrarAuthModal();
  } catch (error) {
    console.error('❌ Error auth:', error);
    
    // Mensajes de error amigables
    let errorMessage = 'Error desconocido';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Este email ya está registrado';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/weak-password':
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/user-not-found':
        errorMessage = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      default:
        errorMessage = error.message;
    }
    
    alert('❌ ' + errorMessage);
  }
}

async function logout() {
  try {
    await firebase.auth().signOut();
    alert('👋 Sesión cerrada');
  } catch (error) {
    console.error('Error logout:', error);
  }
}

// Sistema de respaldo local (por si Firebase falla)
function setupLocalAuth() {
  console.log('🔧 Usando autenticación local');
  let loggedIn = localStorage.getItem('userLoggedIn') === 'true';
  let userEmail = localStorage.getItem('userEmail') || '';
  
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");
  
  if (!loginBtn || !registerBtn) return;
  
  if (loggedIn) {
    loginBtn.textContent = `Cerrar (${userEmail})`;
    loginBtn.onclick = () => {
      localStorage.setItem('userLoggedIn', 'false');
      setupLocalAuth();
      alert('Sesión cerrada');
    };
    registerBtn.style.display = "none";
  } else {
    loginBtn.textContent = "Iniciar sesión";
    loginBtn.onclick = () => showLocalAuth('login');
    registerBtn.textContent = "Registrarse";
    registerBtn.onclick = () => showLocalAuth('register');
    registerBtn.style.display = "inline-block";
  }
}

function showLocalAuth(mode) {
  const email = prompt('📧 Email:');
  if (!email) return;

  if (mode === 'login') {
    const password = prompt('🔒 Contraseña:');
    if (password) {
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      setupLocalAuth();
      alert('✅ Sesión iniciada (modo local)');
    }
  } else {
    const password = prompt('🔒 Crea una contraseña:');
    if (password) {
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      setupLocalAuth();
      alert('✅ Cuenta creada (modo local)');
    }
  }
}

// Funciones del carrito
function seleccionarTalla(talla) {
  tallaSeleccionada = talla;
  document.getElementById("tallaSeleccionada").textContent = talla;
  
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

  // Verificar autenticación (Firebase o local)
  let isAuthenticated = false;
  
  if (firebase.auth) {
    try {
      const user = firebase.auth().currentUser;
      isAuthenticated = !!user;
    } catch (error) {
      isAuthenticated = localStorage.getItem('userLoggedIn') === 'true';
    }
  } else {
    isAuthenticated = localStorage.getItem('userLoggedIn') === 'true';
  }

  if (!isAuthenticated) {
    alert("🔐 Debes iniciar sesión para agregar al carrito.");
    showAuthModal('login');
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
  window.location.href = "upload.html?talla=" + tallaSeleccionada;
}

// CSS para inputs auth
const style = document.createElement('style');
style.textContent = `
  .auth-input {
    width: 100%; 
    padding: 12px; 
    margin: 10px 0; 
    border-radius: 8px; 
    border: 1px solid #ddd;
    font-size: 16px;
    box-sizing: border-box;
  }
  .auth-input:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
  }
`;
document.head.appendChild(style);

// Inicializar cuando la página cargue
window.onload = function() {
  initFirebase();
};