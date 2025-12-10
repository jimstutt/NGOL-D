<template>
  <div class="modal active">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ warehouse ? 'Edit Warehouse' : 'Add Warehouse' }}</h3>
        <button class="close-modal" @click="$emit('close')">&times;</button>
      </div>
      <form @submit.prevent="save">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" class="form-input" v-model="form.name" placeholder="Warehouse Name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Location</label>
          <input type="text" class="form-input" v-model="form.location" placeholder="Town, City or Village" required>
        </div>
        <div class="form-group">
          <label class="form-label">Capacity (sq m)</label>
          <input type="number" class="form-input" v-model="form.capacity" placeholder="Capacity in square meters" required>
        </div>
        <div class="form-group">
          <label class="form-label">Transport</label>
          <select class="form-input" v-model="form.transport" required>
            <option value="">Select Transport Provider</option>
            <option value="East Africa Logistics">East Africa Logistics</option>
            <option value="Kenya Transport Co.">Kenya Transport Co.</option>
            <option value="Tanzania Cargo">Tanzania Cargo</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" v-model="form.email" placeholder="Email address" required>
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input type="text" class="form-input" v-model="form.phone" placeholder="Mobile, WhatsApp or landline" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Latitude</label>
            <input type="text" class="form-input" v-model="form.lat" placeholder="Enter latitude" required>
          </div>
          <div class="form-group">
            <label class="form-label">Longitude</label>
            <input type="text" class="form-input" v-model="form.lng" placeholder="Enter longitude" required>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-cancel" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn btn-save">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WarehouseModal',
  props: {
    warehouse: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        name: '',
        location: '',
        capacity: '',
        transport: '',
        email: '',
        phone: '',
        lat: '',
        lng: ''
      }
    }
  },
  mounted() {
    if (this.warehouse) {
      this.form = { ...this.warehouse }
    }
  },
  methods: {
    save() {
      this.$emit('save', this.form)
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 1.5rem;
  color: var(--primary);
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #777;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  background-color: #95a5a6;
  color: white;
}

.btn-save {
  background-color: var(--primary);
  color: white;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
