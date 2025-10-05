// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbyiT01b_KFXhHuAY00aWybmYVEhuHvsY",
  authDomain: "msa-web-8517b.firebaseapp.com",
  projectId: "msa-web-8517b",
  messagingSenderId: "607379403409"
};

let tallaSeleccionada = null;
let colorSeleccionado = 'blanco';
let authMode = 'login';
let currentUserData = null;

// Función para volver al inicio
function volverAlInicio() {
  const panda = document.querySelector('.panda-decoracion');
  if (panda) {
    panda.style.transform = 'scale(0.9) rotate(-10deg)';
    panda.style.opacity = '0.7';
  }
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 300);
}

// Función para seleccionar color
function seleccionarColor(color) {
  colorSeleccionado = color;
  
  // Actualizar interfaz de colores
  document.querySelectorAll('.color-option').forEach(option => {
    option.classList.remove('seleccionada');
  });
  document.querySelector(`.color-${color}`).classList.add('seleccionada');
  
  // Actualizar texto del color seleccionado
  const colorTexto = {
    'blanco': 'Blanco',
    'negro': 'Negro', 
    'gris': 'Gris'
  };
  document.getElementById('colorSeleccionadoTexto').textContent = `Color: ${colorTexto[color]}`;
  
  // Cambiar imagen del producto según el color
  const productoImg = document.getElementById('productoImg');
  switch(color) {
    case 'blanco':
      productoImg.src = 'img/camisetaLisaBlanca.png';
      break;
    case 'negro':
      productoImg.src = 'img/camisetaLisaNegra.png';
      break;
    case 'gris':
      productoImg.src = 'img/camisetaLisaGris.png';
      break;
  }
  
  console.log(`🎨 Color seleccionado: ${color}`);
}

// Función para seleccionar talla (actualizada)
function seleccionarTalla(talla) {
  tallaSeleccionada = talla;
  
  document.querySelectorAll('.tallas button').forEach(btn => {
    btn.classList.remove('seleccionada');
  });
  event.target.classList.add('seleccionada');
  
  console.log(`📏 Talla seleccionada: ${talla}`);
}

// Función para agregar al carrito (actualizada)
async function agregarCarrito() {
  if (!tallaSeleccionada) {
    alert("❌ Selecciona una talla primero.");
    return;
  }

  if (!colorSeleccionado) {
    alert("❌ Selecciona un color primero.");
    return;
  }

  const user = firebase.auth().currentUser;
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    alert("🔐 Debes iniciar sesión para agregar al carrito.");
    showAuthModal('login');
    return;
  }

  // Actualizar modal de confirmación con color
  const colorTexto = {
    'blanco': 'Blanco',
    'negro': 'Negro',
    'gris': 'Gris'
  };
  
  document.getElementById('confirmColor').textContent = colorTexto[colorSeleccionado];
  document.getElementById('confirmTalla').textContent = tallaSeleccionada;
  document.getElementById('confirmProducto').textContent = 'Camisa Personalizada';

  document.getElementById("miModal").style.display = "flex";
}

// Función para ir a upload (actualizada)
function irUpload() {
  if (!tallaSeleccionada || !colorSeleccionado) {
    alert("Selecciona color y talla primero");
    return;
  }
  
  // Guardar selecciones en localStorage para la página de upload
  localStorage.setItem('colorSeleccionado', colorSeleccionado);
  localStorage.setItem('tallaSeleccionada', tallaSeleccionada);
  
  window.location.href = `upload.html?talla=${tallaSeleccionada}&color=${colorSeleccionado}`;
}

// El resto del código de Firebase se mantiene igual...
async function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado');
    
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('👤 Usuario autenticado:', user.email);
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

function cargarDatosUsuario(uid) {
  const userData = localStorage.getItem(`userData_${uid}`);
  if (userData) {
    currentUserData = JSON.parse(userData);
    console.log('📁 Datos usuario cargados:', currentUserData);
  }
}

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
  document.getElementById('authButtonText').textContent = 
    mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta';
  document.getElementById('authSwitch').textContent = mode === 'login' ? 
    '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión aquí';
  
  document.getElementById('loginFields').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('registerFields').style.display = mode === 'register' ? 'block' : 'none';
  
  document.getElementById('authEmail').value = '';
  document.getElementById('authPassword').value = '';
  
  if (mode === 'register') {
    document.getElementById('authNombre').value = '';
    document.getElementById('authEmailRegistro').value = '';
    document.getElementById('authTelefono').value = '';
    document.getElementById('authDireccion').value = '';
    document.getElementById('authFechaNacimiento').value = '';
    document.getElementById('authPasswordRegistro').value = '';
  }
  
  document.getElementById('authModal').style.display = 'flex';
}

function cerrarAuthModal() {
  document.getElementById('authModal').style.display = 'none';
}

function cerrarModal() {
  document.getElementById("miModal").style.display = "none";
}

function toggleAuthMode() {
  showAuthModal(authMode === 'login' ? 'register' : 'login');
}

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

function validarTelefono(telefono) {
  const regex = /^(\+52\s?)?(\d{10})$/;
  return regex.test(telefono.replace(/\s/g, ''));
}

async function procesarAuth() {
  try {
    if (authMode === 'register') {
      const nombre = document.getElementById('authNombre').value;
      const email = document.getElementById('authEmailRegistro').value;
      const telefono = document.getElementById('authTelefono').value;
      const direccion = document.getElementById('authDireccion').value;
      const fechaNacimiento = document.getElementById('authFechaNacimiento').value;
      const password = document.getElementById('authPasswordRegistro').value;

      if (!nombre || !email || !telefono || !direccion || !fechaNacimiento || !password) {
        alert('❌ Por favor completa todos los campos');
        return;
      }

      if (!email.includes('@')) {
        alert('❌ Por favor ingresa un email válido');
        return;
      }

      if (!validarTelefono(telefono)) {
        alert('❌ Por favor ingresa un número de teléfono válido (10 dígitos)');
        return;
      }

      if (!validarEdad(fechaNacimiento)) {
        alert('❌ Debes tener al menos 13 años para registrarte');
        return;
      }

      if (password.length < 6) {
        alert('❌ La contraseña debe tener al menos 6 caracteres');
        return;
      }

      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const userData = {
        nombre: nombre,
        telefono: telefono,
        direccion: direccion,
        fechaNacimiento: fechaNacimiento,
        email: email,
        fechaRegistro: new Date().toISOString()
      };
      
      guardarDatosUsuario(user.uid, userData);
      alert('✅ ¡Cuenta creada exitosamente!');
      cerrarAuthModal();

    } else {
      const email = document.getElementById('authEmail').value;
      const password = document.getElementById('authPassword').value;

      if (!email || !password) {
        alert('❌ Por favor completa todos los campos');
        return;
      }

      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert('✅ Sesión iniciada correctamente');
      cerrarAuthModal();
    }
    
  } catch (error) {
    console.error('❌ Error auth:', error);
    let errorMessage = 'Error: ' + error.message;
    
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
      case 'auth/network-request-failed':
        errorMessage = 'Error de conexión. Verifica tu internet';
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

// Inicializar
window.onload = initFirebase;