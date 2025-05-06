const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const connection = require('./bd');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'dinocontra',
  resave: false,
  saveUninitialized: true
}));

function requireRole(rolEsperado) {
  return (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.rol !== rolEsperado) {
      return res.status(403).send('Acceso denegado');
    }
    next();
  };
}


app.get('/index.html', requireRole(1), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/carrito.html', requireRole(1), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'carrito.html'));
});

app.get('/vendedor.html', requireRole(2), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vendedor.html'));
});

app.get('/bodega.html', requireRole(3), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bodega.html'));
});

app.get('/admin.html', requireRole(4), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/contador.html', requireRole(5), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contador.html'));
});

// Consulta para iniciar sesión (No tocar)
app.post('/api/login', (req, res) => {
  const { correo, pass, rol } = req.body;

  const query = 'SELECT * FROM Usuario WHERE correo = ? AND pass = ? and Rol_id = ?';
  connection.query(query, [correo, pass, rol], (err, results) => {
    if (err) {
      return res.status(500).send('Error al verificar el usuario');
    }

    if (results.length > 0) {
      const usuario = results[0];
    
      // Este console.log está bien
      console.log('Usuario encontrado:', usuario);
    
      req.session.usuario = {
        id: usuario.id_usuario,
        rol: Number(usuario.Rol_id),
        nombre: usuario.nombre
      };
    
      console.log('Sesión iniciada con:', req.session.usuario);
    
      let redirectUrl = '';
      switch (usuario.Rol_id) {
        case 1: redirectUrl = '/index.html'; break;
        case 2: redirectUrl = '/vendedor.html'; break;
        case 3: redirectUrl = '/bodega.html'; break;
        case 4: redirectUrl = '/admin.html'; break;
        case 5: redirectUrl = '/contador.html'; break;
        default: redirectUrl = '/login.html';
      }
    
      // ✅ Esta es la única respuesta válida que debe enviarse
      res.status(200).json({ message: 'Inicio de sesión exitoso', redirect: redirectUrl });
    }
     else {
      res.status(400).send('Correo o contraseña incorrectos');
    }
  });
});



// Ruta para obtener los datos del usuario de la sesión
app.get('/api/perfil', (req, res) => {
  if (!req.session.usuario) {
    return res.status(403).send('Usuario no autenticado');
  }

  const { nombre, id } = req.session.usuario;
  res.status(200).json({ nombre, id });
});


// Cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// Consulta para obtener todos los productos
app.get('/api/productos', (req, res) => {
  const query = 'SELECT id_producto, Nombre, descripcion, marca, precio FROM Producto';
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error al obtener los productos');
    }
    res.status(200).json(results); 
  });
});


// Consulta para obtener todos los productos del carrito 
app.get('/api/productos', (req, res) => {
  const query = 'SELECT id_producto, Nombre, descripcion, marca, precio FROM Producto';
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error al obtener los productos');
    }
    res.status(200).json(results); 
  });
});



// Página de inicio
app.get('/', (req, res) => {
  res.redirect('login.html');
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
