let tallaSeleccionada = null;
let client = null;
let account = null;
let isLoginMode = true;

// Inicializar AppWrite
function initAppWrite() {
    try {
        client = new Appwrite.Client();
        client
            .setEndpoint('https://cloud.appwrite.io/v1') // Usa tu endpoint
            .setProject('TU_PROJECT_ID'); // Reemplaza con tu Project ID

        account = new Appwrite.Account(client);
        
        // Verificar si ya está logueado
        checkAuthStatus();
        
    } catch (error) {
        console.error('Error AppWrite:', error);
        setupLocalAuth();
    }
}

async function checkAuthStatus() {
    try {
        const user = await account.get();
        updateAuthButtons(true, user.email);
    } catch (error) {
        updateAuthButtons(false);
    }
}

function updateAuthButtons(isAuthenticated, userEmail = '') {
    const loginBtn = document.querySelector(".btn-login");
    const registerBtn = document.querySelector(".btn-register");

    if (!loginBtn || !registerBtn) return;

    if (isAuthenticated) {
        loginBtn.textContent = `Cerrar (${userEmail})`;
        loginBtn.onclick = () => logout();
        registerBtn.style.display = "none";
    } else {
        loginBtn.textContent = "Iniciar sesión";
        loginBtn.onclick = () => showAuthModal(true);
        registerBtn.textContent = "Registrarse";
        registerBtn.onclick = () => showAuthModal(false);
        registerBtn.style.display = "inline-block";
    }
}

function showAuthModal(loginMode = true) {
    isLoginMode = loginMode;
    document.getElementById('authTitle').textContent = loginMode ? 'Iniciar Sesión' : 'Registrarse';
    document.getElementById('authSwitch').textContent = loginMode ? 
        '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión aquí';
    document.getElementById('authModal').style.display = 'flex';
    
    // Limpiar campos
    document.getElementById('authEmail').value = '';
    document.getElementById('authPassword').value = '';
}

function cerrarAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function toggleAuthMode() {
    showAuthModal(!isLoginMode);
}

async function procesarAuth() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        if (isLoginMode) {
            // Login
            await account.createEmailSession(email, password);
            const user = await account.get();
            alert('✅ Sesión iniciada correctamente');
            updateAuthButtons(true, user.email);
        } else {
            // Registro
            await account.create('unique()', email, password);
            await account.createEmailSession(email, password);
            const user = await account.get();
            alert('✅ Cuenta creada y sesión iniciada');
            updateAuthButtons(true, user.email);
        }
        cerrarAuthModal();
    } catch (error) {
        console.error('Error auth:', error);
        alert('❌ Error: ' + error.message);
    }
}

async function logout() {
    try {
        await account.deleteSession('current');
        alert('👋 Sesión cerrada');
        updateAuthButtons(false);
    } catch (error) {
        console.error('Error logout:', error);
    }
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
        loginBtn.onclick = () => {
            const email = prompt('Email:');
            const password = prompt('Contraseña:');
            if (email && password) {
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                setupLocalAuth();
                alert('✅ Sesión iniciada');
            }
        };
        registerBtn.textContent = "Registrarse";
        registerBtn.onclick = () => {
            const email = prompt('Email para registro:');
            const password = prompt('Contraseña:');
            if (email && password) {
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                setupLocalAuth();
                alert('✅ Cuenta creada y sesión iniciada');
            }
        };
        registerBtn.style.display = "inline-block";
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

    // Verificar autenticación
    let isAuthenticated = false;
    let userEmail = '';
    
    if (account) {
        try {
            const user = await account.get();
            isAuthenticated = true;
            userEmail = user.email;
        } catch (error) {
            isAuthenticated = localStorage.getItem('userLoggedIn') === 'true';
            userEmail = localStorage.getItem('userEmail') || '';
        }
    } else {
        isAuthenticated = localStorage.getItem('userLoggedIn') === 'true';
        userEmail = localStorage.getItem('userEmail') || '';
    }

    if (!isAuthenticated) {
        alert("🔐 Debes iniciar sesión para agregar al carrito.");
        showAuthModal(true);
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

// Inicializar
window.onload = initAppWrite;