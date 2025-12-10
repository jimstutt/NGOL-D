<template>
  <div class="shipments-page">
    <div class="page-header">
      <h1>🚚 Shipments Management</h1>
      <button class="btn-primary" @click="showCreateModal = true">
        + Create Shipment
      </button>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label>Status:</label>
        <select v-model="filters.status">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in-transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Priority:</label>
        <select v-model="filters.priority">
          <option value="">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Date Range:</label>
        <input type="date" v-model="filters.startDate">
        <input type="date" v-model="filters.endDate">
      </div>
    </div>

    <div class="shipments-list">
      <div class="shipment-card" v-for="shipment in filteredShipments" :key="shipment.id">
        <div class="shipment-header">
          <h3>{{ shipment.trackingId }}</h3>
          <span :class="['status-badge', shipment.status]">
            {{ shipment.status }}
          </span>
        </div>
        <div class="shipment-details">
          <p><strong>From:</strong> {{ shipment.origin }}</p>
          <p><strong>To:</strong> {{ shipment.destination }}</p>
          <p><strong>Items:</strong> {{ shipment.itemCount }} items</p>
          <p><strong>Created:</strong> {{ shipment.createdDate }}</p>
        </div>
        <div class="shipment-actions">
          <button class="btn-secondary">View Details</button>
          <button class="btn-warning" v-if="shipment.status === 'pending'">Edit</button>
          <button class="btn-danger" v-if="shipment.status === 'pending'">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Create Shipment Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Create New Shipment</h2>
        <form @submit.prevent="createShipment">
          <div class="form-group">
            <label>Source Warehouse:</label>
            <select v-model="newShipment.source" required>
              <option value="">Select Warehouse</option>
              <option value="warehouse-1">Nairobi Main Warehouse</option>
              <option value="warehouse-2">Mombasa Coastal Warehouse</option>
              <option value="warehouse-3">Kisumu Regional Warehouse</option>
            </select>
          </div>
          <div class="form-group">
            <label>Items:</label>
            <select v-model="newShipment.items" multiple required>
              <option value="food">Food Supplies</option>
              <option value="medical">Medical Kits</option>
              <option value="water">Water Purification</option>
              <option value="shelter">Shelter Materials</option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantity:</label>
            <input type="number" v-model="newShipment.quantity" required>
          </div>
          <div class="form-group">
            <label>Destination:</label>
            <input type="text" v-model="newShipment.destination" placeholder="Refugee Camp, Town, or Region" required>
          </div>
          <div class="form-group">
            <label>Transport Provider:</label>
            <select v-model="newShipment.transport" required>
              <option value="">Select Transport</option>
              <option value="provider-1">Kenya Red Cross Logistics</option>
              <option value="provider-2">UNHCR Transport</option>
              <option value="provider-3">Local Partner Network</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">Create Shipment</button>
            <button type="button" class="btn-secondary" @click="showCreateModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'Shipments',
  setup() {
    const showCreateModal = ref(false)
    const filters = ref({
      status: '',
      priority: '',
      startDate: '',
      endDate: ''
    })

    const newShipment = ref({
      source: '',
      items: [],
      quantity: 1,
      destination: '',
      transport: ''
    })

    // Mock data
    const shipments = ref([
      {
        id: 1,
        trackingId: 'SH-2024-001',
        origin: 'Nairobi Main Warehouse',
        destination: 'Kakuma Refugee Camp',
        status: 'in-transit',
        priority: 'high',
        itemCount: 150,
        createdDate: '2024-01-15'
      },
      {
        id: 2,
        trackingId: 'SH-2024-002',
        origin: 'Mombasa Coastal Warehouse',
        destination: 'Dadaab Refugee Camp',
        status: 'pending',
        priority: 'medium',
        itemCount: 89,
        createdDate: '2024-01-16'
      },
      {
        id: 3,
        trackingId: 'SH-2024-003',
        origin: 'Kisumu Regional Warehouse',
        destination: 'Lodwar Town',
        status: 'delivered',
        priority: 'low',
        itemCount: 45,
        createdDate: '2024-01-10'
      }
    ])

    const filteredShipments = computed(() => {
      return shipments.value.filter(shipment => {
        const statusMatch = !filters.value.status || shipment.status === filters.value.status
        const priorityMatch = !filters.value.priority || shipment.priority === filters.value.priority
        return statusMatch && priorityMatch
      })
    })

    const createShipment = () => {
      console.log('Creating shipment:', newShipment.value)
      // Here you would make API call to create shipment
      showCreateModal.value = false
      // Reset form
      newShipment.value = {
        source: '',
        items: [],
        quantity: 1,
        destination: '',
        transport: ''
      }
    }

    return {
      showCreateModal,
      filters,
      newShipment,
      filteredShipments,
      createShipment
    }
  }
}
</script>

<style scoped>
.shipments-page {
  padding: 20px;
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin: 0;
}

.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9em;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 0.9em;
}

.shipments-list {
  display: grid;
  gap: 20px;
}

.shipment-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid #3498db;
}

.shipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.shipment-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.in-transit {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.delivered {
  background: #d4edda;
  color: #155724;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.shipment-details p {
  margin: 5px 0;
  color: #5a6c7d;
}

.shipment-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-primary, .btn-secondary, .btn-warning, .btn-danger {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 1em;
}

.form-group select[multiple] {
  height: 120px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}
</style>
