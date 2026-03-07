import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // 3. 根据当前模式（development 或 production）加载环境变量
    // process.cwd() 获取当前项目根目录
    const env = loadEnv(mode, process.cwd());

    return {
        plugins: [
            react(),
            tailwindcss(),
        ],
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
