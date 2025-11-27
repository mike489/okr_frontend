import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

// ----------------------------------------------------------------------

export default defineConfig({
  plugins: [react(), jsconfigPaths()],

  optimizeDeps: {
    include: ['jwt-decode'],
    exclude: [
      'chunk-LFYLLGUC',
      'chunk-MRW7477U',
      'chunk-UAJHDIQT',
      'chunk-JAULPSYG',
      'chunk-JDJWOJYE',
      'chunk-Z2CPFR44',
      'chunk-S6LQLAKD',
      'chunk-WOCNRSER',
      'chunk-J4IQ5WAQ',
      'chunk-ZMWSBLPE',
      'chunk-PITYFMOH',
      'chunk-FETGDICG'
    ]
  },
  base: '/',
  define: {
    global: 'window'
  },

  server: {
    open: false,
    host: true,
    port: 5000
  },
  preview: {
    open: true,
    port: 5000
  }
});
