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


app.get('/api/sucursal', (req, res) => {
  const query = 'SELECT * FROM Sucursal';
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error al obtener los productos');
    }
    res.status(200).json(results); 
  });
});

// Ruta para obtener productos con su stock por sucursal
app.get('/api/productos/sucursal/:id_sucursal', (req, res) => {
  const idSucursal = req.params.id_sucursal;

  const query = `
    SELECT 
      p.id_producto, p.Nombre, p.descripcion, p.marca, p.precio, s.cantidad
    FROM 
      Producto p
    JOIN 
      Stock s ON p.id_producto = s.id_producto
    WHERE 
      s.id_sucursal = ?
  `;

  connection.query(query, [idSucursal], (err, results) => {
    if (err) {
      console.error('Error al obtener productos por sucursal:', err);
      return res.status(500).send('Error al obtener productos por sucursal');
    }
    res.json(results);
  });
});



app.use(express.json());


//Crear cliente y carrito 
app.put('/api/cliente', (req, res) => {
  const { nombre, pass, rut, correo } = req.body;
  const rol_id = 1;  

  connection.beginTransaction(err => {
    if (err) {
      return res.status(500).send('Error iniciando transacción');
    }
    const sqlUsuario = `
      INSERT INTO Usuario (nombre, pass, rut, correo, Rol_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    connection.query(sqlUsuario, [nombre, pass, rut, correo, rol_id], (err, resultUsuario) => {
      if (err) {
        return connection.rollback(() => {
          res.status(500).send('Error al insertar usuario');
        });
      }

      const nuevoUsuarioId = resultUsuario.insertId;

      const sqlCarrito = `
        INSERT INTO Carrito (fecha_creacion, id_usuario)
        VALUES (NOW(), ?)
      `;
      connection.query(sqlCarrito, [nuevoUsuarioId], (err) => {
        if (err) {
          return connection.rollback(() => {
            res.status(500).send('Error al insertar carrito');
          });
        }
        connection.commit(err => {
          if (err) {
            return connection.rollback(() => {
              res.status(500).send('Error al confirmar transacción');
            });
          }
          res.status(200).send('Cliente y carrito creados exitosamente');
        });
      });
    });
  });
});






app.get('/', (req, res) => {
  res.redirect('login.html');
});


app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
