// Manejador de carrito y selección de talla
const modal = document.getElementById("modal-talla");
let productoSeleccionado = { nombre: "Camiseta Custom", precio: 300 };

document.getElementById("btn-agregar").addEventListener("click", () => {
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

// Mostrar carrito en carrito.html
export function mostrarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const totalTexto = document.getElementById("total");
  if (!lista) return;

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  lista.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    total += item.precio;
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.textContent = `${item.nombre} - Talla: ${item.talla} - $${item.precio} MXN`;

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.classList.add("btn-red");
    btnEliminar.addEventListener("click", () => {
      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      mostrarCarrito();
    });

    li.appendChild(btnEliminar);
    lista.appendChild(li);
  });

  totalTexto.textContent = `Total: $${total} MXN`;
}
