import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDataStore = defineStore('data', () => {
  // Mock data for the application
  const shipments = ref([
    {
      id: 'SH001',
      source: 'Nairobi Warehouse',
      description: 'Medical Supplies',
      quantity: 500,
      destination: 'Kakuma Refugee Camp',
      status: 'in-transit',
      priority: 'high',
      date: new Date('2024-01-15').toISOString(),
      transport: 'Logistics Co.',
      coordinates: { lat: -1.2921, lng: 36.8219 }
    }
  ])

  const inventory = ref([
    {
      id: 'INV001',
      warehouse: 'Nairobi Warehouse',
      description: 'Medical Supplies',
      quantity: 1500,
      status: 'available',
      priority: 'high',
      lastUpdated: new Date('2024-01-14').toISOString(),
      transport: 'Logistics Co.',
      coordinates: { lat: -1.2921, lng: 36.8219 }
    }
  ])

  const warehouses = ref([
    {
      id: 'W001',
      location: 'Nairobi Warehouse',
      capacity: 5000,
      utilization: 75,
      transport: 'Logistics Co.',
      email: 'nairobi@example.org',
      phone: '+254 700 123456',
      coordinates: { lat: -1.2921, lng: 36.8219 }
    }
  ])

  const transportProviders = ref([
    {
      id: 'T001',
      name: 'Logistics Co.',
      location: 'Nairobi',
      email: 'info@logistics.co.ke',
      phone: '+254 700 111111',
      status: 'active',
      rating: 4
    }
  ])

  const users = ref([
    {
      id: 'U001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.org',
      organization: 'Red Cross',
      role: 'Admin'
    }
  ])

  const partners = ref([
    {
      id: 'P001',
      organization: 'Red Cross',
      contactName: 'Dr. Sarah Johnson',
      address: 'Nairobi HQ',
      email: 's.johnson@redcross.org',
      phone: '+254 700 333333'
    }
  ])

  return {
    shipments,
    inventory,
    warehouses,
    transportProviders,
    users,
    partners
  }
})
