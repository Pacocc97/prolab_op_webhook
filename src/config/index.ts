// Puedes poner aquí la inicialización de tus servicios (por ejemplo, crear instancias de OpenPay, configuración de variables de entorno, etc.).
import dotenv from "dotenv";

// Carga .env
dotenv.config();

export const config = {
  port: process.env.PORT || "5005",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(","),
  openpay: {
    merchantId: process.env.OPENPAY_MERCHANT_ID || "",
    privateKey: process.env.OPENPAY_PRIVATE_KEY || "",
    production: process.env.OPENPAY_PRODUCTION_MODE === "true",
  },
  urls: {
    backUrl: process.env.BACK_URL || "http://localhost:5005/openpay",
    frontUrl: process.env.FRONT_URL || "http://localhost:3000",
    baseUrl:
      process.env.BASE_URL ||
      "https://srv01.adaflex.mx:4430/datasnap/rest/TSMREST",
  },
};
