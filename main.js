let auth0 = null;
let tallaSeleccionada = null;

const initAuth = async () => {
  auth0 = await window.createAuth0Client({
    domain: "dev-r83h8xsmacihkvil.us.auth0.com",
    client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
    cacheLocation: "localstorage",
    redirect_uri: "https://msa-shop.netlify.app/"
  });

  if (window.location.search.includes("code=")) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  const isAuthenticated = await auth0.isAuthenticated();
  updateAuthButtons(isAuthenticated);
};

const updateAuthButtons = (logged) => {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-register");

  if (logged) {
    loginBtn.textContent = "Cerrar sesión";
    loginBtn.onclick = async () => {
      await auth0.logout({ returnTo: "https://msa-shop.netlify.app/" });
    };
    registerBtn.style.display = "none";
  } else {
    loginBtn.textContent = "Iniciar sesión";
    loginBtn.onclick = async () => { await auth0.loginWithRedirect(); };
    registerBtn.textContent = "Registrarse";
    registerBtn.onclick = async () => { await auth0.loginWithRedirect({ screen_hint: "signup" }); };
    registerBtn.style.display = "inline-block";
  }
};

function seleccionarTalla(talla) {
  tallaSeleccionada = talla;
  document.getElementById("tallaSeleccionada").textContent = talla;
}

function agregarCarrito() {
  if (!tallaSeleccionada) return alert("Selecciona una talla primero.");
  auth0.isAuthenticated().then(logged => {
    if (!logged) return alert("Debes iniciar sesión para agregar al carrito.");
    document.getElementById("miModal").style.display = "flex";
  });
}

function cerrarModal() {
  document.getElementById("miModal").style.display = "none";
}

function irUpload() {
  window.location.href = "upload.html?talla=" + tallaSeleccionada;
}

window.onload = initAuth;
