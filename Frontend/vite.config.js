import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
// export default defineConfig1( {
//   plugins: [
//     react(),
//     // visualizer({open:true})
//   ],
// } );


export default defineConfig( {
  plugins: [
    react(),
    // visualizer({open:true})
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3003", // backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
} );
