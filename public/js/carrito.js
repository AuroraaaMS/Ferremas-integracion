window.onload = function() {
    informacionUsuario();
  };


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
