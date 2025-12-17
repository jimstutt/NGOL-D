<template>
  <div class="delivery-notes-container">
    <Navigation />
    <div class="main-content">
      <div class="page-header">
        <h1>Delivery Notes</h1>
        <button class="btn btn-primary refresh-btn" @click="refreshData">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="action-bar">
        <button class="btn btn-primary" @click="sendSMS">
          <i class="fas fa-sms"></i> Send SMS
        </button>
        <button class="btn btn-warning ms-2" @click="openModal('edit')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-danger ms-2" @click="openModal('remove')">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>

      <!-- Delivery Details -->
      <div class="delivery-details">
        <div class="card">
          <div class="card-header">
            <h5>Shipment #{{ note.id }} — {{ note.status }}</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Source:</strong> {{ note.source }}<br/>
                <strong>Description:</strong> {{ note.description }}<br/>
                <strong>Quantity:</strong> {{ note.quantity }} kg<br/>
              </div>
              <div class="col-md-6">
                <strong>Destination:</strong> {{ note.destination }}<br/>
                <strong>Transport:</strong> {{ note.transport }}<br/>
                <strong>Coordinates:</strong> {{ note.coordinates.lat }}, {{ note.coordinates.lng }}
              </div>
            </div>
            <div class="progress">
              <div class="progress-bar" role="progressbar"
                :style="{ width: note.completion + '%' }"
                :class="progressClass">
                {{ note.completion }}% Complete
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <div v-if="modalConfig" class="modal-backdrop fade show"></div>
      <div v-if="modalConfig" class="modal fade show" style="display:block">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ modalConfig.title }}</h5>
              <button type="button" class="btn-close" @click="modalConfig = null"></button>
            </div>
            <div class="modal-body">
              <p v-if="modalConfig.type === 'remove'">
                Are you sure you want to delete this delivery note?
              </p>
              <div v-else>
                <div class="mb-3">
                  <label>Destination</label>
                  <input v-model="note.destination" class="form-control" />
                </div>
                <div class="mb-3">
                  <label>Coordinates (lat,lng)</label>
                  <input v-model="coordsInput" class="form-control" placeholder="e.g. -1.2864,36.8172" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="modalConfig = null">Cancel</button>
              <button class="btn btn-primary" @click="handleModalSubmit">Save</button>
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

const note = ref({
  id: 101,
  status: 'In-Transit',
  source: 'Nairobi Warehouse',
  description: 'Food (Rice)',
  quantity: 120,
  destination: 'Dadaab Refugee Camp',
  transport: 'Truck A',
  coordinates: { lat: -1.2864, lng: 36.8172 },
  completion: 65
})

const modalConfig = ref(null)
const coordsInput = ref(`${note.value.coordinates.lat},${note.value.coordinates.lng}`)

const progressClass = computed(() => {
  if (note.value.completion < 30) return 'bg-danger'
  if (note.value.completion < 70) return 'bg-warning'
  return 'bg-success'
})

const refreshData = () => {
  console.log('✅ Delivery Notes refreshed')
}

const sendSMS = () => {
  alert('⚠️ SMS integration not yet implemented (per spec)')
}

const openModal = (type) => {
  modalConfig.value = {
    type,
    title: type === 'remove' ? 'Confirm Removal' : 'Edit Delivery Note'
  }
}

const handleModalSubmit = () => {
  if (coordsInput.value.includes(',')) {
    const [lat, lng] = coordsInput.value.split(',').map(Number)
    note.value.coordinates = { lat, lng }
  }
  modalConfig.value = null
}
</script>

<style scoped>
.delivery-notes-container { display: flex; height: 100vh; background-color: #f8f9fa; }
.main-content { flex: 1; padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.refresh-btn { font-size: 13px !important; padding: 0.375rem 0.75rem !important; }
.action-bar { margin-bottom: 20px; }
.delivery-details { max-width: 900px; margin: 0 auto; }
.card { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.progress { height: 24px; margin-top: 15px; font-size: 0.875rem; font-weight: 500; }
.modal-backdrop, .modal { position: fixed; top:0; left:0; width:100vw; height:100vh; z-index:1050; }
.modal { display:flex; align-items:center; justify-content:center; }
</style>
