<template>
  <div class="modal active">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ transport ? 'Edit Transport Provider' : 'Add Transport Provider' }}</h3>
        <button class="close-modal" @click="$emit('close')">&times;</button>
      </div>
      <form @submit.prevent="save">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" class="form-input" v-model="form.name" placeholder="Transport Provider Name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Location</label>
          <input type="text" class="form-input" v-model="form.location" placeholder="Location" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" v-model="form.email" placeholder="Email address" required>
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input type="text" class="form-input" v-model="form.phone" placeholder="Mobile, WhatsApp or landline" required>
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
  name: 'TransportModal',
  props: {
    transport: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        name: '',
        location: '',
        email: '',
        phone: ''
      }
    }
  },
  mounted() {
    if (this.transport) {
      this.form = { ...this.transport }
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
</style>
