import axios from "axios";
import { config } from "../config";

export interface MailBody {
  username: string;
  numero: string;
  asunto: string;
  bandera: string;
}

export async function sendMail(body: MailBody): Promise<void> {
  await axios.post(`${config.urls.baseUrl}/pSendMail`, body);
}
