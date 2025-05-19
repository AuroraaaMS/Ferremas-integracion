window.onload = function () {
  insertarPedidoDesdeStorage();
  console.log('PedidoInsertado')
  mostrarResumenPedido();
  
};

function mostrarResumenPedido() {
  const pedido = JSON.parse(sessionStorage.getItem('pedido'));

  const info = document.getElementById('info-pedido');

  if (pedido && info) {
    const datos = [
      {
        label: 'Método de entrega',
        value: pedido.metodo_entrega === 'tienda' ? 'Retiro en tienda' : 'Despacho a domicilio'
      },
      {
        label: 'Dirección',
        value: pedido.direccion_entrega
      },
      {
        label: 'Tipo de documento',
        value: pedido.tipo_documento
      },
      {
        label: 'Método de pago',
        value: pedido.metodo_pago || 'No informado'
      },
      {
        label: 'Total',
        value: pedido.total ? `$${pedido.total}` : 'No informado'
      }
    ];

    datos.forEach(dato => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.innerHTML = `<strong>${dato.label}:</strong> ${dato.value}`;
      info.appendChild(li);
    });

    sessionStorage.removeItem('pedido');
  } else {
    info.innerHTML = '<li class="list-group-item text-danger">No se encontraron datos del pedido.</li>';
  }
}

function insertarPedidoDesdeStorage() {
  const pedidoGuardado = JSON.parse(sessionStorage.getItem('pedido'));

  if (!pedidoGuardado) {
    console.warn('No hay datos en sessionStorage para guardar el pedido.');
    return;
  }

  const id_usuario = pedidoGuardado.id_usuario;
  const fecha_pedido = pedidoGuardado.fecha_pedido;
  const metodo_entrega = pedidoGuardado.metodo_entrega;
  const direccion_entrega = pedidoGuardado.direccion_entrega;
  const tipo_documento = pedidoGuardado.tipo_documento;
  const total = pedidoGuardado.total;

  fetch('/api/pedido', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_usuario,
      fecha_pedido,
      metodo_entrega,
      direccion_entrega,
      tipo_documento,
      total
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.id_pedido) {
      console.log('Pedido insertado correctamente:', data);
    } else {
      console.error('Error al insertar pedido:', data);
    }
  })
  .catch(err => {
    console.error('Error al enviar el pedido al servidor:', err);
  });
}
