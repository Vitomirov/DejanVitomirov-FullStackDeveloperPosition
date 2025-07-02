import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Explicitly include .js files for React plugin processing.
      // This ensures that files using React hooks (like AuthContext.js)
      // are correctly processed by the React plugin, even without JSX syntax.
      include: "**/*.{js,jsx,ts,tsx}",
    }),
  ],
});
