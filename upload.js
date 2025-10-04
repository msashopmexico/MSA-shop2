import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

import * as emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBLicSBL_Lua8LSol5Retp1NIrNnjycpRw",
  authDomain: "msa-shop-f6215.firebaseapp.com",
  projectId: "msa-shop-f6215",
  storageBucket: "msa-shop-f6215.appspot.com",
  messagingSenderId: "519359225705",
  appId: "1:519359225705:web:388d485eb324427b1c67f8"
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// EmailJS
emailjs.init("PhV4Hp36EPOLiGe6t");

const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
let selectedFile = null;

fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  if (!["image/png","image/jpeg","image/jpg"].includes(file.type)) {
    alert("Solo PNG/JPG/JPEG permitidos");
    fileInput.value = "";
    return;
  }
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = function(event){
    preview.innerHTML = `<img src="${event.target.result}" style="max-width:300px;">`;
  };
  reader.readAsDataURL(file);
});

document.getElementById("btnEnviar").addEventListener("click", async () => {
  if (!selectedFile) return alert("Debes seleccionar un archivo.");
  const user = JSON.parse(localStorage.getItem("uid"));
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const total = carrito.reduce((acc, p)=> acc+p.precio,0);
  const fileRef = ref(storage, `diseños/${Date.now()}_${selectedFile.name}`);
  await uploadBytes(fileRef, selectedFile);
  const downloadURL = await getDownloadURL(fileRef);

  // EmailJS
  try {
    await emailjs.send("service_4450mrz","template_biyacaa",{
      nombre: user.nombre,
      email: user.email,
      productos: carrito.map(p=>p.nombre+" talla "+p.talla).join(", "),
      total,
      fecha: new Date().toLocaleDateString(),
      direccion: user.direccion || "",
      codigo_postal: user.codigo || "",
      link_imagen: downloadURL
    });
    alert("✅ Diseño enviado correctamente y correo enviado.");
    localStorage.removeItem("carrito");
    window.location.href = "index.html";
  } catch(e){
    console.error(e);
    alert("❌ Error al enviar el correo.");
  }
});
