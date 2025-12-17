<template>
  <div class="admin-container">
    <Navigation />
    <div class="main-content">
      <div class="page-header">
        <h1>Admin</h1>
        <button class="btn btn-primary refresh-btn" @click="refreshData">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">Users</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'warehouses' }" @click="activeTab = 'warehouses'">Warehouses</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'transport' }" @click="activeTab = 'transport'">Transport</a>
        </li>
      </ul>

      <!-- Action Buttons -->
      <div class="action-bar mb-3">
        <button class="btn btn-success" @click="openModal('add')">
          <i class="fas fa-plus"></i> Add
        </button>
        <button class="btn btn-warning ms-2" :disabled="!selectedItem" @click="openModal('edit')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-danger ms-2" :disabled="!selectedItem" @click="openModal('remove')">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Users -->
        <div v-if="activeTab === 'users'" class="list-section">
          <div class="list-scroll">
            <table class="table table-sm table-hover">
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Org</th><th>Role</th></tr></thead>
              <tbody>
                <tr v-for="u in users" :key="u.id" 
                    :class="{ selected: selectedItem?.id === u.id }"
                    @click="selectItem(u)">
                  <td>{{ u.id }}</td>
                  <td>{{ u.firstName }} {{ u.secondName }}</td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.organisation }}</td>
                  <td><span class="badge bg-info">{{ u.role }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Warehouses -->
        <div v-if="activeTab === 'warehouses'" class="list-section">
          <div class="list-scroll">
            <table class="table table-sm table-hover">
              <thead><tr><th>ID</th><th>Location</th><th>Capacity</th><th>Utilization</th><th>Contact</th></tr></thead>
              <tbody>
                <tr v-for="w in warehouses" :key="w.id"
                    :class="{ selected: selectedItem?.id === w.id }"
                    @click="selectItem(w)">
                  <td>{{ w.id }}</td>
                  <td>{{ w.location }}</td>
                  <td>{{ w.capacity }} m²</td>
                  <td>
                    <div class="progress" style="height:6px; width:80px">
                      <div class="progress-bar bg-success" :style="{ width: w.utilization + '%' }"></div>
                    </div>
                  </td>
                  <td>{{ w.email }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Transport -->
        <div v-if="activeTab === 'transport'" class="list-section">
          <div class="list-scroll">
            <table class="table table-sm table-hover">
              <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Status</th><th>Contact</th></tr></thead>
              <tbody>
                <tr v-for="t in transport" :key="t.id"
                    :class="{ selected: selectedItem?.id === t.id }"
                    @click="selectItem(t)">
                  <td>{{ t.id }}</td>
                  <td>{{ t.name }}</td>
                  <td>{{ t.location }}</td>
                  <td><span class="badge" :class="transportStatusClass(t.status)">{{ t.status }}</span></td>
                  <td>{{ t.email }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="modalConfig" class="modal-backdrop fade show"></div>
      <div v-if="modalConfig" class="modal fade show" style="display:block">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }}
                {{ modalConfig.mode === 'add' ? 'Add' : modalConfig.mode === 'edit' ? 'Edit' : 'Remove' }}
              </h5>
              <button type="button" class="btn-close" @click="modalConfig = null"></button>
            </div>
            <div class="modal-body">
              <p v-if="modalConfig.mode === 'remove'">
                Confirm removal of 
                <strong>{{ modalConfig.item?.name || modalConfig.item?.location || modalConfig.item?.firstName }}</strong>?
              </p>
              <div v-else class="row">
                <div class="col-md-6 mb-3" v-if="activeTab === 'users'">
                  <label>First Name</label>
                  <input class="form-control" />
                </div>
                <div class="col-md-6 mb-3" v-if="activeTab === 'users'">
                  <label>Second Name</label>
                  <input class="form-control" />
                </div>
                <div class="col-12 mb-3">
                  <label>{{ activeTab === 'users' ? 'Email' : activeTab === 'warehouses' ? 'Location' : 'Name' }}</label>
                  <input class="form-control" />
                </div>
                <div class="col-12 mb-3" v-if="activeTab === 'users'">
                  <label>Organisation</label>
                  <input class="form-control" />
                </div>
                <div class="col-12 mb-3" v-if="activeTab === 'users'">
                  <label>Role</label>
                  <select class="form-select">
                    <option>Admin</option><option>Logistics</option><option>Field</option><option>Viewer</option>
                  </select>
                </div>
                <div class="col-12 mb-3" v-if="activeTab === 'warehouses'">
                  <label>Capacity (m²)</label>
                  <input type="number" class="form-control" />
                </div>
                <div class="col-12 mb-3" v-if="activeTab !== 'users'">
                  <label>Email</label>
                  <input type="email" class="form-control" />
                </div>
                <div class="col-12 mb-3" v-if="activeTab !== 'users'">
                  <label>Phone / WhatsApp</label>
                  <input class="form-control" placeholder="+254 ..." />
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
import { ref } from 'vue'
import Navigation from '@/components/Navigation.vue'

const activeTab = ref('users')
const selectedItem = ref(null)
const modalConfig = ref(null)

const users = ref([
  { id: 1, firstName: 'John', secondName: 'Doe', email: 'jdoe@ng.org', organisation: 'NGO A', role: 'Admin' },
  { id: 2, firstName: 'Jane', secondName: 'Smith', email: 'jsmith@ng.org', organisation: 'NGO B', role: 'Logistics' }
])

const warehouses = ref([
  { id: 1, location: 'Nairobi', capacity: 1000, utilization: 75, email: 'nairobi@ng.org' },
  { id: 2, location: 'Mombasa', capacity: 800, utilization: 45, email: 'mombasa@ng.org' }
])

const transport = ref([
  { id: 1, name: 'Truck A', location: 'Nairobi', status: 'available', email: 'truck-a@logistics.com' },
  { id: 2, name: 'Truck B', location: 'Nairobi', status: 'in-transit', email: 'truck-b@logistics.com' }
])

const transportStatusClass = (status) => {
  return status === 'available' ? 'bg-success' : status === 'in-transit' ? 'bg-warning' : 'bg-secondary'
}

const refreshData = () => {
  console.log('✅ Admin data refreshed')
}

const selectItem = (item) => { selectedItem.value = item }

const openModal = (mode) => {
  modalConfig.value = { mode, item: selectedItem.value }
}

const handleModalSubmit = () => {
  console.log('✅ Admin modal submitted')
  modalConfig.value = null
}
</script>

<style scoped>
.admin-container { display: flex; height: 100vh; background-color: #f8f9fa; }
.main-content { flex: 1; padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.refresh-btn { font-size: 13px !important; padding: 0.375rem 0.75rem !important; }
.action-bar { margin-bottom: 15px; }
.list-section { background:white; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.05); height: calc(100% - 180px); }
.list-scroll { height: 100%; overflow-y: auto; }
.selected { background-color: #e3f2fd !important; }
.modal-backdrop, .modal { position: fixed; top:0; left:0; width:100vw; height:100vh; z-index:1050; }
.modal { display:flex; align-items:center; justify-content:center; }
</style>
