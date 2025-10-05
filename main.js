// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbyiT01b_KFXhHuAY00aWybmYVEhuHvsY",
  authDomain: "msa-web-8517b.firebaseapp.com",
  projectId: "msa-web-8517b",
  messagingSenderId: "607379403409"
};

let tallaSeleccionada = null;
let authMode = 'login';
let currentUserData = null;

// Inicializar Firebase
function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado');
    
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('👤 Usuario autenticado:', user.email);
        // Cargar datos adicionales del usuario
        cargarDatosUsuario(user.uid);
        updateAuthUI(true, user.email);
      } else {
        console.log('🔐 Usuario no autenticado');
        updateAuthUI(false);
      }
    });
    
  } catch (error) {
    console.error('❌ Error Firebase:', error);
    setupLocalAuth();
  }
}

// Cargar datos adicionales del usuario desde localStorage
function cargarDatosUsuario(uid) {
  const userData = localStorage.getItem(`userData_${uid}`);
  if (userData) {
    currentUserData = JSON.parse(userData);
    console.log('📁 Datos usuario cargados:', currentUserData);
  }
}

// Guardar datos adicionales del usuario
function guardarDatosUsuario(uid, userData) {
  localStorage.setItem(`userData_${uid}`, JSON.stringify(userData));
  currentUserData = userData;
}

function updateAuthUI(isLoggedIn, userEmail = '') {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");

  if (!loginBtn || !registerBtn) return;

  if (isLoggedIn) {
    const nombre = currentUserData?.nombre || userEmail.split('@')[0];
    loginBtn.textContent = `Cerrar (${nombre})`;
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
  
  // Mostrar/ocultar campos según el modo
  document.getElementById('loginFields').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('registerFields').style.display = mode === 'register' ? 'block' : 'none';
  
  // Limpiar campos
  document.getElementById('authEmail').value = '';
  document.getElementById('authPassword').value = '';
  document.getElementById('authNombre').value = '';
  document.getElementById('authDireccion').value = '';
  document.getElementById('authFechaNacimiento').value = '';
  
  document.getElementById('authModal').style.display = 'flex';
}

function cerrarAuthModal() {
  document.getElementById('authModal').style.display = 'none';
}

function toggleAuthMode() {
  showAuthModal(authMode === 'login' ? 'register' : 'login');
}

// Validar edad (mínimo 13 años)
function validarEdad(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad >= 13;
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
      // VALIDACIONES PARA REGISTRO
      const nombre = document.getElementById('authNombre').value;
      const direccion = document.getElementById('authDireccion').value;
      const fechaNacimiento = document.getElementById('authFechaNacimiento').value;

      if (!nombre || !direccion || !fechaNacimiento) {
        alert('❌ Por favor completa todos los campos del registro');
        return;
      }

      // Validar edad mínima
      if (!validarEdad(fechaNacimiento)) {
        alert('❌ Debes tener al menos 13 años para registrarte');
        return;
      }

      // Crear usuario en Firebase
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Guardar datos adicionales del usuario
      const userData = {
        nombre: nombre,
        direccion: direccion,
        fechaNacimiento: fechaNacimiento,
        email: email,
        fechaRegistro: new Date().toISOString()
      };
      
      guardarDatosUsuario(user.uid, userData);
      alert('✅ ¡Cuenta creada exitosamente!');

    } else {
      // LOGIN
      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert('✅ Sesión iniciada correctamente');
    }
    
    cerrarAuthModal();
  } catch (error) {
    console.error('❌ Error auth:', error);
    let errorMessage = 'Error: ' + error.message;
    
    // Mensajes de error más amigables
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
    }
    
    alert('❌ ' + errorMessage);
  }
}

async function logout() {
  try {
    await firebase.auth().signOut();
    currentUserData = null;
    alert('👋 Sesión cerrada');
  } catch (error) {
    console.error('Error logout:', error);
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

  const user = firebase.auth().currentUser;
  const isAuthenticated = !!user;

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

// Sistema de respaldo local
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
  if (mode === 'login') {
    const email = prompt('📧 Email:');
    const password = prompt('🔒 Contraseña:');
    if (email && password) {
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      setupLocalAuth();
      alert('✅ Sesión iniciada (modo local)');
    }
  } else {
    // Registro local con validaciones
    const nombre = prompt('👤 Nombre completo:');
    if (!nombre) return;
    
    const email = prompt('📧 Email:');
    if (!email) return;
    
    const direccion = prompt('🏠 Dirección completa:');
    if (!direccion) return;
    
    const fechaNacimiento = prompt('🎂 Fecha de nacimiento (YYYY-MM-DD):');
    if (!fechaNacimiento) return;
    
    // Validar edad localmente
    if (!validarEdad(fechaNacimiento)) {
      alert('❌ Debes tener al menos 13 años para registrarte');
      return;
    }
    
    const password = prompt('🔒 Contraseña:');
    if (password) {
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userNombre', nombre);
      localStorage.setItem('userDireccion', direccion);
      localStorage.setItem('userFechaNacimiento', fechaNacimiento);
      setupLocalAuth();
      alert('✅ Cuenta creada (modo local)');
    }
  }
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
    font-family: inherit;
  }
  .auth-input:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
  }
  #registerFields {
    transition: all 0.3s ease;
  }
`;
document.head.appendChild(style);

// Inicializar
window.onload = initFirebase;