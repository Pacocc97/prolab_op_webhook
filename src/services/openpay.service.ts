import Openpay from "openpay";
import { config } from "../config";

const openpay = new Openpay(
  config.openpay.merchantId,
  config.openpay.privateKey,
  config.openpay.production
);

// Por si requieres deshabilitar la validación de certificados
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export interface ChargeRequest {
  method: string;
  source_id: string;
  amount: number;
  description: string;
  device_session_id: string;
  use_3d_secure: boolean;
  redirect_url: string;
  metadata?: any;
  customer: {
    name: string;
    last_name: string;
    email: string;
  };
}

export function createCharge(chargeRequest: ChargeRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    openpay.charges.create(chargeRequest, (error: any, charge: any) => {
      if (error) {
        return reject(error);
      }
      resolve(charge);
    });
  });
}

export function getCharge(chargeId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    openpay.charges.get(chargeId, (error: any, transaction: any) => {
      if (error) {
        return reject(error);
      }
      resolve(transaction);
    });
  });
}
