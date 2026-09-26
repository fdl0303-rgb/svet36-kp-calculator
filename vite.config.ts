import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('pdfmake')) return 'pdfmake'
          if (id.includes('exceljs') || id.includes('jszip')) return 'exceljs'
          return undefined
        },
      },
    },
  },
})
