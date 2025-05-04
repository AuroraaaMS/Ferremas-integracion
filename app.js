const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const connection = require('./bd');

const app = express();

// Hacer que Express sirva los archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

// Ruta POST para login
app.post('/api/login', (req, res) => {
  const { correo, pass } = req.body;

  const query = 'SELECT * FROM Usuario WHERE correo = ? AND pass = ?';
  connection.query(query, [correo, pass], (err, results) => {
    if (err) {
      return res.status(500).send('Error al verificar el usuario');
    }

    if (results.length > 0) {
      res.status(200).json({ message: 'Inicio de sesión exitoso', redirect: 'index.html' });
    } else {
      res.status(400).send('Correo o contraseña incorrectos');
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
