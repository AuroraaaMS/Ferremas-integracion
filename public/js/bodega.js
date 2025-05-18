document.addEventListener("DOMContentLoaded", () => {
  const selectSucursal = document.getElementById("selectSucursal");
  const tablaInventario = document.getElementById("tablaInventario").querySelector("tbody");
  const formProducto = document.getElementById("formProducto");
  const productoIdInput = document.getElementById("productoId");
  const inputs = {
    nombre: document.getElementById("nombreProducto"),
    descripcion: document.getElementById("descripcion"),
    marca: document.getElementById("marca"),
    precio: document.getElementById("precio"),
    categoria: document.getElementById("categoria")
  };

  function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.innerText = mensaje;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function limpiarFormulario() {
    productoIdInput.value = "";
    formProducto.reset();
  }

  function cargarCategorias() {
    fetch("/api/categorias")
      .then(res => res.json())
      .then(data => {
        inputs.categoria.innerHTML = "";
        data.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat.id_categoria;
          option.textContent = cat.nombre_categoria;
          inputs.categoria.appendChild(option);
        });
      });
  }

  function cargarProductos(idSucursal) {
    fetch(`/api/productos/bodega/${idSucursal}`)
      .then(res => res.json())
      .then(data => {
        tablaInventario.innerHTML = "";
        data.forEach(prod => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${prod.id_producto}</td>
            <td>${prod.Nombre}</td>
            <td>${prod.descripcion}</td>
            <td>${prod.marca}</td>
            <td>${prod.precio}</td>
            <td>${prod.nombre_categoria}</td>
            <td>${prod.total_stock}</td>
            <td>
              <button class="btn btn-warning btn-sm btn-editar">Editar</button>
              <button class="btn btn-danger btn-sm btn-eliminar">Eliminar</button>
            </td>
          `;
          tablaInventario.appendChild(fila);
        });
      });
  }

  selectSucursal.addEventListener("change", () => {
    const idSucursal = selectSucursal.value;
    if (idSucursal) cargarProductos(idSucursal);
  });

  formProducto.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevoProducto = {
      Nombre: inputs.nombre.value,
      descripcion: inputs.descripcion.value,
      marca: inputs.marca.value,
      precio: parseFloat(inputs.precio.value),
      id_categoria: parseInt(inputs.categoria.value)
    };

    const idProducto = productoIdInput.value;

    if (idProducto) {
      fetch(`/api/productos/bodega/${idProducto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto)
      })
        .then(res => res.json())
        .then(() => {
          mostrarToast("Producto actualizado correctamente");
          limpiarFormulario();
          cargarProductos(selectSucursal.value);
        })
        .catch(() => mostrarToast("Error al actualizar producto"));
    } else {
      fetch("/api/productos/bodega", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto)
      })
        .then(res => res.json())
        .then(() => {
          mostrarToast("Producto creado exitosamente");
          limpiarFormulario();
          cargarProductos(selectSucursal.value);
        })
        .catch(() => mostrarToast("Error al crear producto"));
    }
  });

  tablaInventario.addEventListener("click", (e) => {
    const fila = e.target.closest("tr");
    if (!fila) return;

    const idProducto = fila.children[0].textContent;

    if (e.target.classList.contains("btn-editar")) {
      productoIdInput.value = idProducto;
      inputs.nombre.value = fila.children[1].textContent;
      inputs.descripcion.value = fila.children[2].textContent;
      inputs.marca.value = fila.children[3].textContent;
      inputs.precio.value = fila.children[4].textContent;
      const nombreCategoria = fila.children[5].textContent;
      const opcionCategoria = [...inputs.categoria.options].find(op => op.textContent === nombreCategoria);
      if (opcionCategoria) inputs.categoria.value = opcionCategoria.value;
    }

    if (e.target.classList.contains("btn-eliminar")) {
      if (confirm("¿Deseas eliminar este producto?")) {
        fetch(`/api/productos/bodega/${idProducto}`, {
          method: "DELETE"
        })
          .then(res => res.json())
          .then(() => {
            mostrarToast("Producto eliminado correctamente");
            fila.remove(); 
          })
          .catch(() => mostrarToast("Error al eliminar producto"));
      }
    }
  });

  cargarCategorias();
  selectSucursal.value = "1";            
  cargarProductos("1");                  
});

function cerrarSesion() {
    fetch('/logout').then(() => window.location.href = '/login.html');
  }