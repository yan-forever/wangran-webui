import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import zipPack from 'vite-plugin-zip-pack';
import * as path from 'node:path';
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // process.cwd() 获取当前项目根目录
    const env = loadEnv(mode, process.cwd());

    return {
        plugins: [
            react(),
            tailwindcss(),
            zipPack({
                inDir: 'dist',
                outDir: 'build',
                outFileName: 'wangran-webui.zip',
            }),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            proxy: {
                '/api': {
                    // 4. 使用 env.VITE_BACKEND_API 访问
                    target: env.VITE_BACKEND_API,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
    };
});
