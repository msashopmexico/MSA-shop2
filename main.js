// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// EmailJS
import * as emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBLicSBL_Lua8LSol5Retp1NIrNnjycpRw",
  authDomain: "msa-shop-f6215.firebaseapp.com",
  projectId: "msa-shop-f6215",
  storageBucket: "msa-shop-f6215.appspot.com",
  messagingSenderId: "519359225705",
  appId: "1:519359225705:web:69e30095453be7371c67f8",
  measurementId: "G-X094KQV3DP"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Inicializar EmailJS
emailjs.init("PhV4Hp36EPOLiGe6t");

// Carrito
let productoSeleccionado = { nombre: "Camiseta Custom", precio: 300 };
const modal = document.getElementById("modal-talla");

document.getElementById("btn-agregar")?.addEventListener("click", () => {
  const user = auth.currentUser;
  if (!user) return alert("⚠️ Debes iniciar sesión para comprar.");
  modal.style.display = "flex";
});

function seleccionarTalla(talla) {
  productoSeleccionado.talla = talla;
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push(productoSeleccionado);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  modal.style.display = "none";
  window.location.href = "upload.html"; // Ir a subir imagen
}

function cerrarModal() {
  modal.style.display = "none";
}
