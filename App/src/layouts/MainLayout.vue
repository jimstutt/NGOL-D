<template>
  <div class="main-layout">
    <header class="header">
      <div class="header-content">
        <h1>🏥 NGO Logistics</h1>
        <div class="user-info">
          <span>Welcome, {{ user?.username || 'User' }}</span>
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </div>
      </div>
    </header>
    
    <div class="layout-body">
      <nav class="sidebar">
        <ul class="nav-menu">
          <li>
            <router-link to="/dashboard" class="nav-link" active-class="active">
              📊 Dashboard
            </router-link>
          </li>
          <li>
            <router-link to="/shipments" class="nav-link" active-class="active">
              🚚 Shipments
            </router-link>
          </li>
          <li>
            <router-link to="/reports" class="nav-link" active-class="active">
              📈 Reports
            </router-link>
          </li>
          <li>
            <router-link to="/admin" class="nav-link" active-class="active">
              👥 Admin
            </router-link>
          </li>
        </ul>
      </nav>
      
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'MainLayout',
  emits: ['logout'],
  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const user = computed(() => authStore.user)

    const handleLogout = () => {
      if (confirm('Are you sure you want to logout?')) {
        authStore.logout()
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        router.push('/')
        emit('logout')
      }
    }

    return {
      user,
      handleLogout
    }
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 0;
}

.header h1 {
  margin: 0;
  font-size: 1.5em;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover {
  background: #c0392b;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background: #34495e;
  color: white;
  padding: 20px 0;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  margin: 0;
}

.nav-link {
  display: block;
  padding: 15px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: background-color 0.3s;
  border-left: 4px solid transparent;
}

.nav-link:hover {
  background: #2c3e50;
}

.nav-link.active {
  background: #2c3e50;
  border-left-color: #3498db;
  color: white;
}

.main-content {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  overflow-y: auto;
}
</style>
