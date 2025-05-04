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

app.post('/api/login', (req, res) => {
  const { correo, pass } = req.body;

  const query = 'SELECT * FROM Usuario WHERE correo = ? AND pass = ?';
  connection.query(query, [correo, pass], (err, results) => {
    if (err) {
      return res.status(500).send('Error al verificar el usuario');
    }

    if (results.length > 0) {
      const usuario = results[0];

      console.log('Usuario encontrado:', usuario); 

      req.session.usuario = {
        id: usuario.id_usuario,
        rol: Number(usuario.Rol_id),  // Aseguramos que usamos el campo correcto de la base de datos
        nombre: usuario.nombre
      };

      console.log('Sesión iniciada con:', req.session.usuario); 

      let redirectUrl = '';
      switch (usuario.Rol_id) {  // Usamos Rol_id aquí, que es el campo correcto
        case 1: redirectUrl = '/index.html'; break;
        case 2: redirectUrl = '/vendedor.html'; break;
        case 3: redirectUrl = '/bodega.html'; break;
        case 4: redirectUrl = '/admin.html'; break;
        case 5: redirectUrl = '/contador.html'; break;
        default: redirectUrl = '/index.html';
      }

      res.status(200).json({ message: 'Inicio de sesión exitoso', redirect: redirectUrl });
    } else {
      res.status(400).send('Correo o contraseña incorrectos');
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
