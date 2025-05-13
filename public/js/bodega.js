function cargarProductosBodega() {
  fetch('/api/productos/bodega')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      return response.json();
    })
    .then(data => {
      console.log('Datos recibidos:', data); 
      const tabla = document.querySelector('#tabla-inventario tbody');
      tabla.innerHTML = '';

      data.forEach(producto => {
        const fila = `
          <tr>
            <td>${producto.id_producto}</td>
            <td>${producto.Nombre}</td>
            <td>${producto.descripcion}</td>
            <td>${producto.marca}</td>
            <td>${producto.precio}</td>
            <td>${producto.total_stock}</td>
          </tr>
        `;
        tabla.innerHTML += fila;
      });
    })
    .catch(error => {
      console.error('Error al cargar los productos:', error);
    });
}

document.addEventListener('DOMContentLoaded', cargarProductosBodega);
