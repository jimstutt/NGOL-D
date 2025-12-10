import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const currentUser = computed(() => user.value)

  function setUser(userData) {
    user.value = userData
  }

  function setToken(authToken) {
    token.value = authToken
  }

  function logout() {
    user.value = null
    token.value = null
  }

  // Mock login for demonstration
  function mockLogin(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'ngoadmin@logistics.org' && password === 'NgoAdmin123!') {
          const userData = {
            id: 1,
            username: 'ngoadmin',
            email: email,
            role: 'admin',
            organization_id: 1
          }
          setUser(userData)
          setToken('mock-jwt-token-12345')
          resolve(userData)
        } else {
          reject(new Error('Invalid credentials'))
        }
      }, 1000)
    })
  }

  return {
    user,
    token,
    isAuthenticated,
    currentUser,
    setUser,
    setToken,
    logout,
    mockLogin
  }
})
