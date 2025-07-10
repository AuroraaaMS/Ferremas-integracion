window.onload = function() {
  setTimeout(function() {
    document.getElementById('loading').classList.add('hidden');
  }, 400);

  cargarSucursales(); 
  informacionUsuario(); 
  cargarMisPedidos();
};

  function agregarAlCarrito(id_producto) {
  fetch('/api/carrito/agregar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_producto, cantidad: 1 })
  })
  .then(res => res.text())
  .then(msg => alert(msg));
}


  
  function mostrarProductosPorSucursal() {
    const idSucursal = document.getElementById('sucursalSelect').value;
  
    fetch(`/api/productos/bodega/${idSucursal}`)
      .then(response => response.json())
      .then(productos => {
        const contenedor = document.getElementById('seccion-productos');
        contenedor.innerHTML = '';
        productos.forEach(producto => {
          const div = document.createElement('div');
          div.innerHTML = `
         <div class="product-item">
            <h3>${producto.Nombre}</h3>
            <p>${producto.descripcion}</p>
            <p>Marca: ${producto.marca}</p>
            <p>Precio: $${producto.precio}</p>
            <p><strong>Stock en esta sucursal:</strong> ${producto.total_stock}</p>
            ${
              producto.total_stock === 0
                ? '<p class="text-danger fw-bold">Producto agotado</p>'
                : `<button onclick="agregarAlCarrito(${producto.id_producto})" class="btn btn-primary">Agregar al carrito</button>`
            }
          </div>
          `;
          contenedor.appendChild(div);
        });
      })
      .catch(error => console.error('Error al cargar productos:', error));
  }
  

  function cargarSucursales() {
    fetch('/api/sucursal')
      .then(response => response.json())
      .then(sucursales => {
        const select = document.getElementById('sucursalSelect');
        sucursales.forEach(sucursal => {
          const option = document.createElement('option');
          option.value = sucursal.id_sucursal;
          option.text = sucursal.nombre_sucursal;
          select.appendChild(option);
        });
  
        if (sucursales.length > 0) {
          mostrarProductosPorSucursal();
        }
      })
      .catch(error => console.error('Error al cargar sucursales:', error));
  }
  

  
let idUsuarioGlobal = null;
  
  function informacionUsuario() {
    fetch('/api/perfil')
    .then(response => response.json())
    .then(data => {
        if (data.nombre && data.id) {
            document.getElementById('nombreusuario').textContent = "Hola " + data.nombre;
            idUsuarioGlobal = data.id;
            console.log('ID del usuario guardado:', idUsuarioGlobal);
        } else {
            console.error('No se pudo obtener la información del usuario');
        }
    })
    .catch(error => {
        console.error('Error al obtener los datos del perfil:', error);
    });
}

function mostrarSeccion(nombre) {
  const secciones = ['seccion-productos', 'seccion-mis-pedidos'];
  secciones.forEach(id => {
    const elemento = document.getElementById(id);
    if (id === nombre) {
      if (id === 'seccion-productos') {
        elemento.style.display = 'grid';
      } else {
        elemento.style.display = 'block';
      }
    } else {
      elemento.style.display = 'none';
    }
  });
}








  function cargarMisPedidos() {
  fetch('/api/mis-pedidos')

    .then(res => res.json())
    .then(pedidos => {
      const contenedor = document.getElementById('misPedidos');
      contenedor.innerHTML = '';

      if (pedidos.length === 0) {
        contenedor.innerHTML = '<p>No tienes pedidos registrados.</p>';
        return;
      }

      pedidos.forEach(p => {
        const div = document.createElement('div');
        div.className = 'pedido-box';
        div.innerHTML = `
          <h5>Pedido #${p.id_pedido}</h5>
          <p><strong>Fecha:</strong> ${p.fecha_pedido}</p>
          <p><strong>Entrega:</strong> ${p.metodo_entrega}</p>
          <p><strong>Dirección:</strong> ${p.direccion_entrega}</p>
          <p><strong>Documento:</strong> ${p.tipo_documento}</p>
          <p><strong>Total:</strong> $${p.total}</p>
          <p><strong>Estado:</strong> <span class="badge bg-info">${p.estado}</span></p>
          <hr>
        `;
        contenedor.appendChild(div);
      });
    })
    .catch(err => {
      console.error('Error al cargar mis pedidos:', err);
    });
}

function cerrarSesion() {
    fetch('/logout').then(() => window.location.href = '/login.html');
  }





  