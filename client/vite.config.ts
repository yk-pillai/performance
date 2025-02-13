import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: "brotliCompress", // or 'gzip'
      verbose: true,
    }),
  ],
  server: {
    host: "0.0.0.0", // Allow external access
    port: 3000,
  },
});
