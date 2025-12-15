<template>
  <div class="view-container">
    <Navigation />
    <div class="main-content">
      <div class="page-header">
        <h1>Shipments</h1>
        <button class="btn btn-primary">
          <i class="fas fa-plus"></i> Add Shipment
        </button>
      </div>
      <!-- Shipments UI will go here — spec-compliant CRUD, filters, scroll -->
      <div style="height: 200px; background: #eee; display: flex; align-items: center; justify-content: center">
        Shipments UI (spec-compliant: side-by-side lists, filters, scroll, modal forms)
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
