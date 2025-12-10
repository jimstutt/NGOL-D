<template>
  <div class="modal-overlay" @click.self="cancel">
    <div class="modal-content confirm-modal">
      <div class="modal-header">
        <h3>Confirm Removal</h3>
        <button class="close-btn" @click="cancel">×</button>
      </div>
      
      <div class="modal-body">
        <p>Are you sure you want to remove this {{ type }}?</p>
        <div class="item-details" v-if="item">
          <strong>{{ item.name }}</strong>
          <span v-if="item.source">From: {{ item.source }}</span>
          <span v-if="item.destination">To: {{ item.destination }}</span>
          <span v-if="item.warehouse">Warehouse: {{ item.warehouse }}</span>
          <span>Quantity: {{ item.quantity }}</span>
        </div>
        <p class="warning-text">This action cannot be undone.</p>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="cancel">Cancel</button>
        <button type="button" class="btn btn-danger" @click="confirm">Remove</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    item: Object,
    type: String
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const confirm = () => {
      emit('confirm')
    }

    const cancel = () => {
      emit('cancel')
    }

    return {
      confirm,
      cancel
    }
  }
}
</script>

<style scoped>
.confirm-modal {
  width: 400px;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin-bottom: 1rem;
  color: #333;
}

.item-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.item-details strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.item-details span {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.warning-text {
  color: #dc3545;
  font-weight: 600;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

/* Shared modal styles */
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

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding: 1.5rem;
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
