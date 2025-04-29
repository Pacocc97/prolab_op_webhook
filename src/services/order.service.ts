import axios, { AxiosRequestConfig } from "axios";
import { config } from "../config";

export interface OrderBody {
  username: string;
  shipCost?: number;
  proveedorPagoId: string;
  products: any[];
}

export async function createOrder(
  body: OrderBody,
  options?: AxiosRequestConfig
): Promise<any> {
  const response = await axios.post(
    `${config.urls.baseUrl}/NewOrder`,
    body,
    options
  );
  return response.data;
}
