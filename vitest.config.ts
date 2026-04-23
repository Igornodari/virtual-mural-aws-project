import { defineConfig } from 'vitest/config';

export default defineConfig({
  optimizeDeps: {
    include: ['file-saver'],
  },
  test: {
    server: {
      deps: {
        inline: ['file-saver', 'ngx-lightbox'],
      },
    },
  },
});
