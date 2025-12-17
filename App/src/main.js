import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';          // ✅ Must import
import './styles.css';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);                        // ✅ Must use

router.isReady().then(() => {
  app.mount('#app');
  console.log('✅ Vue app mounted successfully — Login.vue first');
}).catch(err => {
  console.error('❌ Router init failed:', err);
});
