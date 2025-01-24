// Puedes poner aquí la inicialización de tus servicios (por ejemplo, crear instancias de OpenPay, configuración de variables de entorno, etc.).
import dotenv from "dotenv";

// Carga .env
dotenv.config();

export const config = {
  port: process.env.PORT || "5005",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(","),
  openpay: {
    merchantId: process.env.OPENPAY_MERCHANT_ID || "mkk673wuxmi4xvii20cf",
    privateKey:
      process.env.OPENPAY_PRIVATE_KEY || "sk_3c78be60065d4f89ab1eb7ef2a060ac7",
    production: process.env.OPENPAY_PRODUCTION_MODE === "false",
  },
  urls: {
    backUrl:
      process.env.BACK_URL || "https://prolab.adaflex.mx/webhook/openpay",
    frontUrl: process.env.FRONT_URL || "http://localhost:3000",
    baseUrl:
      process.env.BASE_URL || "https://prolab.adaflex.mx/datasnap/rest/TSMREST",
  },
};
