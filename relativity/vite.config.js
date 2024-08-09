import { defineConfig } from "vite";
import path from 'path';

export default defineConfig({
    root: path.join(__dirname, 'src'),
    build: {
        target: 'esnext',
        outDir: path.join(__dirname, 'dist'),
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: path.join(__dirname, 'src/client/index.html'),
                game: path.join(__dirname, 'src/client/game/index.html'),
            },
        },
    },
});