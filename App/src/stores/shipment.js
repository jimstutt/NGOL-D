// src/stores/shipment.js
import { defineStore } from 'pinia';

export const useShipmentStore = defineStore('shipment', {
  state: () => ({
    warehouses: [],
    shipments: [],
    inventory: []
  }),
  actions: {
    async fetchWarehouses() {
      this.warehouses = [
        { id: 1, name: 'Nairobi', capacity: 1000, location: 'Nairobi' },
        { id: 2, name: 'Mombasa', capacity: 800, location: 'Mombasa' }
      ];
    },
    async fetchShipments() {
      this.shipments = [
        { id: 1, source: 'Nairobi', destination: 'Dadaab', status: 'in-transit' }
      ];
    },
    async fetchInventory() {
      this.inventory = [
        { id: 1, warehouse: 'Nairobi', item: 'Food', quantity: 1000 }
      ];
    }
  }
});
