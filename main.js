// Firebase Configuration - TUS CREDENCIALES NUEVAS
const firebaseConfig = {
  apiKey: "AIzaSyAbyiT01b_KFXhHuAY00aWybmYVEhuHvsY",
  authDomain: "msa-web-8517b.firebaseapp.com",
  projectId: "msa-web-8517b",
  storageBucket: "msa-web-8517b.appspot.com", // Si no tienes este, usa el default
  messagingSenderId: "607379403409",
  appId: "1:607379403409:web:tu-app-id" // Si no tienes este, coméntalo
};

let tallaSeleccionada = null;
let authMode = 'login';

// Inicializar Firebase
function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado');
    
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('👤 Usuario autenticado:', user.email);
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
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      alert('✅ ¡Cuenta creada exitosamente!');
    } else {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert('✅ Sesión iniciada correctamente');
    }
    cerrarAuthModal();
  } catch (error) {
    console.error('❌ Error auth:', error);
    let errorMessage = 'Error: ' + error.message;
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
`;
document.head.appendChild(style);

// Inicializar
window.onload = initFirebase;