const express = require('express');
const router = express.Router();
const connection = require('../bd'); // asegúrate que apunta a tu conexión MySQL

router.post('/verificar-stock', (req, res) => {
  const { id_producto, id_sucursal, cantidad } = req.body;

  if (!id_producto || !id_sucursal || !cantidad) {
    return res.status(400).json({ error: 'Faltan parámetros.' });
  }

  const query = `
    SELECT cantidad 
    FROM Stock 
    WHERE id_producto = ? AND id_sucursal = ?
  `;

  connection.query(query, [id_producto, id_sucursal], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.' });

    if (results.length === 0) {
      return res.status(404).json({ 
        disponible: false, 
        mensaje: 'No hay stock registrado para este producto en la sucursal.' 
      });
    }

    const stock_actual = results[0].cantidad;
    const disponible = stock_actual >= cantidad;

    if (disponible) {
      res.json({ disponible: true, stock_actual });
    } else {
      res.json({
        disponible: false,
        stock_actual,
        mensaje: `Solo queda${stock_actual === 0 ? 'n' : ''} ${stock_actual} unidad${stock_actual !== 1 ? 'es' : ''} disponible en esta sucursal.`
      });
    }
  });
});

module.exports = router;
