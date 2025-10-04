const modal = document.getElementById("modal-talla");
let productoSeleccionado = { nombre: "Camiseta Custom", precio: 300 };

document.getElementById("btn-agregar").addEventListener("click", () => {
  // Verificar si usuario logueado
  if (!localStorage.getItem("uid")) {
    alert("Debes iniciar sesión para agregar productos.");
    window.location.href = "login.html";
    return;
  }
  modal.style.display = "flex";
});

function seleccionarTalla(talla) {
  productoSeleccionado.talla = talla;
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push(productoSeleccionado);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  modal.style.display = "none";
  window.location.href = "upload.html";
}

function cerrarModal() {
  modal.style.display = "none";
}
