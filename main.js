import createAuth0Client from "https://cdn.jsdelivr.net/npm/@auth0/auth0-spa-js@2.0.0/dist/auth0-spa-js.production.js";

let auth0 = null;
let usuario = null;
let productoSeleccionado = { nombre:"Camiseta Custom", precio:300 };

async function initAuth() {
  auth0 = await createAuth0Client({
    domain: "dev-r83h8xsmacihkvil.us.auth0.com",
    client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
    cacheLocation: "localstorage"
  });
  usuario = await auth0.isAuthenticated() ? await auth0.getUser() : null;
}
initAuth();

// Redirecciones botones header
document.getElementById("btn-login").addEventListener("click", async ()=>{
  await auth0.loginWithRedirect({redirect_uri: window.location.href});
});
document.getElementById("btn-register").addEventListener("click", async ()=>{
  await auth0.loginWithRedirect({screen_hint:"signup", redirect_uri: window.location.href});
});
document.getElementById("btn-carrito").addEventListener("click", ()=>{
  if(!usuario){ alert("Debes iniciar sesión para ver el carrito"); return;}
  window.location.href = "carrito.html";
});

// Modal talla
const modal = document.getElementById("modal-talla");
document.getElementById("btn-agregar").addEventListener("click", ()=>{
  if(!usuario){ alert("Debes iniciar sesión para comprar"); return;}
  modal.style.display="flex";
});
window.seleccionarTalla = function(talla){
  productoSeleccionado.talla=talla;
  let carrito = JSON.parse(localStorage.getItem("carrito"))||[];
  carrito.push(productoSeleccionado);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  modal.style.display="none";
  window.location.href="upload.html";
}
window.cerrarModal = function(){ modal.style.display="none"; }
