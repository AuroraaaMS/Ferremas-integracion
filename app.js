require('dotenv').config();////para el stripe

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const connection = require('./bd');
const crearPago = require('./routes/crearPago'); // ruta separada de Stripe


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', crearPago);
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

// Consulta para extraer datos para la bodega
app.get('/api/productos/bodega', (req, res) => {
  try {
    const query = `
      SELECT 
        p.id_producto, 
        p.Nombre, 
        p.descripcion, 
        p.marca, 
        p.precio, 
        IFNULL(SUM(s.cantidad), 0) AS total_stock
      FROM Producto p
      LEFT JOIN Stock s ON p.id_producto = s.id_producto
      GROUP BY p.id_producto;
    `;

    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err);
        return res.status(500).json({ error: 'Error al obtener productos', details: err });
      }

      console.log('Resultados de la consulta:', results);  
      res.json(results);
    });
  } catch (err) {
    console.error('Error en la consulta SQL:', err);
    res.status(500).json({ error: 'Error al obtener productos', details: err });
  }
});


app.get('/', (req, res) => {
  res.redirect('login.html');
});


app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//////carrito
// Obtener productos del carrito por usuario
app.get('/api/carrito', (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).send('No autenticado');
  }

  const idUsuario = req.session.usuario.id;

  const sql = `
    SELECT ci.id_item, ci.cantidad, p.Nombre, p.precio, (ci.cantidad * p.precio) AS total
    FROM Carrito_item ci
    JOIN Carrito c ON ci.id_carrito = c.id_carrito
    JOIN Producto p ON ci.id_producto = p.id_producto
    WHERE c.id_usuario = ?
  `;

  connection.query(sql, [idUsuario], (err, results) => {
    if (err) {
      console.error('Error al obtener carrito:', err);
      return res.status(500).send('Error al obtener el carrito');
    }
    res.json(results);
  });
});


// Agregar producto al carrito
app.post('/api/carrito/agregar', (req, res) => {
  const { id_producto, cantidad } = req.body;
  const idUsuario = req.session.usuario?.id;

  if (!idUsuario) {
    return res.status(401).send('Usuario no autenticado');
  }

  // Obtener el id_carrito del usuario
  const getCarritoQuery = 'SELECT id_carrito FROM Carrito WHERE id_usuario = ?';

  connection.query(getCarritoQuery, [idUsuario], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).send('Error al obtener el carrito del usuario');
    }

    const idCarrito = results[0].id_carrito;

    const insertarItem = `
      INSERT INTO Carrito_item (id_carrito, id_producto, cantidad)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
    `;

    connection.query(insertarItem, [idCarrito, id_producto, cantidad], (err2) => {
      if (err2) {
        console.error('Error al agregar al carrito:', err2);
        return res.status(500).send('Error al agregar producto al carrito');
      }

      res.status(200).send('Producto agregado al carrito');
    });
  });
});


// Eliminar un producto del carrito
app.delete('/api/carrito/item/:id_item', (req, res) => {
  const { id_item } = req.params;

  const query = 'DELETE FROM Carrito_item WHERE id_item = ?';
  connection.query(query, [id_item], (err) => {
    if (err) {
      console.error('Error al eliminar ítem del carrito:', err);
      return res.status(500).send('Error al eliminar el ítem');
    }
    res.status(200).send('Ítem eliminado del carrito');
  });
});
//////////////para pedido 
app.post('/api/pedido/crear', (req, res) => {
  const idUsuario = req.session.usuario?.id;
  if (!idUsuario) return res.status(401).send('No autenticado');

  const { metodo_entrega, direccion_entrega, tipo_documento } = req.body;

  const obtenerCarrito = `SELECT id_carrito FROM Carrito WHERE id_usuario = ?`;

  connection.query(obtenerCarrito, [idUsuario], (err, resultados) => {
    if (err || resultados.length === 0) {
      console.error('❌ Error al obtener carrito:', err);
      return res.status(500).send('Error al obtener carrito');
    }

    const idCarrito = resultados[0].id_carrito;

    const obtenerItems = `
      SELECT ci.id_producto, ci.cantidad, p.precio
      FROM Carrito_item ci
      JOIN Producto p ON ci.id_producto = p.id_producto
      WHERE ci.id_carrito = ?
    `;

    connection.query(obtenerItems, [idCarrito], (err2, items) => {
      if (err2 || items.length === 0) {
        console.error('❌ Error al obtener items del carrito:', err2);
        return res.status(400).send('El carrito está vacío');
      }

      const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

      const crearPedido = `
        INSERT INTO Pedido (fecha_pedido, id_usuario, metodo_entrega, direccion_entrega, tipo_documento, estado, total)
        VALUES (NOW(), ?, ?, ?, ?, 'Pendiente', ?)
      `;

      connection.query(crearPedido, [idUsuario, metodo_entrega, direccion_entrega, tipo_documento, total], (err3, resultPedido) => {
        if (err3) {
          console.error('❌ Error al insertar pedido:', err3);
          return res.status(500).send('Error al crear el pedido');
        }

        const idPedido = resultPedido.insertId;

        const detalles = items.map(item => [idPedido, item.id_producto, item.cantidad, item.precio]);

        const insertarDetalles = `
          INSERT INTO Pedido_Detalle (id_pedido, id_producto, cantidad, precio_unitario)
          VALUES ?
        `;

        connection.query(insertarDetalles, [detalles], (err4) => {
          if (err4) {
            console.error(' Error al insertar detalles:', err4);
            return res.status(500).send('Error al crear detalles del pedido');
          }

          connection.query(`DELETE FROM Carrito_item WHERE id_carrito = ?`, [idCarrito], () => {
            res.status(200).json({ mensaje: 'Pedido creado exitosamente', id_pedido: idPedido });
          });
        });
      });
    });
  });
});





