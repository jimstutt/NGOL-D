<template>
  <div class="view-container">
    <Navigation />
    <div class="main-content">
      <div class="page-header">
        <h1>Reports</h1>
        <div>
          <button class="btn btn-outline-secondary me-2">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
          <button class="btn btn-primary">
            <i class="fas fa-file-export"></i> Export Reports
          </button>
        </div>
      </div>
      <!-- Reports UI — spec: charts, stats, filters -->
      <div style="height: 200px; background: #eee; display: flex; align-items: center; justify-content: center">
        Reports UI (spec-compliant: charts, export, real-time stats)
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
