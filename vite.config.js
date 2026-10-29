import { resolve } from 'path';
import { defineConfig } from 'vite';

// dev 代理目标。默认指向旧 host —— 它自 2026-10-27 起整站 403,只作为对照保留。
// 本地验证新 Data Hub 接口时,先起 local-tools/usas-proxy.mjs,再:
//   $env:USAS_PROXY_TARGET='http://127.0.0.1:8787'; npm run dev
// 背景:docs/swim-results-fetch.md §12
const USAS_TARGET = process.env.USAS_PROXY_TARGET || 'https://times-api.usaswimming.org';

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
                // 家长确认稿:独立入口,不进 dashboard 的 DOM(#app 每次快照都会重建)
                'meet-print': resolve(__dirname, 'meet-print.html'),
            },
        },
    },
    server: {
        proxy: {
            '/usas-api': {
                target: USAS_TARGET,
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/usas-api/, ''),
                // Don't add X-Forwarded headers — some APIs reject them
                xfwd: false,
            },
        },
    },
});
