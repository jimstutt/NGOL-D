<template>
  <div class="admin-page">
    <h1>👥 Administration</h1>
    <p>User and system administration will appear here.</p>
    <div class="placeholder-content">
      <h3>Features Coming Soon:</h3>
      <ul>
        <li>User management</li>
        <li>Warehouse configuration</li>
        <li>Transport provider management</li>
        <li>System settings</li>
      </ul>
    </div>
  </div>
</template>

<script>
import UserModal from '@/components/UserModal.vue';
import WarehouseModal from '@/components/WarehouseModal.vue';
import TransportModal from '@/components/TransportModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
export default {
  name: 'Admin'
}
</script>

<style scoped>
.admin-page {
  padding: 20px;
}

.placeholder-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.placeholder-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.placeholder-content li {
  margin-bottom: 8px;
}
</style>
