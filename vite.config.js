import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const contactApiMiddleware = () => ({
  name: "contact-api-middleware",
  configureServer(server) {
    server.middlewares.use("/api/contact", async (req, res) => {
      try {
        const mod = await server.ssrLoadModule("/api/contact.js");
        await mod.default(req, res);
      } catch (error) {
        console.error("Local contact handler error:", error);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Erro interno do servidor" }));
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), contactApiMiddleware()],
});
