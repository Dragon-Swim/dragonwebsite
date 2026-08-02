import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                dashboard: resolve(__dirname, 'dashboard.html'),
                registration: resolve(__dirname, 'registration.html'),
                signin: resolve(__dirname, 'signin.html'),
                privacy: resolve(__dirname, 'privacy.html'),
                terms: resolve(__dirname, 'terms.html'),
                safesport: resolve(__dirname, 'safesport.html'),
                admin: resolve(__dirname, 'admin.html'),
            },
        },
    },
    server: {
        proxy: {
            '/usas-api': {
                target: 'https://times-api.usaswimming.org',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/usas-api/, ''),
                // Don't add X-Forwarded headers — some APIs reject them
                xfwd: false,
            },
        },
    },
});
