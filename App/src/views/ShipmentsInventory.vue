<template>
  <div class="shipments-inventory">
    <div class="page-header">
      <h2>Shipments & Inventory Management</h2>
    </div>

    <div class="management-grid">
      <!-- Shipments Section -->
      <div class="management-section">
        <div class="section-header">
          <h3>Shipments</h3>
          <div class="action-buttons">
            <button @click="openAddShipment" class="btn btn-primary">Add Shipment</button>
            <button @click="openEditShipment" class="btn btn-secondary" :disabled="!selectedShipment">Edit</button>
            <button @click="openRemoveShipment" class="btn btn-danger" :disabled="!selectedShipment">Remove</button>
          </div>
        </div>
        
        <div class="filters">
          <select v-model="shipmentFilters.status" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="delayed">Delayed</option>
          </select>
          
          <select v-model="shipmentFilters.priority" class="filter-select">
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <input v-model="shipmentFilters.dateRange" type="text" placeholder="Date Range" class="filter-input">
        </div>

        <div class="list-container">
          <div 
            v-for="shipment in filteredShipments" 
            :key="shipment.id"
            class="list-item"
            :class="{ selected: selectedShipment?.id === shipment.id }"
            @click="selectShipment(shipment)"
          >
            <div class="item-header">
              <span class="item-title">{{ shipment.name }}</span>
              <span class="item-status" :class="shipment.status">{{ shipment.status }}</span>
            </div>
            <div class="item-details">
              <span>From: {{ shipment.source }}</span>
              <span>To: {{ shipment.destination }}</span>
              <span>Qty: {{ shipment.quantity }}</span>
            </div>
            <div class="item-meta">
              <span>Priority: {{ shipment.priority }}</span>
              <span>{{ shipment.date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Section -->
      <div class="management-section">
        <div class="section-header">
          <h3>Inventory</h3>
          <div class="action-buttons">
            <button @click="openAddInventory" class="btn btn-primary">Add Inventory</button>
            <button @click="openEditInventory" class="btn btn-secondary" :disabled="!selectedInventory">Edit</button>
            <button @click="openRemoveInventory" class="btn btn-danger" :disabled="!selectedInventory">Remove</button>
          </div>
        </div>
        
        <div class="filters">
          <select v-model="inventoryFilters.status" class="filter-select">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          
          <select v-model="inventoryFilters.priority" class="filter-select">
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <input v-model="inventoryFilters.dateRange" type="text" placeholder="Date Range" class="filter-input">
        </div>

        <div class="list-container">
          <div 
            v-for="item in filteredInventory" 
            :key="item.id"
            class="list-item"
            :class="{ selected: selectedInventory?.id === item.id }"
            @click="selectInventory(item)"
          >
            <div class="item-header">
              <span class="item-title">{{ item.name }}</span>
              <span class="item-status" :class="item.status">{{ item.status }}</span>
            </div>
            <div class="item-details">
              <span>Warehouse: {{ item.warehouse }}</span>
              <span>Type: {{ item.type }}</span>
              <span>Qty: {{ item.quantity }}</span>
            </div>
            <div class="item-meta">
              <span>Priority: {{ item.priority }}</span>
              <span>{{ item.lastUpdated }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Forms -->
    <ShipmentModal 
      v-if="showShipmentModal"
      :shipment="editingShipment"
      :mode="shipmentModalMode"
      @save="handleSaveShipment"
      @close="closeShipmentModal"
    />

    <InventoryModal
      v-if="showInventoryModal"
      :item="editingInventory"
      :mode="inventoryModalMode"
      @save="handleSaveInventory"
      @close="closeInventoryModal"
    />

    <ConfirmModal
      v-if="showConfirmModal"
      :item="itemToRemove"
      :type="confirmModalType"
      @confirm="handleConfirmRemove"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import ShipmentModal from '../components/ShipmentModal.vue'
import InventoryModal from '../components/InventoryModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

export default {
  name: 'ShipmentsInventory',
  components: {
    ShipmentModal,
    InventoryModal,
    ConfirmModal
  },
  setup() {
    // Mock data
    const shipments = ref([
      { id: 1, name: 'Food Supply to Kakuma', source: 'Nairobi Warehouse', destination: 'Kakuma Camp', 
        quantity: '500 kg', status: 'in-transit', priority: 'high', date: '2024-01-15', type: 'Food' },
      { id: 2, name: 'Medical Kits to Dadaab', source: 'Mombasa Storage', destination: 'Dadaab Camp', 
        quantity: '200 units', status: 'pending', priority: 'high', date: '2024-01-16', type: 'Medical' },
      { id: 3, name: 'Water Containers to Lodwar', source: 'Kisumu Depot', destination: 'Lodwar', 
        quantity: '1000 L', status: 'delayed', priority: 'medium', date: '2024-01-14', type: 'Water' }
    ])

    const inventory = ref([
      { id: 1, name: 'Emergency Food Pack', warehouse: 'Nairobi Warehouse', type: 'Food', 
        quantity: '1500 kg', status: 'available', priority: 'high', lastUpdated: '2024-01-15' },
      { id: 2, name: 'Medical Supplies', warehouse: 'Mombasa Storage', type: 'Medical', 
        quantity: '50 units', status: 'low-stock', priority: 'high', lastUpdated: '2024-01-16' },
      { id: 3, name: 'Water Purification', warehouse: 'Kisumu Depot', type: 'Water', 
        quantity: '500 L', status: 'available', priority: 'medium', lastUpdated: '2024-01-14' }
    ])

    // Selection states
    const selectedShipment = ref(null)
    const selectedInventory = ref(null)

    // Filter states
    const shipmentFilters = ref({
      status: '',
      priority: '',
      dateRange: ''
    })

    const inventoryFilters = ref({
      status: '',
      priority: '',
      dateRange: ''
    })

    // Modal states
    const showShipmentModal = ref(false)
    const showInventoryModal = ref(false)
    const showConfirmModal = ref(false)
    const shipmentModalMode = ref('add')
    const inventoryModalMode = ref('add')
    const editingShipment = ref(null)
    const editingInventory = ref(null)
    const itemToRemove = ref(null)
    const confirmModalType = ref('')

    // Computed filtered lists
    const filteredShipments = computed(() => {
      return shipments.value.filter(shipment => {
        return (
          (!shipmentFilters.value.status || shipment.status === shipmentFilters.value.status) &&
          (!shipmentFilters.value.priority || shipment.priority === shipmentFilters.value.priority) &&
          (!shipmentFilters.value.dateRange || shipment.date.includes(shipmentFilters.value.dateRange))
        )
      })
    })

    const filteredInventory = computed(() => {
      return inventory.value.filter(item => {
        return (
          (!inventoryFilters.value.status || item.status === inventoryFilters.value.status) &&
          (!inventoryFilters.value.priority || item.priority === inventoryFilters.value.priority) &&
          (!inventoryFilters.value.dateRange || item.lastUpdated.includes(inventoryFilters.value.dateRange))
        )
      })
    })

    // Selection handlers
    const selectShipment = (shipment) => {
      selectedShipment.value = shipment
      selectedInventory.value = null
    }

    const selectInventory = (item) => {
      selectedInventory.value = item
      selectedShipment.value = null
    }

    // Shipment modal handlers
    const openAddShipment = () => {
      shipmentModalMode.value = 'add'
      editingShipment.value = null
      showShipmentModal.value = true
    }

    const openEditShipment = () => {
      if (selectedShipment.value) {
        shipmentModalMode.value = 'edit'
        editingShipment.value = { ...selectedShipment.value }
        showShipmentModal.value = true
      }
    }

    const openRemoveShipment = () => {
      if (selectedShipment.value) {
        itemToRemove.value = selectedShipment.value
        confirmModalType.value = 'shipment'
        showConfirmModal.value = true
      }
    }

    const handleSaveShipment = (shipmentData) => {
      if (shipmentModalMode.value === 'add') {
        const newShipment = {
          ...shipmentData,
          id: Date.now(),
          date: new Date().toISOString().split('T')[0]
        }
        shipments.value.push(newShipment)
      } else {
        const index = shipments.value.findIndex(s => s.id === shipmentData.id)
        if (index !== -1) {
          shipments.value[index] = { ...shipmentData }
        }
      }
      closeShipmentModal()
    }

    const closeShipmentModal = () => {
      showShipmentModal.value = false
      editingShipment.value = null
    }

    // Inventory modal handlers
    const openAddInventory = () => {
      inventoryModalMode.value = 'add'
      editingInventory.value = null
      showInventoryModal.value = true
    }

    const openEditInventory = () => {
      if (selectedInventory.value) {
        inventoryModalMode.value = 'edit'
        editingInventory.value = { ...selectedInventory.value }
        showInventoryModal.value = true
      }
    }

    const openRemoveInventory = () => {
      if (selectedInventory.value) {
        itemToRemove.value = selectedInventory.value
        confirmModalType.value = 'inventory'
        showConfirmModal.value = true
      }
    }

    const handleSaveInventory = (inventoryData) => {
      if (inventoryModalMode.value === 'add') {
        const newItem = {
          ...inventoryData,
          id: Date.now(),
          lastUpdated: new Date().toISOString().split('T')[0]
        }
        inventory.value.push(newItem)
      } else {
        const index = inventory.value.findIndex(i => i.id === inventoryData.id)
        if (index !== -1) {
          inventory.value[index] = { ...inventoryData }
        }
      }
      closeInventoryModal()
    }

    const closeInventoryModal = () => {
      showInventoryModal.value = false
      editingInventory.value = null
    }

    // Confirmation modal handlers
    const handleConfirmRemove = () => {
      if (confirmModalType.value === 'shipment') {
        shipments.value = shipments.value.filter(s => s.id !== itemToRemove.value.id)
        selectedShipment.value = null
      } else {
        inventory.value = inventory.value.filter(i => i.id !== itemToRemove.value.id)
        selectedInventory.value = null
      }
      closeConfirmModal()
    }

    const closeConfirmModal = () => {
      showConfirmModal.value = false
      itemToRemove.value = null
      confirmModalType.value = ''
    }

    return {
      shipments: filteredShipments,
      inventory: filteredInventory,
      selectedShipment,
      selectedInventory,
      shipmentFilters,
      inventoryFilters,
      showShipmentModal,
      showInventoryModal,
      showConfirmModal,
      shipmentModalMode,
      inventoryModalMode,
      editingShipment,
      editingInventory,
      itemToRemove,
      confirmModalType,
      selectShipment,
      selectInventory,
      openAddShipment,
      openEditShipment,
      openRemoveShipment,
      openAddInventory,
      openEditInventory,
      openRemoveInventory,
      handleSaveShipment,
      handleSaveInventory,
      handleConfirmRemove,
      closeShipmentModal,
      closeInventoryModal,
      closeConfirmModal
    }
  }
}
</script>

<style scoped>
.shipments-inventory {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  color: #333;
  margin: 0;
}

.management-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  flex: 1;
}

.management-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.filters {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 0.5rem;
}

.filter-select, .filter-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.filter-input {
  flex: 1;
}

.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.list-item {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.list-item:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.list-item.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.item-title {
  font-weight: 600;
  color: #333;
}

.item-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.item-status.in-transit {
  background: #d4edda;
  color: #155724;
}

.item-status.pending {
  background: #fff3cd;
  color: #856404;
}

.item-status.delayed {
  background: #f8d7da;
  color: #721c24;
}

.item-status.available {
  background: #d4edda;
  color: #155724;
}

.item-status.low-stock {
  background: #fff3cd;
  color: #856404;
}

.item-status.out-of-stock {
  background: #f8d7da;
  color: #721c24;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.item-details span {
  font-size: 0.875rem;
  color: #666;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #999;
}

@media (max-width: 768px) {
  .management-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
}
</style>
