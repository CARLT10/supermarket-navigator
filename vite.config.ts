import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
      'extent-comrade-roundness.ngrok-free.dev'
    ]
  }
})

import react from '@vitejs/plugin-react'