// NGO Logistics — Minimal, robust Vue 3 entry (spec-compliant)
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';

// Components
import App from './App.vue';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';

// Pinia store
const pinia = createPinia();

// Router (Login.vue first — per spec)
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard }
  ]
});

// App
const app = createApp(App);

app.use(pinia);
app.use(router);

// Mount only after router is ready
router.isReady().then(() => {
  app.mount('#app');
  console.log('✅ Vue app mounted successfully — Login.vue first');
}).catch(err => {
  console.error('❌ Router init failed:', err);
});
