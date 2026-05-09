import { defineConfig } from "vite";

export default defineConfig({
    root: ".",
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                admin: "./admin.html",
                client: "./client.html",
                preview: "./preview.html",
            }
        }
    },
    server: {
        port: 5173,
        open: "/admin.html"   // ← auto opens this page on npm run dev
    }
});