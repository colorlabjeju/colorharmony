import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" 로 두면 저장소 이름과 상관없이 GitHub Pages에서 동작합니다.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
