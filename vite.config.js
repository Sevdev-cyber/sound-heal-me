import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
    // Server configuration
    server: {
        port: 3000,
        open: true,
        proxy: {
            // Proxy API requests to backend
            '/api': {
                target: process.env.RAILWAY_STATIC_URL || 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },

    // Build configuration
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunk for dependencies
                    vendor: ['chart.js'],
                    // Sound engine chunk (large, loaded on demand)
                    sound: [
                        './src/components/sound/chakra-bowls.js',
                        './src/components/sound/mantras.js',
                    ],
                    // Breathwork chunk (loaded on demand)
                    breathwork: [
                        './src/components/breathwork/WimHofMethod.js',
                        './src/components/breathwork/Pranayama.js',
                    ],
                },
            },
        },
        // Target modern browsers, legacy plugin handles older ones
        target: 'es2020',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.logs in production
                drop_debugger: true,
            },
        },
    },

    // Plugins
    plugins: [
        // Support for older browsers (Safari 12+, Chrome 60+)
        legacy({
            targets: ['defaults', 'not IE 11'],
        }),
    ],

    // Optimize dependencies
    optimizeDeps: {
        include: ['chart.js'],
    },

    // Asset handling
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.webp'],
});
