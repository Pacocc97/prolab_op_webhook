// Puedes poner aquí la inicialización de tus servicios (por ejemplo, crear instancias de OpenPay, configuración de variables de entorno, etc.).
import dotenv from "dotenv";

// Carga .env
dotenv.config();

export const config = {
  port: process.env.PORT || "5005",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(","),
  openpay: {
    // merchantId: process.env.OPENPAY_MERCHANT_ID || "mkk673wuxmi4xvii20cf",
    merchantId: process.env.OPENPAY_MERCHANT_ID || "mzf9mmojexntfllthzal",
    privateKey:
      // process.env.OPENPAY_PRIVATE_KEY || "sk_3c78be60065d4f89ab1eb7ef2a060ac7",
      process.env.OPENPAY_PRIVATE_KEY || "sk_09565b022fd8461698de06e6bdc2a67a",
    production: process.env.OPENPAY_PRODUCTION_MODE === "false",
  },
  urls: {
    backUrl:
      // process.env.BACK_URL || "https://prolab.adaflex.mx/webhook/openpay",
      process.env.BACK_URL || "http://localhost:5005/openpay",
    // frontUrl: process.env.FRONT_URL || "http://localhost:3000",
    frontUrl: process.env.FRONT_URL || "http://localhost:5173",
    baseUrl:
      // process.env.BASE_URL || "https://prolab.adaflex.mx/datasnap/rest/TSMREST",
      process.env.BASE_URL || "https://srv01.adaflex.mx/datasnap/rest/TSMREST",
  },
};
