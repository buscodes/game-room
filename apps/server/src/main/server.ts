import { buildApp } from "./container";

// Yerel geliştirme sunucusu
const port = Number(process.env.PORT) || 3001;
buildApp().listen(port, () => console.log(`[server] http://localhost:${port}`));
