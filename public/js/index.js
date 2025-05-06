window.onload = function() {
    setTimeout(function() {
      document.getElementById('loading').classList.add('hidden');
    }, 1000);
    mostrarProductos();// AQUI ESTA PARA LLAMAR A LA FUNCION DE MOSTRAR PRODUCTOS AL INICIAR PAGINA 
    informacionUsuario();
  };



  
function mostrarProductos() {
    fetch('/api/productos')
      .then(response => response.json())
      .then(productos => {
        console.log('Lista de productos:', productos);
  
        const contenedor = document.getElementById('productos');
        contenedor.innerHTML = ''; 
        productos.forEach(producto => {
          const div = document.createElement('div');
          div.innerHTML = `
          <div class="product-item">
            <h3>${producto.Nombre}</h3>
            <p>${producto.descripcion}</p>
            <p>${producto.marca}</p>
            <span>$${producto.precio}</span>
            <button>Agregar al carrito</button>
            <p>Producto ID: ${producto.id_producto}</p> 
          </div>
        `;
          contenedor.appendChild(div);
        });
      })
      .catch(error => console.error('Error al cargar productos:', error));
  }

  
let idUsuarioGlobal = null;
  
  function informacionUsuario() {
    fetch('/api/perfil')
    .then(response => response.json())
    .then(data => {
        if (data.nombre && data.id) {
            document.getElementById('nombreusuario').textContent = data.nombre;
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


function cerrarSesion() {
    fetch('/logout').then(() => window.location.href = '/login.html');
  }



  