  window.onload = function () {
    informacionUsuario();
    cargarCarrito();
  };

  let idUsuarioGlobal = null;

  /* ==========================
    FUNCIONES PRINCIPALES
  ========================== */

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

  // Eliminar un ítem del carrito
  function eliminarItem(id_item) {
    fetch(`/api/carrito/item/${id_item}`, { method: 'DELETE' })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        cargarCarrito();
      });
  }

  /* ==========================
    EVENTOS
  ========================== */

  // Mostrar y cargar sucursales si se elige retiro en tienda
  document.getElementById('retiro').addEventListener('change', async () => {
    const metodo = document.getElementById('retiro').value;
    const container = document.getElementById('sucursal-container');
    const direccionFinal = document.getElementById('direccion-final');

    if (metodo === 'tienda') {
      container.style.display = 'block';
      document.getElementById('direccion-container').style.display = 'none';
      container.innerHTML = '';

      const label = document.createElement('label');
      label.setAttribute('for', 'sucursal');
      label.className = 'form-label';
      label.textContent = 'Seleccione sucursal para retiro';

      const select = document.createElement('select');
      select.className = 'form-select';
      select.id = 'sucursal';

      container.appendChild(label);
      container.appendChild(select);

      try {
        const res = await fetch('/api/sucursal');
        if (!res.ok) throw new Error('Error al obtener sucursales');
        const sucursales = await res.json();

        sucursales.forEach((sucursal, index) => {
          const option = document.createElement('option');
          option.value = sucursal.direccion_sucursal;
          option.textContent = `${sucursal.nombre_sucursal} - ${sucursal.direccion_sucursal}`;
          select.appendChild(option);

          // Preseleccionamos la primera sucursal
          if (index === 0) {
            direccionFinal.value = sucursal.direccion_sucursal;
          }
        });

        // Actualizamos el campo oculto cuando el usuario cambie la sucursal
        select.addEventListener('change', () => {
          direccionFinal.value = select.value;
        });

      } catch (error) {
        console.error('Fallo al cargar sucursales:', error);
      }

    } else {
      container.style.display = 'none';
      document.getElementById('direccion-container').style.display = 'block';

      // Guardar la dirección ingresada en el input
      const inputDireccion = document.getElementById('direccion');
      inputDireccion.addEventListener('input', () => {
        direccionFinal.value = inputDireccion.value;
      });

      // Inicializar el valor si ya hay algo escrito
      direccionFinal.value = inputDireccion.value;
    }
  });



  // Botón pagar
  document.getElementById('btn-pagar').addEventListener('click', async () => {
    try {
        const metodo_entrega = document.getElementById('retiro').value;

       let direccion;
if (metodo_entrega === 'domicilio') {
  direccion = document.getElementById('direccion').value || 'Sin dirección';
} else {
  direccion = document.getElementById('direccion-final').value || 'Sin sucursal seleccionada';
}



      const metodo_pago = document.querySelector('input[name="metodo_pago"]:checked')?.value || 'No especificado';
      const tipo_documento = 'Boleta';

      const res = await fetch('/api/carrito');
      const carrito = await res.json();
      let total = carrito.reduce((acc, item) => acc + item.total, 0);

      if (metodo_entrega === 'domicilio') {
        total += 10000;
      }

      const pedido = {
        id_usuario: idUsuarioGlobal,
        fecha_pedido: new Date().toISOString().slice(0, 10),
        metodo_entrega,
        direccion_entrega: direccion,
        tipo_documento,
        metodo_pago,
        total
      };

      sessionStorage.setItem('pedido', JSON.stringify(pedido));

      const resp = await fetch('/api/crear-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total })
      });

      const data = await resp.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('No se pudo redirigir al pago');
      }

    } catch (err) {
      console.error('Error al procesar el pago:', err);
      alert('Ocurrió un error al redirigir al pago');
    }
  });
