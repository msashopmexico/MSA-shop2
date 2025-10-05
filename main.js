let auth0 = null;

async function initAuth() {
  auth0 = await createAuth0Client({
    domain: 'dev-r83h8xsmacihkvil.us.auth0.com',
    client_id: 'PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf'
  });

  const isAuthenticated = await auth0.isAuthenticated();
  if(isAuthenticated){
    const user = await auth0.getUser();
    console.log("Usuario logueado:", user);
  } else {
    document.getElementById("btn-agregar").addEventListener("click", async ()=>{
      alert("❌ Necesitas iniciar sesión para comprar");
      await auth0.loginWithRedirect({redirect_uri: window.location.href});
    });
  }

  document.getElementById("login-btn").addEventListener("click", async ()=>{
    await auth0.loginWithRedirect({redirect_uri: window.location.href});
  });

  document.getElementById("register-btn").addEventListener("click", async ()=>{
    await auth0.loginWithRedirect({screen_hint:"signup", redirect_uri: window.location.href});
  });
}

initAuth();

// Carrito y talla
const modal = document.getElementById("modal-talla");
let productoSeleccionado = { nombre: "Camiseta Custom", precio: 300 };

function seleccionarTalla(talla){
  productoSeleccionado.talla = talla;
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push(productoSeleccionado);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  modal.style.display = "none";
  window.location.href="upload.html";
}

function cerrarModal(){ modal.style.display="none"; }

document.getElementById("btn-agregar")?.addEventListener("click", ()=>{
  modal.style.display="flex";
});
