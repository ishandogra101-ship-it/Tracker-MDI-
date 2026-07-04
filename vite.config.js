import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub repo name for a project-page URL:
// https://ishandogra101-ship-it.github.io/Tracker-MDI-/
export default defineConfig({
  plugins: [react()],
  base: '/Tracker-MDI-/',
})
