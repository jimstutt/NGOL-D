<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ mode === 'add' ? 'Add Inventory' : 'Edit Inventory' }}</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <form @submit.prevent="save" class="modal-form">
        <div class="form-group">
          <label for="warehouse">Warehouse *</label>
          <select id="warehouse" v-model="formData.warehouse" required>
            <option value="">Select Warehouse</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.name">
              {{ warehouse.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <select id="description" v-model="formData.description" required>
            <option value="">Select Type</option>
            <option v-for="type in inventoryTypes" :key="type" :value="type">
              {{ type }}
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
          <label for="transport">Transport Provider</label>
          <select id="transport" v-model="formData.transport">
            <option value="">Select Transport</option>
            <option v-for="provider in transportProviders" :key="provider.id" :value="provider.name">
              {{ provider.name }}
            </option>
          </select>
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
import { ref, watch } from 'vue'

export default {
  name: 'InventoryModal',
  props: {
    item: Object,
    mode: String
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const formData = ref({
      warehouse: '',
      description: '',
      quantity: '',
      transport: ''
    })

    // Mock data
    const warehouses = ref([
      { id: 1, name: 'Nairobi Warehouse' },
      { id: 2, name: 'Mombasa Storage' },
      { id: 3, name: 'Kisumu Depot' }
    ])

    const inventoryTypes = ref([
      'Food', 'Water', 'Medical', 'Sanitary', 'Clothing', 'Bedding', 'Shelter'
    ])

    const transportProviders = ref([
      { id: 1, name: 'Kenya Red Cross Transport' },
      { id: 2, name: 'UNHCR Logistics' },
      { id: 3, name: 'World Food Programme' }
    ])

    // Initialize form data when editing
    watch(() => props.item, (newItem) => {
      if (newItem && props.mode === 'edit') {
        formData.value = {
          warehouse: newItem.warehouse || '',
          description: newItem.type || '',
          quantity: newItem.quantity || '',
          transport: newItem.transport || ''
        }
      } else {
        formData.value = {
          warehouse: '',
          description: '',
          quantity: '',
          transport: ''
        }
      }
    }, { immediate: true })

    const save = () => {
      emit('save', {
        ...formData.value,
        id: props.item?.id
      })
    }

    const close = () => {
      emit('close')
    }

    return {
      formData,
      warehouses,
      inventoryTypes,
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
