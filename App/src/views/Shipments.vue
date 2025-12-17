<template>
  <div class="shipments-container">
    <Navigation />
    <div class="main-content">
      <div class="page-header">
        <h1>Shipments</h1>
        <button class="btn btn-primary refresh-btn" @click="refreshData">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="action-bar">
        <div>
          <button class="btn btn-success" @click="openModal('shipment', 'add')">
            <i class="fas fa-plus"></i> Add Shipment
          </button>
          <button class="btn btn-warning ms-2" :disabled="!selectedShipment"
            @click="openModal('shipment', 'edit')">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger ms-2" :disabled="!selectedShipment"
            @click="openModal('shipment', 'remove')">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-row">
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="filters.shipmentStatus" class="form-select form-select-sm">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in-transit">In-Transit</option>
            <option value="delayed">Delayed</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Priority:</label>
          <select v-model="filters.shipmentPriority" class="form-select form-select-sm">
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Date Range:</label>
          <input type="date" v-model="filters.shipmentDateFrom" class="form-control form-control-sm" />
          <span class="mx-1">to</span>
          <input type="date" v-model="filters.shipmentDateTo" class="form-control form-control-sm" />
        </div>
      </div>

      <!-- Side-by-side lists -->
      <div class="lists-container">
        <div class="list-section">
          <h3>Shipments</h3>
          <div class="list-scroll">
            <table class="table table-sm table-hover">
              <thead><tr><th>ID</th><th>Status</th><th>Dest</th><th>Qty</th></tr></thead>
              <tbody>
                <tr v-for="s in filteredShipments" :key="s.id"
                    :class="{ selected: selectedShipment?.id === s.id }"
                    @click="selectShipment(s)">
                  <td>{{ s.id }}</td>
                  <td><span class="badge" :class="statusClass(s.status)">{{ s.status }}</span></td>
                  <td>{{ s.destination }}</td>
                  <td>{{ s.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="list-section">
          <h3>Inventory ({{ selectedWarehouse?.location || 'Nairobi' }})</h3>
          <div class="list-scroll">
            <table class="table table-sm table-hover">
              <thead><tr><th>ID</th><th>Item</th><th>Qty</th><th>Desc</th></tr></thead>
              <tbody>
                <tr v-for="i in inventory" :key="i.id"
                    :class="{ selected: selectedInventory?.id === i.id }"
                    @click="selectInventory(i)">
                  <td>{{ i.id }}</td>
                  <td>{{ i.description }}</td>
                  <td>{{ i.quantity }}</td>
                  <td>{{ i.warehouse }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Inventory Actions -->
          <div class="mt-2">
            <button class="btn btn-success btn-sm" @click="openModal('inventory', 'add')">
              <i class="fas fa-plus"></i> Add
            </button>
            <button class="btn btn-warning btn-sm ms-1" :disabled="!selectedInventory"
              @click="openModal('inventory', 'edit')">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm ms-1" :disabled="!selectedInventory"
              @click="openModal('inventory', 'remove')">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Modals (placeholders — will be implemented later) -->
      <div v-if="modalConfig" class="modal-backdrop fade show"></div>
      <div v-if="modalConfig" class="modal fade show" style="display:block">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ modalConfig.type === 'shipment' ? 'Shipment' : 'Inventory' }}
                {{ modalConfig.mode === 'add' ? 'Add' : modalConfig.mode === 'edit' ? 'Edit' : 'Confirm Remove' }}
              </h5>
              <button type="button" class="btn-close" @click="modalConfig = null"></button>
            </div>
            <div class="modal-body">
              <p v-if="modalConfig.mode === 'remove'">
                Are you sure you want to remove {{ modalConfig.type }} 
                <strong>{{ modalConfig.item?.id }}</strong>?
              </p>
              <div v-else>
                <div class="mb-3">
                  <label class="form-label">Source / Warehouse</label>
                  <select class="form-select">
                    <option>Nairobi</option>
                    <option>Mombasa</option>
                    <option>Kisumu</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <select class="form-select">
                    <option>Food</option><option>Water</option><option>Medical</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Quantity (kg)</label>
                  <input type="number" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Destination</label>
                  <input type="text" class="form-control" placeholder="Refugee camp, town, region" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Transport</label>
                  <select class="form-select">
                    <option>Truck A</option><option>Truck B</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="modalConfig = null">Cancel</button>
              <button type="button" class="btn btn-primary"
                @click="handleModalSubmit">{{ modalConfig.mode === 'remove' ? 'Remove' : 'Save' }}</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Navigation from '@/components/Navigation.vue'

const shipments = ref([
  { id: 101, status: 'in-transit', destination: 'Dadaab', quantity: 120, priority: 'high', date: '2025-12-10' },
  { id: 102, status: 'pending', destination: 'Kakuma', quantity: 85, priority: 'medium', date: '2025-12-12' },
  { id: 103, status: 'delayed', destination: 'Turkana', quantity: 210, priority: 'critical', date: '2025-12-08' }
])

const inventory = ref([
  { id: 201, description: 'Food (Rice)', quantity: 500, warehouse: 'Nairobi' },
  { id: 202, description: 'Water (Bottled)', quantity: 2000, warehouse: 'Nairobi' },
  { id: 203, description: 'Medical Kits', quantity: 50, warehouse: 'Nairobi' }
])

const filters = ref({
  shipmentStatus: '',
  shipmentPriority: '',
  shipmentDateFrom: '',
  shipmentDateTo: ''
})

const selectedShipment = ref(null)
const selectedInventory = ref(null)
const selectedWarehouse = ref({ location: 'Nairobi' })
const modalConfig = ref(null)

const filteredShipments = computed(() => {
  return shipments.value.filter(s => {
    if (filters.value.shipmentStatus && s.status !== filters.value.shipmentStatus) return false
    if (filters.value.shipmentPriority && s.priority !== filters.value.shipmentPriority) return false
    if (filters.value.shipmentDateFrom && s.date < filters.value.shipmentDateFrom) return false
    if (filters.value.shipmentDateTo && s.date > filters.value.shipmentDateTo) return false
    return true
  })
})

const statusClass = (status) => {
  const map = { 'in-transit': 'bg-success', 'pending': 'bg-warning', 'delayed': 'bg-danger', 'delivered': 'bg-primary' }
  return map[status] || 'bg-secondary'
}

const refreshData = () => {
  console.log('✅ Shipments refreshed')
}

const selectShipment = (s) => { selectedShipment.value = s }
const selectInventory = (i) => { selectedInventory.value = i }

const openModal = (type, mode, item = null) => {
  modalConfig.value = { type, mode, item }
}

const handleModalSubmit = () => {
  console.log('✅ Modal submitted:', modalConfig.value)
  modalConfig.value = null
}
</script>

<style scoped>
.shipments-container { display: flex; height: 100vh; background-color: #f8f9fa; }
.main-content { flex: 1; padding: 20px; overflow: hidden; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.refresh-btn { font-size: 13px !important; padding: 0.375rem 0.75rem !important; }
.action-bar { margin-bottom: 15px; display: flex; justify-content: space-between; }
.filters-row { display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap; }
.filter-group { display: flex; align-items: center; gap: 6px; }
.filter-group label { font-weight: 500; font-size: 0.875rem; }
.filter-group .form-select, .filter-group .form-control { width: auto; }
.lists-container { display: flex; gap: 20px; height: calc(100% - 160px); }
.list-section { flex: 1; display: flex; flex-direction: column; background: white; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.05); }
.list-section h3 { padding: 12px 15px; margin: 0; border-bottom:1px solid #eee; font-size:1rem; }
.list-scroll { flex: 1; overflow-y: auto; }
table { margin: 0; }
.selected { background-color: #e3f2fd !important; }
.badge { font-size: 0.75em; }
.modal-backdrop { position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:1050; }
.modal { position: fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; z-index:1051; }
</style>
