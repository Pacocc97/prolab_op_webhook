const express = require('express');
const Openpay = require('openpay');
const axios = require('axios');

// Inicializa OpenPay con tus credenciales
const openpay = new Openpay('TU_MERCHANT_ID', 'TU_PRIVATE_KEY', false);
// openpay.setProductionReady(false); // descomenta si quieres modo sandbox (dependiendo tu setup)

const router = express.Router();

const BACK_URL = 'http://localhost:3000/openpay'; // Cambia por tu URL
const FRONT_URL = 'http://localhost:3000'; // Cambia por tu URL

/**
 * POST /create-charge
 * Crea un cargo con 3D Secure y redirección
 */
router.post('/create-charge', async (req, res) => {
  try {
    const {
      username,
      shippingCost,
      products,
      deviceSessionId,
      amount,
      cardToken,        // o source_id (tarjeta guardada)
      orderId,          // tu ID único
      email,
      name,
      lastName,
      phoneNumber
    } = req.body;

    // Construye el chargeRequest para OpenPay
    const chargeRequest = {
      method: 'card',
      source_id: cardToken,         // Token o tarjeta guardada
      amount: amount,               // Monto total
      description: 'Compra desde Express con 3D Secure',
      order_id: orderId,            // O el cartId que quieras
      device_session_id: deviceSessionId,
      // Activa 3D Secure y la URL de redirección
      use_3d_secure: true,
      redirect_url: `${BACK_URL}/callback`,
      // Envía la info adicional en metadata
      metadata: {
        username,
        shippingCost,
        products
      },
      // Info del cliente
      customer: {
        name,
        last_name: lastName,
        phone_number: phoneNumber,
        email
      }
    };

    openpay.charges.create(chargeRequest, (error, charge) => {
      if (error) {
        console.error('Error al crear cargo:', error);
        return res.status(400).json({ error });
      }
      console.log('Cargo creado:', charge);

      /**
       * El objeto `charge` puede incluir `charge.payment_method.url`
       * si necesita redirección manual, pero con `redirect_url`,
       * la librería te manda directamente. De todas formas,
       * devuelves la información para ver qué pasó.
       */
      return res.json({ charge });
    });
  } catch (error) {
    console.error('Error en /create-charge:', error);
    return res.status(500).json({ error: 'Error interno al crear cargo' });
  }
});

/**
 * GET /openpay/callback
 * Ruta que OpenPay usa para redirigir después de 3D Secure
 */
router.get('/callback', async (req, res) => {
  try {
    // OpenPay manda varios query params, por ejemplo:
    // ?id=<id_de_charge>&authorization=<num_auth>&status=<completed|failed|etc.>
    const { id, authorization, status, transaction_type } = req.query;

    console.log('OpenPay callback:', req.query);

    if (!id || status !== 'completed') {
      // Manejo de error o pago fallido
      return res.redirect(`${FRONT_URL}/?payment_failed=1`);
    }

    // 1. Consultar el cargo en OpenPay para obtener metadata
    // Si no quieres usar su SDK aquí, puedes usar axios con Basic Auth:
    // Endpoint: GET /v1/{merchant_id}/charges/{charge_id}
    // Ejemplo con la misma instancia openpay:
    openpay.charges.get(id, async (error, transaction) => {
      if (error) {
        console.error('Error al consultar transacción:', error);
        return res.redirect(`${FRONT_URL}/?payment_failed=1`);
      }

      console.log('Transacción consultada:', transaction);

      // 2. Extraer metadata y crear orden
      const { username, shippingCost, products } = transaction.metadata || {};

      // Aquí es donde creas tu orden:
      // Ejemplo: Llamar a tu DB, microservicio o lo que necesites
      // createOrder(username, shippingCost, products, transaction.id, transaction.order_id);

      console.log('Creando orden con:', {
        username,
        shippingCost,
        products,
        transactionId: transaction.id,
        orderId: transaction.order_id
      });

      // 3. Redirigir a tu página final de confirmación
      // o, si prefieres, responder un HTML de "Pago OK".
      return res.redirect(`${FRONT_URL}/order-confirmed?charge=${transaction.id}`);
    });
  } catch (error) {
    console.error('Error en /openpay/callback:', error);
    return res.redirect(`${FRONT_URL}/?payment_failed=1`);
  }
});

module.exports = router;