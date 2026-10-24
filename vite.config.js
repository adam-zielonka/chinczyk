import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
export default defineConfig({
  base: './', plugins: [react({ jsxRuntime: 'classic' })],
  test: { globals: true, environment: 'happy-dom' },
})
