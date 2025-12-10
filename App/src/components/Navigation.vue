<template>
  <nav class="navigation">
    <div class="nav-header">
      <h2>NGOLogistics</h2>
    </div>
    
    <ul class="nav-menu">
      <li>
        <router-link 
          to="/dashboard" 
          class="nav-link"
          :class="{ active: $route.name === 'Dashboard' }"
        >
          <i class="fas fa-tachometer-alt"></i>
          Dashboard
        </router-link>
      </li>
      <li>
        <router-link 
          to="/shipments" 
          class="nav-link"
          :class="{ active: $route.name === 'Shipments' }"
        >
          <i class="fas fa-shipping-fast"></i>
          Shipments
        </router-link>
      </li>
      <li>
        <router-link 
          to="/reports" 
          class="nav-link"
          :class="{ active: $route.name === 'Reports' }"
        >
          <i class="fas fa-chart-bar"></i>
          Reports
        </router-link>
      </li>
      <li v-if="authStore.user?.role === 'admin'">
        <router-link 
          to="/admin" 
          class="nav-link"
          :class="{ active: $route.name === 'Admin' }"
        >
          <i class="fas fa-cog"></i>
          Admin
        </router-link>
      </li>
    </ul>
    
    <div class="nav-footer">
      <div class="user-info">
        <span class="user-name">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
        <span class="user-role">{{ authStore.user?.role }}</span>
      </div>
      <button @click="logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        Logout
      </button>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Navigation',
  setup() {
    const authStore = useAuthStore()
    
    const logout = () => {
      authStore.logout()
    }
    
    return {
      authStore,
      logout
    }
  }
}
</script>

<style scoped>
.navigation {
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  height: 100vh;
  display: flex;
  flex-direction: column;
  width: 250px;
  position: fixed;
  left: 0;
  top: 0;
}

.nav-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  background: white;
}

.nav-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

.nav-menu li {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  color: #495057;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background-color: #e9ecef;
  color: #2c3e50;
}

.nav-link.active {
  background-color: #e3f2fd;
  color: #1976d2;
  border-left-color: #1976d2;
}

.nav-link i {
  width: 20px;
  text-align: center;
  font-size: 1rem;
}

.nav-footer {
  padding: 20px;
  border-top: 1px solid #dee2e6;
  background: white;
}

.user-info {
  margin-bottom: 15px;
}

.user-name {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.user-role {
  display: block;
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: capitalize;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .navigation {
    width: 100%;
    height: auto;
    position: relative;
    flex-direction: row;
    align-items: center;
  }
  
  .nav-header {
    padding: 15px;
    border-bottom: none;
    border-right: 1px solid #dee2e6;
  }
  
  .nav-header h2 {
    font-size: 1.1rem;
  }
  
  .nav-menu {
    display: flex;
    flex: 1;
    overflow-x: auto;
  }
  
  .nav-link {
    padding: 15px 12px;
    border-left: none;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
  }
  
  .nav-link.active {
    border-left-color: transparent;
    border-bottom-color: #1976d2;
  }
  
  .nav-footer {
    display: none;
  }
}
</style>
