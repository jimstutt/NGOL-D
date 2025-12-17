<template>
  <div class="reports-container">
    <Navigation />
    <div class="main-content">
      <div class="page-header">
        <h1>Reports</h1>
        <div>
          <button class="btn btn-outline-secondary me-2" @click="refreshData">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
          <button class="btn btn-primary" @click="exportReports">
            <i class="fas fa-file-export"></i> Export Reports
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>156 <span class="trend up">↑12%</span></h3>
          <p>Total Shipments</p>
        </div>
        <div class="stat-card">
          <h3>92% <span class="trend down">↓5%</span></h3>
          <p>Delivery Rate</p>
        </div>
        <div class="stat-card">
          <h3>3.2 <span class="trend up">↑8%</span></h3>
          <p>Avg Delivery (Days)</p>
        </div>
        <div class="stat-card">
          <h3>$245K <span class="trend down">↓15%</span></h3>
          <p>Inventory Value</p>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <div class="chart-card">
          <h4>Delivery Performance</h4>
          <div class="chart-placeholder">📈 Chart.js Doughnut</div>
        </div>
        <div class="chart-card">
          <h4>Inventory Analytics</h4>
          <div class="chart-placeholder">📊 Bar Chart</div>
        </div>
        <div class="chart-card">
          <h4>Risk Assessment Matrix</h4>
          <div class="chart-placeholder">⚠️ Risk Matrix</div>
        </div>
        <div class="chart-card">
          <h4>Shipment Status Distribution</h4>
          <div class="chart-placeholder">🥧 Pie Chart</div>
        </div>
        <div class="chart-card">
          <h4>Priority Breakdown</h4>
          <div class="chart-placeholder">🔴🟠🟢 Priority</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Navigation from '@/components/Navigation.vue'

const refreshData = () => {
  console.log('✅ Reports refreshed')
}

const exportReports = () => {
  const data = { timestamp: new Date().toISOString(), report: 'NGOL Reports Export' }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `NGOL-Reports-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => refreshData())
</script>

<style scoped>
.reports-container { display: flex; height: 100vh; background-color: #f8f9fa; }
.main-content { flex: 1; padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap:15px; margin-bottom:25px; }
.stat-card { background:white; padding:15px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); text-align:center; }
.stat-card h3 { margin:0 0 5px; font-size:1.5rem; }
.trend { font-size:0.85rem; margin-left:6px; }
.trend.up { color:#28a745; }
.trend.down { color:#dc3545; }
.charts-grid { display: grid; grid-template-columns: repeat(3,1fr); gap:20px; }
.chart-card { background:white; border-radius:8px; padding:15px; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
.chart-card h4 { margin:0 0 10px; font-size:1rem; }
.chart-placeholder { height:150px; display:flex; align-items:center; justify-content:center; 
  background:#f8f9fa; color:#6c757d; border-radius:6px; }
</style>
