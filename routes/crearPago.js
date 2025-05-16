require('dotenv').config(); 

const express = require('express');
const router = express.Router();


const stripeSecretKey = process.env.STRIPE_PART1 + process.env.STRIPE_PART2 + process.env.STRIPE_PART3;


const stripe = require('stripe')(stripeSecretKey);


router.post('/crear-pago', async (req, res) => {
  const { total } = req.body;

  if (!total) {
    return res.status(400).json({ error: 'Falta el total del carrito.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'clp',
          product_data: {
            name: 'Pago en Ferremas',
          },
          unit_amount: parseInt(total),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/exito.html',
      cancel_url: 'http://localhost:3000/cancelado',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error al crear sesión de pago:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
