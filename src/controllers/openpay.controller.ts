import { Request, Response } from "express";
import { createCharge, getCharge } from "../services/openpay.service";
import { createOrder } from "../services/order.service";
import { sendMail } from "../services/mail.service";

import { config } from "../config";
import { RequestHandler } from "express-serve-static-core";

export const createChargeController = async (req: Request, res: Response) => {
  try {
    const {
      method,
      description,
      deviceSessionId,
      sourceId,
      amount,
      customer,
      order,
      enable3DS, // <-- nuevo
    } = req.body;

    const { name, last_name, email } = customer;
    const { username, shippingCost, products } = order;
    console.log("createChargeController", Math.ceil(amount * 100) / 100);

    const chargeRequest: any = {
      method: method || "card",
      source_id: sourceId,
      amount: Math.ceil(amount * 100) / 100,
      description: description || "Compra desde Express con 3D Secure",
      device_session_id: deviceSessionId,
      metadata: {
        username,
        shippingCost,
        products,
      },
      customer: {
        name,
        last_name,
        email,
      },
    };

    // Activar 3DS por defecto, a menos que explícitamente sea false
    if (enable3DS !== false) {
      chargeRequest.use_3d_secure = true;
      chargeRequest.redirect_url = `${config.urls.backUrl}/callback`;
    }

    const charge = await createCharge(chargeRequest);
    // console.log("Cargo creado:", charge);
    // console.log("enable3DS", enable3DS);
    if (enable3DS === false && charge.status === "completed") {
      const orderBody = {
        username,
        shipCost: shippingCost,
        proveedorPagoId: charge.id,
        products:
          typeof products === "string" ? JSON.parse(products) : products,
      };

      try {
        console.log("Intentando crear orden con:", orderBody);
        const data = await createOrder(orderBody);
        console.log("Orden creada:", data);

        console.log("Enviando correo de confirmación con número:", data.number);
        try {
          await sendMail({
            username: username,
            numero: String(data.number),
            asunto: "Compra realizada con éxito",
            bandera: "A",
          });
        } catch (mailError) {
          console.error("Error al enviar el correo:", mailError);
        }

        res.json({
          charge,
          order: data,
        });
        return;
      } catch (createError) {
        console.error("Error al crear la orden:", createError);
        res.status(500).json({ error: "Error al crear la orden" });
        return;
      }
    }

    res.json({ charge });
    return;
  } catch (error) {
    console.error("Error al crear cargo:", error);
    res.status(500).json({ error: "Error interno al crear cargo" });
  }
};

export async function openPayCallbackController(req: Request, res: Response) {
  try {
    const { id } = req.query;

    console.log("OpenPay callback:", req.query);

    if (!id) {
      return res.redirect(`${config.urls.frontUrl}/?payment_failed=1`);
    }

    // Consultar la transacción en OpenPay
    const transaction = await getCharge(String(id));

    // Extraer metadata
    const { username, shippingCost, products } = transaction.metadata || {};
    if (!username || !products) {
      console.error("Metadata incompleta:", transaction.metadata);
      return res.redirect(`${config.urls.frontUrl}/?payment_failed=1`);
    }

    // Parsear la lista de productos
    let parsedProducts: any[];
    try {
      parsedProducts =
        typeof products === "string" ? JSON.parse(products) : products;
      if (!Array.isArray(parsedProducts)) {
        throw new Error("La lista de productos no es un array.");
      }
    } catch (err) {
      console.error("Error al parsear productos:", err);
      return res.redirect(`${config.urls.frontUrl}/?payment_failed=1`);
    }

    // Construir el objeto de la orden
    const orderBody = {
      username,
      shipCost: shippingCost,
      proveedorPagoId: transaction.id,
      products: parsedProducts,
    };

    console.log("Creando orden con:", orderBody);

    try {
      const data = await createOrder(orderBody);
      console.log("Orden creada exitosamente:", data);

      // Verificar que la respuesta contenga el número de la orden
      if (!data.number) {
        throw new Error(
          "La respuesta de createOrder no contiene el número de la orden."
        );
      }

      try {
        await sendMail({
          username: username,
          numero: String(data.number),
          asunto: "Compra realizada con éxito",
          bandera: "A",
        });
      } catch (mailError) {
        console.error("Error al enviar el correo:", mailError);
      }

      // Redirigir al usuario a la página de resumen de la orden
      return res.redirect(
        `${config.urls.frontUrl}/resumen/${data.number}?charge=${transaction.id}`
      );
    } catch (createError) {
      console.error("Error al crear la orden:", createError);
      return res.redirect(`${config.urls.frontUrl}/?payment_failed=1`);
    }
  } catch (error) {
    console.error("Error en /callback:", error);
    return res.redirect(`${config.urls.frontUrl}/?payment_failed=1`);
  }
}
