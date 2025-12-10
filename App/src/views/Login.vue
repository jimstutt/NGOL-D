<template>
  <div class="login-container">
    <div class="login-form">
      <h2>🔐 NGO Logistics Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email:</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="Enter email"
            required
          />
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Enter password"
            required
          />
        </div>
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="demo-credentials">
        <h3>Demo Credentials:</h3>
        <div class="credential-set">
          <strong>Admin:</strong> ngoadmin@logistics.org / NgoAdmin123!
        </div>
        <div class="credential-set">
          <strong>Admin 2:</strong> admin@example.org / password123
        </div>
        <div class="credential-set">
          <strong>Manager:</strong> manager@logistics.org / Manager123!
        </div>
        <div class="credential-set">
          <strong>User:</strong> user@logistics.org / User123!
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Login',
  emits: ['login-success', 'login-error'],
  setup(props, { emit }) {
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      loading.value = true
      error.value = ''

      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value
          })
        })

        const data = await response.json()

        if (response.ok) {
          emit('login-success', data)
        } else {
          error.value = data.error || 'Login failed'
          emit('login-error', new Error(data.error))
        }
      } catch (err) {
        error.value = 'Network error: ' + err.message
        emit('login-error', err)
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 450px;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #3498db;
  outline: none;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 20px;
}

.login-btn:hover:not(:disabled) {
  background: #2980b9;
}

.login-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.demo-credentials {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  border-left: 4px solid #3498db;
}

.demo-credentials h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1em;
}

.credential-set {
  margin-bottom: 8px;
  font-size: 0.9em;
  color: #5a6c7d;
}

.credential-set:last-child {
  margin-bottom: 0;
}

.credential-set strong {
  color: #2c3e50;
}
</style>
