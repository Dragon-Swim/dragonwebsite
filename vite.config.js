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
});
