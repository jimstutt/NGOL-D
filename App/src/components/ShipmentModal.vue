<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ mode === 'add' ? 'Add Shipment' : 'Edit Shipment' }}</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <form @submit.prevent="save" class="modal-form">
        <div class="form-group">
          <label for="source">Source Warehouse *</label>
          <select id="source" v-model="formData.source" required>
            <option value="">Select Warehouse</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.name">
              {{ warehouse.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <select id="description" v-model="formData.description" required>
            <option value="">Select Inventory Item</option>
            <option v-for="item in filteredInventory" :key="item.id" :value="item.name">
              {{ item.name }} ({{ item.quantity }} available)
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="quantity">Quantity *</label>
          <input
            id="quantity"
            v-model="formData.quantity"
            type="number"
            required
            placeholder="Enter quantity"
          >
        </div>

        <div class="form-group">
          <label for="destination">Destination *</label>
          <input
            id="destination"
            v-model="formData.destination"
            type="text"
            required
            placeholder="Refugee Camp, Town or Region"
          >
        </div>

        <div class="form-group">
          <label for="transport">Transport Provider *</label>
          <select id="transport" v-model="formData.transport" required>
            <option value="">Select Transport</option>
            <option v-for="provider in transportProviders" :key="provider.id" :value="provider.name">
              {{ provider.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="coordinates">Coordinates</label>
          <input
            id="coordinates"
            v-model="formData.coordinates"
            type="text"
            placeholder="Latitude, Longitude"
          >
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'ShipmentModal',
  props: {
    shipment: Object,
    mode: String
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const formData = ref({
      source: '',
      description: '',
      quantity: '',
      destination: '',
      transport: '',
      coordinates: ''
    })

    // Mock data
    const warehouses = ref([
      { id: 1, name: 'Nairobi Warehouse' },
      { id: 2, name: 'Mombasa Storage' },
      { id: 3, name: 'Kisumu Depot' }
    ])

    const inventory = ref([
      { id: 1, name: 'Emergency Food Pack', warehouse: 'Nairobi Warehouse', quantity: '1500 kg' },
      { id: 2, name: 'Medical Supplies', warehouse: 'Mombasa Storage', quantity: '50 units' },
      { id: 3, name: 'Water Purification', warehouse: 'Kisumu Depot', quantity: '500 L' }
    ])

    const transportProviders = ref([
      { id: 1, name: 'Kenya Red Cross Transport' },
      { id: 2, name: 'UNHCR Logistics' },
      { id: 3, name: 'World Food Programme' }
    ])

    const filteredInventory = computed(() => {
      if (!formData.value.source) return inventory.value
      return inventory.value.filter(item => item.warehouse === formData.value.source)
    })

    // Initialize form data when editing
    watch(() => props.shipment, (newShipment) => {
      if (newShipment && props.mode === 'edit') {
        formData.value = {
          source: newShipment.source || '',
          description: newShipment.name || '',
          quantity: newShipment.quantity || '',
          destination: newShipment.destination || '',
          transport: newShipment.transport || '',
          coordinates: newShipment.coordinates || ''
        }
      } else {
        formData.value = {
          source: '',
          description: '',
          quantity: '',
          destination: '',
          transport: '',
          coordinates: ''
        }
      }
    }, { immediate: true })

    const save = () => {
      emit('save', {
        ...formData.value,
        id: props.shipment?.id
      })
    }

    const close = () => {
      emit('close')
    }

    return {
      formData,
      warehouses,
      inventory: filteredInventory,
      transportProviders,
      save,
      close
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
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

.btn-secondary:hover {
  background: #545b62;
}
</style>
