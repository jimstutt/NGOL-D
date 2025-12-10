<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <button class="btn btn-primary refresh-btn" @click="refreshData">
        <i class="fas fa-sync-alt"></i> Refresh
      </button>
    </div>

    <!-- Statistics Cards - Height reduced to 120px -->
    <div class="stats-grid">
      <div class="stat-card" style="height: 120px">
        <div class="stat-icon">
          <i class="fas fa-shipping-fast"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalShipments }}</h3>
          <p>Total Shipments</p>
          <div class="stat-trend up">
            <i class="fas fa-arrow-up"></i>
            <span>12%</span>
          </div>
        </div>
      </div>

      <div class="stat-card" style="height: 120px">
        <div class="stat-icon delivery">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.deliveryRate }}%</h3>
          <p>Delivery Rate</p>
          <div class="stat-trend down">
            <i class="fas fa-arrow-down"></i>
            <span>5%</span>
          </div>
        </div>
      </div>

      <div class="stat-card" style="height: 120px">
        <div class="stat-icon avg-delivery">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.avgDeliveryDays }}</h3>
          <p>Avg Delivery (Days)</p>
          <div class="stat-trend up">
            <i class="fas fa-arrow-up"></i>
            <span>8%</span>
          </div>
        </div>
      </div>

      <div class="stat-card" style="height: 120px">
        <div class="stat-icon inventory">
          <i class="fas fa-boxes"></i>
        </div>
        <div class="stat-content">
          <h3>${{ stats.inventoryValue }}</h3>
          <p>Inventory Value</p>
          <div class="stat-trend down">
            <i class="fas fa-arrow-down"></i>
            <span>15%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Section -->
    <div class="map-section">
      <div class="map-controls">
        <div class="map-legend">
          <h4>Map Legend</h4>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-color warehouse"></div>
              <span>Warehouses</span>
            </div>
            <div class="legend-item">
              <div class="legend-color in-transit"></div>
              <span>In-Transit Shipments</span>
            </div>
            <div class="legend-item">
              <div class="legend-color delayed"></div>
              <span>Delayed Shipments</span>
            </div>
            <div class="legend-item">
              <div class="legend-color pending"></div>
              <span>Pending Shipments</span>
            </div>
          </div>
        </div>
        <div class="visibility-controls">
          <button 
            class="btn btn-outline-primary" 
            :class="{ active: showWarehouses }"
            @click="showWarehouses = !showWarehouses"
          >
            Show Warehouses
          </button>
          <button 
            class="btn btn-outline-primary" 
            :class="{ active: showShipments }"
            @click="showShipments = !showShipments"
          >
            Show Shipments
          </button>
        </div>
      </div>

      <div class="map-container">
        <MapView 
          :warehouses="warehouses"
          :shipments="shipments"
          :show-warehouses="showWarehouses"
          :show-shipments="showShipments"
          @marker-click="handleMarkerClick"
        />
      </div>
    </div>

    <!-- Info Modal -->
    <div v-if="selectedItem" class="modal fade show" style="display: block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ selectedItem.type === 'warehouse' ? 'Warehouse Details' : 'Shipment Details' }}
            </h5>
            <button type="button" class="btn-close" @click="selectedItem = null"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedItem.type === 'warehouse'">
              <p><strong>Location:</strong> {{ selectedItem.data.location }}</p>
              <p><strong>Capacity:</strong> {{ selectedItem.data.capacity }} sq m</p>
              <p><strong>Current Inventory:</strong> {{ selectedItem.data.currentInventory }} items</p>
              <p><strong>Contact:</strong> {{ selectedItem.data.contactEmail }}</p>
            </div>
            <div v-else>
              <p><strong>Description:</strong> {{ selectedItem.data.description }}</p>
              <p><strong>Quantity:</strong> {{ selectedItem.data.quantity }}</p>
              <p><strong>Status:</strong> 
                <span :class="`status-badge ${selectedItem.data.status}`">
                  {{ selectedItem.data.status }}
                </span>
              </p>
              <p><strong>Destination:</strong> {{ selectedItem.data.destination }}</p>
              <p><strong>Last Update:</strong> {{ selectedItem.data.lastUpdate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedItem" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import MapView from '../components/MapView.vue'
import { useShipmentStore } from '../stores/shipment'

export default {
  name: 'Dashboard',
  components: {
    MapView
  },
  setup() {
    const shipmentStore = useShipmentStore()
    const stats = ref({
      totalShipments: 156,
      deliveryRate: 92,
      avgDeliveryDays: 3.2,
      inventoryValue: '245K'
    })
    
    const warehouses = ref([])
    const shipments = ref([])
    const showWarehouses = ref(true)
    const showShipments = ref(true)
    const selectedItem = ref(null)

    const refreshData = async () => {
      await shipmentStore.fetchWarehouses()
      await shipmentStore.fetchShipments()
      warehouses.value = shipmentStore.warehouses
      shipments.value = shipmentStore.shipments
    }

    const handleMarkerClick = (item) => {
      selectedItem.value = item
    }

    onMounted(() => {
      refreshData()
    })

    return {
      stats,
      warehouses,
      shipments,
      showWarehouses,
      showShipments,
      selectedItem,
      refreshData,
      handleMarkerClick
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h1 {
  color: #2c3e50;
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.stat-icon:not(.delivery):not(.avg-delivery):not(.inventory) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.delivery {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.avg-delivery {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.inventory {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-content h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-content p {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-size: 14px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: bold;
}

.stat-trend.up {
  color: #28a745;
}

.stat-trend.down {
  color: #dc3545;
}

.map-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.map-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.map-legend {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.map-legend h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #495057;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.legend-color.warehouse {
  background: #3498db;
}

.legend-color.in-transit {
  background: #2ecc71;
}

.legend-color.delayed {
  background: #e74c3c;
}

.legend-color.pending {
  background: #f39c12;
}

.visibility-controls {
  display: flex;
  gap: 10px;
}

.visibility-controls .btn.active {
  background-color: #007bff;
  color: white;
}

.map-container {
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: capitalize;
}

.status-badge.in-transit {
  background: #d4edda;
  color: #155724;
}

.status-badge.delayed {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .map-controls {
    flex-direction: column;
  }
  
  .visibility-controls {
    width: 100%;
  }
  
  .visibility-controls .btn {
    flex: 1;
  }
}
</style>
