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
async function crearPedido() {
  try {
    // 1. Obtener datos del formulario
    const metodo_entrega = document.getElementById('retiro').value;
    ////sucursale para retiro en tienda
    let direccion;

      if (metodo_entrega === 'tienda') {
        direccion = document.getElementById('sucursal')?.value || 'Sucursal sin dirección';
      } else {
        direccion = document.getElementById('direccion').value || 'Sin dirección';
      }

    const tipo_documento = 'Boleta';

    // 2. Guardar en sessionStorage para usar en exito.html
    sessionStorage.setItem('pedido', JSON.stringify({
      metodo_entrega,
      direccion_entrega: direccion,
      tipo_documento
    }));

    // 3. Obtener total del carrito
    const res = await fetch('/api/carrito');
    const carrito = await res.json();
    const total = carrito.reduce((acc, item) => acc + item.total, 0);

    // 4. Llamar al backend para crear sesión Stripe
    const pago = await fetch('/api/crear-pago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total })
    });

    const data = await pago.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('No se pudo redirigir al pago');
    }

  } catch (err) {
    console.error('Error al redirigir al pago:', err);
    alert('Error al procesar el pago');
  }
}
// Mostrar y cargar sucursales si se elige retiro en tienda
document.getElementById('retiro').addEventListener('change', async () => {
  const metodo = document.getElementById('retiro').value;
  const container = document.getElementById('sucursal-container');

  if (metodo === 'tienda') {
    container.style.display = 'block';

    // Crear elementos si no existen
    if (!document.getElementById('sucursal')) {
      const label = document.createElement('label');
      label.setAttribute('for', 'sucursal');
      label.textContent = 'Seleccione sucursal para retiro';

      const select = document.createElement('select');
      select.className = 'form-select';
      select.id = 'sucursal';

      container.appendChild(label);
      container.appendChild(select);
    }

    // Traer sucursales desde backend
    const res = await fetch('/api/sucursal');
    const sucursales = await res.json();

    const select = document.getElementById('sucursal');
    select.innerHTML = '';

    sucursales.forEach(sucursal => {
      const option = document.createElement('option');
      option.value = sucursal.direccion_sucursal;
      option.textContent = sucursal.nombre_sucursal;
      select.appendChild(option);
    });

  } else {
    container.style.display = 'none';
  }
});
