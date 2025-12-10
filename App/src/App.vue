<template>
  <div id="app">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading NGO Logistics Management System...</p>
      </div>
    </div>

    <!-- Unauthenticated State - Show Login -->
    <div v-else-if="!isAuthenticated" class="auth-container">
      <Login 
        @login-success="handleLoginSuccess" 
        @login-error="handleLoginError"
      />
    </div>

    <!-- Authenticated State - Show Main Layout -->
    <MainLayout v-else @logout="handleLogout" />
    
    <!-- Global Error Modal -->
    <div v-if="globalError" class="error-modal">
      <div class="error-content">
        <h3>System Error</h3>
        <p>{{ globalError }}</p>
        <button @click="clearError" class="btn-primary">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onErrorCaptured, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import Login from './views/Login.vue'
import MainLayout from './layouts/MainLayout.vue'

export default {
  name: 'App',
  components: {
    Login,
    MainLayout
  },
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const isLoading = ref(true)
    const globalError = ref(null)

    // Use computed property for authentication state
    const isAuthenticated = computed(() => authStore.isAuthenticated)

    // Handle Vue component errors
    onErrorCaptured((error, component, info) => {
      console.error('Vue Error:', error)
      console.error('Component:', component)
      console.error('Info:', info)
      globalError.value = `Application Error: ${error.message}`
      return false // Prevent error propagation
    })

    const handleLoginSuccess = (data) => {
      console.log('Login successful:', data)
      
      // Update store with user data
      authStore.setUser(data.user)
      authStore.setToken(data.token)
      
      // Store in localStorage
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_data', JSON.stringify(data.user))
      
      // Navigate to dashboard
      router.push('/dashboard')
      
      globalError.value = null
    }

    const handleLoginError = (error) => {
      console.error('Login error:', error)
      globalError.value = `Login failed: ${error.message || 'Unknown error'}`
    }

    const handleLogout = () => {
      console.log('Logging out...')
      authStore.logout()
      
      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      // Navigate to login
      router.push('/')
      
      globalError.value = null
    }

    const clearError = () => {
      globalError.value = null
    }

    const initializeAuth = async () => {
      try {
        // Check for existing authentication
        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user_data')
        
        if (token && userData) {
          try {
            // Validate token with backend
            const response = await fetch('http://localhost:3000/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            
            if (response.ok) {
              const user = JSON.parse(userData)
              authStore.setUser(user)
              authStore.setToken(token)
              console.log('Auto-login successful')
              
              // Navigate to dashboard if not already there
              if (router.currentRoute.value.path === '/') {
                router.push('/dashboard')
              }
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('auth_token')
              localStorage.removeItem('user_data')
              authStore.logout()
            }
          } catch (error) {
            console.error('Token validation failed:', error)
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
            authStore.logout()
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        globalError.value = `Initialization error: ${error.message}`
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      console.log('App mounted - initializing authentication...')
      initializeAuth()
      
      // Global error handler
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason)
        globalError.value = `Application Error: ${event.reason?.message || 'Unknown error'}`
        event.preventDefault()
      })

      window.addEventListener('error', (event) => {
        console.error('Global Error:', event.error)
        globalError.value = `Runtime Error: ${event.error?.message || 'Unknown error'}`
      })
    })

    return {
      isAuthenticated,
      isLoading,
      globalError,
      handleLoginSuccess,
      handleLoginError,
      handleLogout,
      clearError
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #2c5aa0;
  --secondary-color: #3498db;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --error-color: #e74c3c;
  --background-color: #f8f9fa;
  --text-color: #2c3e50;
  --border-color: #dcdfe6;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* Loading Styles */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-spinner {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  font-size: 1.2em;
  font-weight: 500;
}

/* Auth Container */
.auth-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* Error Modal */
.error-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.error-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.error-content h3 {
  color: var(--error-color);
  margin-bottom: 15px;
  font-size: 1.3em;
}

.error-content p {
  margin-bottom: 20px;
  color: var(--text-color);
}

/* Button Styles */
.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background: #1a4a8a;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
