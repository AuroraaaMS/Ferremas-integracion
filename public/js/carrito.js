window.onload = function () {
  informacionUsuario();
  cargarCarrito();
};

let idUsuarioGlobal = null;

// Obtener datos del usuario
function informacionUsuario() {
  fetch('/api/perfil')
    .then((res) => res.json())
    .then((data) => {
      if (data.nombre && data.id) {
        document.getElementById('nombreusuario').textContent = data.nombre;
        idUsuarioGlobal = data.id;
      }
    });
}

// Cargar productos del carrito
function cargarCarrito() {
  fetch('/api/carrito')
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('table tbody');
      tbody.innerHTML = '';

      let total = 0;

      data.forEach(item => {
        total += item.total;

        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${item.Nombre}</td>
          <td>${item.cantidad}</td>
          <td>$${item.precio}</td>
          <td>$${item.total}</td>
          <td><button class="btn btn-danger" onclick="eliminarItem(${item.id_item})">Eliminar</button></td>
        `;
        tbody.appendChild(fila);
      });

      document.querySelector('h4').innerHTML = `Total: $${total}`;
    });
}

// Eliminar un ítem
function eliminarItem(id_item) {
  fetch(`/api/carrito/item/${id_item}`, { method: 'DELETE' })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      cargarCarrito();
    });
}

// Cerrar sesión
function cerrarSesion() {
  fetch('/logout').then(() => window.location.href = '/login.html');
}

function crearPedido() {
  const metodo_entrega = document.getElementById('retiro').value;
  const direccion = document.getElementById('direccion').value || 'Retiro en tienda';
  const tipo_documento = 'Boleta'; // Puedes hacerlo dinámico si quieres

  fetch('/api/pedido/crear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metodo_entrega,
      direccion_entrega: direccion,
      tipo_documento
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('No se pudo crear el pedido');
    return res.json();
  })
  .then(data => {
    alert('Pedido creado correctamente. ID: ' + data.id_pedido);
  })
  .catch(err => {
    console.error('Error al crear pedido:', err);
    alert('Hubo un error al crear el pedido');
  });
}

