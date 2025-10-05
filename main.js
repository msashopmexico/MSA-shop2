import createAuth0Client from "https://cdn.jsdelivr.net/npm/@auth0/auth0-spa-js@2/dist/auth0-spa-js.production.js";
import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

let auth0 = null;
let user = null;
let carrito = [];

async function initAuth() {
  auth0 = await createAuth0Client({
    domain: "dev-r83h8xsmacihkvil.us.auth0.com",
    client_id: "PBGnUOmoUjfuTJwwpW6bHIQDSSDGPjQf",
    cacheLocation: "localstorage",
  });

  if(await auth0.isAuthenticated()) {
    user = await auth0.getUser();
  }
}

document.getElementById("btn-login")?.addEventListener("click", async()=>{
  await auth0.loginWithRedirect({ redirect_uri: window.location.origin });
});
document.getElementById("btn-register")?.addEventListener("click", async()=>{
  await auth0.loginWithRedirect({ redirect_uri: window.location.origin });
});
document.getElementById("btn-logout")?.addEventListener("click", async()=>{
  await auth0.logout({ returnTo: window.location.origin });
});

function seleccionarTalla(talla) {
  localStorage.setItem("tallaSeleccionada", talla);
}

function agregarCarrito() {
  const talla = localStorage.getItem("tallaSeleccionada");
  if(!talla) return alert("Selecciona una talla primero");
  carrito.push({ producto:"Camiseta Lisa Negra", precio:250, talla });
  localStorage.setItem("carrito", JSON.stringify(carrito));
  window.location.href = "upload.html";
}

// Upload.html
const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");
const btnSend = document.getElementById("btn-send");

fileInput?.addEventListener("change", ()=>{
  const file = fileInput.files[0];
  if(!file) return;
  if(!["image/png","image/jpeg","image/jpg"].includes(file.type)) {
    alert("Solo PNG, JPG o JPEG");
    fileInput.value="";
    return;
  }
  const reader = new FileReader();
  reader.onload = e=>{
    previewImage.src = e.target.result;
    previewImage.style.display="block";
  };
  reader.readAsDataURL(file);
});

btnSend?.addEventListener("click", async()=>{
  const file = fileInput.files[0];
  if(!file) return alert("Sube una imagen primero");
  try{
    await emailjs.send("service_4450mrz","template_biyacaa",{
      nombre: user.name || "Cliente",
      email: user.email,
      diseño: previewImage.src,
    },"PhV4Hp36EPOLiGe6t");
    alert("Correo enviado con éxito!");
  }catch(e){
    console.error(e);
    alert("Error enviando correo");
  }
});
