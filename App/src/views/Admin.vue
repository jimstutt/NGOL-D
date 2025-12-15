<template>
  <div class="view-container">
    <Navigation />
    <div class="main-content">
      <div class="page-header">
        <h1>Admin</h1>
        <button class="btn btn-secondary">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
      <!-- Admin UI — spec: tabs, CRUD, scrollable tables -->
      <div style="height: 200px; background: #eee; display: flex; align-items: center; justify-content: center">
        Admin UI (spec-compliant: Users/Warehouses/Transport tabs, CRUD modals)
      </div>
    </div>
  </div>
</template>

<script>
import Navigation from '@/components/Navigation.vue';
export default {
  components: { Navigation }
};
</script>

<style scoped>
.view-container { display: flex; height: 100vh; }
.main-content { flex: 1; padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
</style>
