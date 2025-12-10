<template>
  <div class="shipment-tracker">
    <div class="tracker-header">
      <h2>Track Shipments</h2>
      <div class="search-box">
        <input 
          v-model="searchTerm" 
          placeholder="Search shipments..." 
          class="search-input"
        />
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>
    </div>

    <div class="shipments-list">
      <div 
        v-for="shipment in filteredShipments" 
        :key="shipment.id" 
        class="shipment-card"
        :class="`status-${shipment.status}`"
        @click="focusOnShipment(shipment)"
      >
        <div class="shipment-header">
          <h3>Shipment #{{ shipment.id }}</h3>
          <span class="status-badge">{{ shipment.status }}</span>
        </div>
        <div class="shipment-details">
          <p><strong>From:</strong> {{ shipment.origin }}</p>
          <p><strong>To:</strong> {{ shipment.destination }}</p>
          <p><strong>Estimated Delivery:</strong> {{ shipment.estimatedDelivery }}</p>
          <p v-if="shipment.lastUpdate">
            <strong>Last Update:</strong> {{ formatDate(shipment.lastUpdate) }}
          </p>
        </div>
        <div class="shipment-actions">
          <button @click.stop="viewOnMap(shipment)" class="action-btn">
            📍 View on Map
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredShipments.length === 0" class="no-shipments">
      No shipments found matching your criteria.
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useShipmentStore } from '@/stores/shipment';

export default {
  name: 'ShipmentTracker',
  emits: ['focus-shipment'],
  setup(props, { emit }) {
    const shipmentStore = useShipmentStore();
    const searchTerm = ref('');
    const statusFilter = ref('');

    const filteredShipments = computed(() => {
      return shipmentStore.shipments.filter(shipment => {
        const matchesSearch = shipment.id.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                            shipment.destination.toLowerCase().includes(searchTerm.value.toLowerCase());
        const matchesStatus = !statusFilter.value || shipment.status === statusFilter.value;
        return matchesSearch && matchesStatus;
      });
    });

    const focusOnShipment = (shipment) => {
      emit('focus-shipment', shipment);
    };

    const viewOnMap = (shipment) => {
      emit('focus-shipment', shipment);
      // You can also trigger map centering here if needed
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString();
    };

    return {
      searchTerm,
      statusFilter,
      filteredShipments,
      focusOnShipment,
      viewOnMap,
      formatDate
    };
  }
};
</script>

<style scoped>
.shipment-tracker {
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
}

.tracker-header {
  margin-bottom: 20px;
}

.tracker-header h2 {
  margin: 0 0 15px 0;
  color: #333;
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.shipments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.shipment-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shipment-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.shipment-card.status-delayed {
  border-left: 4px solid #ff9800;
}

.shipment-card.status-in_transit {
  border-left: 4px solid #4caf50;
}

.shipment-card.status-pending {
  border-left: 4px solid #2196f3;
}

.shipment-card.status-delivered {
  border-left: 4px solid #f44336;
}

.shipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.shipment-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge {
  background: #e0e0e0;
  color: #666;
}

.status-pending .status-badge {
  background: #bbdefb;
  color: #1976d2;
}

.status-in_transit .status-badge {
  background: #c8e6c9;
  color: #388e3c;
}

.status-delivered .status-badge {
  background: #ffcdd2;
  color: #d32f2f;
}

.status-delayed .status-badge {
  background: #ffe0b2;
  color: #f57c00;
}

.shipment-details {
  margin-bottom: 10px;
}

.shipment-details p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.shipment-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.action-btn:hover {
  background: #e0e0e0;
}

.no-shipments {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}
</style>
