import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

console.log('🎯 Starting Vue app initialization...')

try {
  // Create app instance
  const app = createApp(App)
  console.log('✅ Vue app instance created')

  // Initialize Pinia FIRST
  const pinia = createPinia()
  app.use(pinia)
  console.log('✅ Pinia store initialized')

  // Try to import and use router
  let router
  try {
    router = await import('./router/index.js')
    app.use(router.default)
    console.log('✅ Vue Router initialized')
  } catch (routerError) {
    console.warn('⚠️ Vue Router not available:', routerError.message)
    console.log('ℹ️ App will run without routing')
  }

  // Mount the app
  app.mount('#app')
  console.log('✅ Vue app mounted successfully!')
  
} catch (error) {
  console.error('❌ Vue app initialization failed:', error)
  
  // Show error in UI
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8d7da; color: #721c24; padding: 20px; text-align: center;">
        <div>
          <h2>🚨 Application Error</h2>
          <p>Failed to initialize application:</p>
          <pre style="background: white; padding: 10px; border-radius: 5px; margin: 10px 0; text-align: left;">${error.message}</pre>
          <p>Check browser console for details.</p>
        </div>
      </div>
    `
  }
}
