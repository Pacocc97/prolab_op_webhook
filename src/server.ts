import { createApp } from "./app";
import { config } from "./config";

async function main() {
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`Servidor Express en puerto ${config.port}`);
  });
}

main().catch((err) => {
  console.error("Error al iniciar la aplicación:", err);
});
