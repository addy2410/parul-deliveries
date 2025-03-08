
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// We'll remove the import completely
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Completely remove any reference to the componentTagger
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
