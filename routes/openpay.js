const express = require('express');
const Openpay = require('openpay');
const axios = require('axios');

// Inicializa OpenPay con tus credenciales
const openpay = new Openpay('mkk673wuxmi4xvii20cf', 'sk_3c78be60065d4f89ab1eb7ef2a060ac7', false);
// openpay.setProductionReady(false); // descomenta si quieres modo sandbox (dependiendo tu setup)

const router = express.Router();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const BACK_URL = 'http://localhost:5005/openpay'; // Cambia por tu URL
const FRONT_URL = 'http://localhost:3000'; // Cambia por tu URL

const BASE_URL = 'https://srv01.adaflex.mx:4430/datasnap/rest/TSMREST'; // Cambia por tu URL
const createOrder = async (body) => {
  const response = await axios.post(`${BASE_URL}/NewOrder`, body)
  return response.data
}

/**
 * POST /create-charge
 * Crea un cargo con 3D Secure y redirección
 */
router.post('/create-charge', async (req, res) => {
  try {
    const {
      method,
      description,
      deviceSessionId,
      sourceId,   // Corresponde a cardToken o source_id
      amount,
      customer,
      order
    } = req.body;

    const { name, last_name, email } = customer;
    const { username, shippingCost, products } = order;
    // console.log('Creando cargo con:', req.body);
    // Construye el chargeRequest para OpenPay
    const chargeRequest = {
      method: method,  // 'card'
      source_id: sourceId,  // Token o tarjeta guardada
      amount: amount,       // Monto total
      description: description || 'Compra desde Express con 3D Secure',
      device_session_id: deviceSessionId,
      use_3d_secure: true,
      redirect_url: `${BACK_URL}/callback`, // Asegúrate de definir BACK_URL correctamente
      // Metadata opcional si tienes información adicional
      metadata: {
        username,
        shippingCost,
        products
      },
      // Info del cliente
      customer: {
        name,
        last_name,
        email
      }
    };
    openpay.charges.create(chargeRequest, (error, charge) => {
      if (error) {
        console.error('Error al crear cargo:', error);
        return res.status(400).json({ error });
      }
      /**
       * El objeto `charge` puede incluir `charge.payment_method.url`
       * si necesita redirección manual, pero con `redirect_url`,
       * la librería te manda directamente. De todas formas,
       * devuelves la información para ver qué pasó.
       */
      return res.json(charge);
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
// Ruta de callback de OpenPay
router.get('/callback', async (req, res) => {
  try {
    // Extraer los parámetros de la query
    const { id, authorization, status, transaction_type } = req.query;

    console.log('OpenPay callback:', req.query);

    // Validar que el pago fue completado
    if (!id) {
      console.warn('ID faltante.');
      return res.redirect(`${FRONT_URL}/?payment_failed=1`);
    }

    // Consultar la transacción en OpenPay
    openpay.charges.get(id, async (error, transaction) => {
      if (error) {
        console.error('Error al consultar transacción:', error);
        return res.redirect(`${FRONT_URL}/?payment_failed=1`);
      }

      // Extraer metadata
      const { username, shipCost, products } = transaction.metadata || {};

      if (!username || !products) {
        console.error('Metadata incompleta:', transaction.metadata);
        return res.redirect(`${FRONT_URL}/?payment_failed=1`);
      }

      // Parsear la lista de productos
      let parsedProducts;
      try {
        parsedProducts = JSON.parse(products);
        if (!Array.isArray(parsedProducts)) {
          throw new Error('La lista de productos no es un array.');
        }
      } catch (parseError) {
        console.error('Error al parsear productos:', parseError);
        return res.redirect(`${FRONT_URL}/?payment_failed=1`);
      }

      // Construir el objeto de la orden
      const orderBody = {
        username,
        shipCost,
        proveedorPagoId: transaction.id, // ID de la transacción de OpenPay
        products: parsedProducts,
      };

      console.log('Creando orden con:', orderBody);

      try {
        // Crear la orden mediante una solicitud POST
        const data = await createOrder(orderBody);
        console.log('Orden creada exitosamente:', data);

        // Verificar que 'data' contiene el número de la orden
        if (!data.number) {
          throw new Error('La respuesta de createOrder no contiene el número de la orden.');
        }

        // Redirigir al usuario a la página de resumen de la orden
        return res.redirect(`${FRONT_URL}/resumen/${data.number}?charge=${transaction.id}`);
      } catch (createError) {
        console.error('Error al crear la orden:', createError);
        return res.redirect(`${FRONT_URL}/?payment_failed=1`);
      }
    });
  } catch (error) {
    console.error('Error en /callback:', error);
    return res.redirect(`${FRONT_URL}/?payment_failed=1`);
  }
});


module.exports = router;