import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true
  },
  resolve: {
    alias: {
      constants: path.resolve(__dirname, "./src/constants"),
      domains: path.resolve(__dirname, "./src/domains"),
      adapters: path.resolve(__dirname, "./src/adapters"),
      di: path.resolve(__dirname, "./src/di"),
      hooks: path.resolve(__dirname, "./src/frameworks/hooks"),
      components: path.resolve(__dirname, "./src/frameworks/components")
    }
  }
})
