
function cerrarSesion() {
    fetch('/logout').then(() => window.location.href = '/login.html');
  }


function cargarPedidos() {
  fetch('/api/lista-pedidos')

    .then(response => {
      if (!response.ok) throw new Error('Error en la respuesta');
      return response.json();
    })
    .then(pedidos => {
      const tbody = document.querySelector('#tablaPedidos tbody');
      tbody.innerHTML = '';

      pedidos.forEach(pedido => {
        const tr = document.createElement('tr');
  tr.innerHTML = `
  <td>${pedido.id_pedido}</td>
  <td>${pedido.cliente}</td>
  <td class="productos-precios">${pedido.productos_precios}</td>
  <td>${pedido.estado}</td>
  <td>
    <select class="form-select estado-select" data-id="${pedido.id_pedido}">
      <option value="Pendiente" ${pedido.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
      <option value="Enviado" ${pedido.estado === 'Enviado' ? 'selected' : ''}>Enviado</option>
      <option value="Cancelado" ${pedido.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
    </select>
  </td>
`;

        tbody.appendChild(tr);
      });

      document.querySelectorAll('.estado-select').forEach(select => {
        select.addEventListener('change', e => {
          const idPedido = e.target.dataset.id;
          const nuevoEstado = e.target.value;

          fetch(`/api/pedidos/${idPedido}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nuevoEstado })
          })
          .then(res => {
            if (!res.ok) throw new Error('No se pudo actualizar el estado');
            alert('Estado actualizado');
            cargarPedidos(); // refrescar tabla
          })
          .catch(err => {
            alert('Error al actualizar estado');
            console.error(err);
          });
        });
      });
    })
    .catch(err => {
      console.error('Error al cargar pedidos:', err);
      alert('No se pudieron cargar los pedidos. Revisa la consola.');
    });
}

window.onload = () => {
  cargarPedidos();
};


    function mostrarSeccion(nombreSeccion) {
      const secciones = ['productos', 'despacho'];
      secciones.forEach(seccion => {
        document.getElementById(`seccion-${seccion}`).style.display = seccion === nombreSeccion ? 'block' : 'none';
      });
    }

