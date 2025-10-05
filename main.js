<script>
let auth0Client;

async function initAuth() {
  auth0Client = await createAuth0Client({
    domain: "dev-r83h8xsmacihkvil.us.auth0.com",
    client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  });

  // Procesar si Auth0 redirigió después de login
  if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
    await auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  const isAuthenticated = await auth0Client.isAuthenticated();
  const loginBtn = document.getElementById("btn-login");
  const logoutBtn = document.getElementById("btn-logout");

  if (isAuthenticated) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }

  // Eventos de login/logout
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      await auth0Client.loginWithRedirect();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth0Client.logout({
        logoutParams: { returnTo: window.location.origin }
      });
    });
  }
}

// Funciones del modal
function seleccionarTalla() {
  document.getElementById("modalTalla").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modalTalla").style.display = "none";
}

window.onload = initAuth;
</script>
