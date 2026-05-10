import { defineConfig } from "vite";

export default defineConfig({
    root: ".",
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                login:    "./login.html",
                register: "./register.html",
                admin:    "./admin.html",
                client:   "./client.html",
                preview:  "./preview.html",
            }
        }
    },
    server: {
        port: 5173,
        open: "/login.html"   // ← opens login page on npm run dev
    }
});