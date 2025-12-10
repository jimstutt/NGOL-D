import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useShipmentStore = defineStore('shipment', () => {
  // State
  const shipments = ref([])
  const inventory = ref([])
  const warehouses = ref([])
  const transportProviders = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Mock data for demonstration (fallback when API is not available)
  const mockShipments = [
    {
      id: '1',
      source: 'Nairobi Warehouse',
      description: 'Medical Supplies',
      quantity: 500,
      destination: 'Kakuma Refugee Camp',
      transport: 'Kenya Red Cross',
      coordinates: { lat: -1.2921, lng: 36.8219 },
      status: 'in-transit',
      priority: 'high',
      createdAt: '2024-01-15T08:00:00Z'
    },
    {
      id: '2',
      source: 'Mombasa Warehouse',
      description: 'Food Rations',
      quantity: 1000,
      destination: 'Dadaab Refugee Camp',
      transport: 'World Food Programme',
      coordinates: { lat: -0.4167, lng: 39.6667 },
      status: 'pending',
      priority: 'critical',
      createdAt: '2024-01-14T10:30:00Z'
    },
    {
      id: '3',
      source: 'Kampala Warehouse',
      description: 'Water Purification',
      quantity: 200,
      destination: 'Bidi Bidi Settlement',
      transport: 'UNHCR Transport',
      coordinates: { lat: 0.3476, lng: 32.5825 },
      status: 'delivered',
      priority: 'high',
      createdAt: '2024-01-10T14:20:00Z'
    }
  ]

  const mockInventory = [
    {
      id: '1',
      warehouse: 'Nairobi Warehouse',
      description: 'Medical Supplies',
      type: 'Medical',
      quantity: 1500,
      transport: 'Kenya Red Cross',
      status: 'available',
      priority: 'high',
      updatedAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '2',
      warehouse: 'Mombasa Warehouse',
      description: 'Food Rations',
      type: 'Food',
      quantity: 5000,
      transport: 'World Food Programme',
      status: 'available',
      priority: 'medium',
      updatedAt: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      warehouse: 'Kampala Warehouse',
      description: 'Water Purification',
      type: 'Water',
      quantity: 800,
      transport: 'UNHCR Transport',
      status: 'low-stock',
      priority: 'high',
      updatedAt: '2024-01-13T11:30:00Z'
    },
    {
      id: '4',
      warehouse: 'Nairobi Warehouse',
      description: 'Emergency Shelter',
      type: 'Shelter',
      quantity: 300,
      transport: 'Kenya Red Cross',
      status: 'available',
      priority: 'medium',
      updatedAt: '2024-01-12T16:45:00Z'
    }
  ]

  const mockWarehouses = [
    {
      id: '1',
      location: 'Nairobi',
      capacity: 5000,
      transport: ['Kenya Red Cross', 'Local Transport'],
      email: 'nairobi@ngo.org',
      phone: '+254700123456',
      coordinates: { lat: -1.2921, lng: 36.8219 }
    },
    {
      id: '2',
      location: 'Mombasa',
      capacity: 3000,
      transport: ['World Food Programme', 'Maritime Transport'],
      email: 'mombasa@ngo.org',
      phone: '+254700654321',
      coordinates: { lat: -4.0435, lng: 39.6682 }
    },
    {
      id: '3',
      location: 'Kampala',
      capacity: 4000,
      transport: ['UNHCR Transport', 'Local Partners'],
      email: 'kampala@ngo.org',
      phone: '+256700789012',
      coordinates: { lat: 0.3476, lng: 32.5825 }
    }
  ]

  const mockTransportProviders = [
    {
      id: '1',
      name: 'Kenya Red Cross',
      location: 'Nairobi',
      email: 'logistics@redcross.or.ke',
      phone: '+254700111222',
      available: true
    },
    {
      id: '2',
      name: 'World Food Programme',
      location: 'Mombasa',
      email: 'transport@wfp.org',
      phone: '+254700333444',
      available: true
    },
    {
      id: '3',
      name: 'UNHCR Transport',
      location: 'Kampala',
      email: 'fleet@unhcr.org',
      phone: '+256700555666',
      available: true
    }
  ]

  // Getters
  const getShipmentById = (id) => shipments.value.find(shipment => shipment.id === id)
  const getInventoryById = (id) => inventory.value.find(item => item.id === id)
  const getWarehouseById = (id) => warehouses.value.find(warehouse => warehouse.id === id)
  const getTransportProviderById = (id) => transportProviders.value.find(provider => provider.id === id)

  const availableInventoryForWarehouse = computed(() => (warehouseLocation) => {
    return inventory.value.filter(item => 
      item.warehouse === warehouseLocation && item.quantity > 0
    )
  })

  const transportForWarehouse = computed(() => (warehouseLocation) => {
    const warehouse = warehouses.value.find(w => w.location === warehouseLocation)
    if (warehouse && warehouse.transport) {
      return transportProviders.value.filter(provider =>
        warehouse.transport.includes(provider.name)
      )
    }
    return transportProviders.value
  })

  // Actions
  const loadShipments = async () => {
    loading.value = true
    try {
      // Using mock data for now
      shipments.value = mockShipments
      error.value = null
    } catch (err) {
      // Fallback to mock data if API is not available
      console.warn('API not available, using mock data for shipments')
      shipments.value = mockShipments
      error.value = null
    } finally {
      loading.value = false
    }
  }

  const loadInventory = async () => {
    loading.value = true
    try {
      inventory.value = mockInventory
      error.value = null
    } catch (err) {
      console.warn('API not available, using mock data for inventory')
      inventory.value = mockInventory
      error.value = null
    } finally {
      loading.value = false
    }
  }

  const loadWarehouses = async () => {
    try {
      warehouses.value = mockWarehouses
    } catch (err) {
      console.warn('API not available, using mock data for warehouses')
      warehouses.value = mockWarehouses
    }
  }

  const loadTransportProviders = async () => {
    try {
      transportProviders.value = mockTransportProviders
    } catch (err) {
      console.warn('API not available, using mock data for transport providers')
      transportProviders.value = mockTransportProviders
    }
  }

  const addShipment = async (shipmentData) => {
    try {
      // Validate stock availability
      const inventoryItem = inventory.value.find(item => 
        item.description === shipmentData.description && 
        item.warehouse === shipmentData.source
      )

      if (!inventoryItem) {
        throw new Error('Inventory item not found in selected warehouse')
      }

      if (inventoryItem.quantity < shipmentData.quantity) {
        throw new Error(`Insufficient stock. Available: ${inventoryItem.quantity}, Requested: ${shipmentData.quantity}`)
      }

      // Create new shipment
      const newShipment = {
        id: Date.now().toString(),
        ...shipmentData,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      try {
        shipments.value.push(newShipment)
      } catch (apiErr) {
        // Fallback to local storage
        console.warn('API not available, storing shipment locally')
        shipments.value.push(newShipment)
      }

      // Update inventory
      await updateInventoryQuantity(inventoryItem.id, inventoryItem.quantity - shipmentData.quantity)

      return newShipment
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateShipment = async (id, shipmentData) => {
    try {
      const index = shipments.value.findIndex(shipment => shipment.id === id)
      if (index !== -1) {
        try {
          shipments.value[index] = { ...shipments.value[index], ...shipmentData }
        } catch (apiErr) {
          console.warn('API not available, updating shipment locally')
          shipments.value[index] = { ...shipments.value[index], ...shipmentData }
        }
      }
    } catch (err) {
      error.value = 'Failed to update shipment'
      throw err
    }
  }

  const removeShipment = async (id) => {
    try {
      try {
        // API call would go here
      } catch (apiErr) {
        console.warn('API not available, removing shipment locally')
      }
      shipments.value = shipments.value.filter(shipment => shipment.id !== id)
    } catch (err) {
      error.value = 'Failed to remove shipment'
      throw err
    }
  }

  const addInventory = async (inventoryData) => {
    try {
      const newItem = {
        id: Date.now().toString(),
        ...inventoryData,
        status: inventoryData.quantity > 0 ? 'available' : 'out-of-stock',
        updatedAt: new Date().toISOString()
      }

      try {
        inventory.value.push(newItem)
      } catch (apiErr) {
        console.warn('API not available, storing inventory locally')
        inventory.value.push(newItem)
      }

      return newItem
    } catch (err) {
      error.value = 'Failed to add inventory item'
      throw err
    }
  }

  const updateInventory = async (id, inventoryData) => {
    try {
      const index = inventory.value.findIndex(item => item.id === id)
      if (index !== -1) {
        const updatedItem = { 
          ...inventory.value[index], 
          ...inventoryData,
          updatedAt: new Date().toISOString()
        }
        
        // Update status based on quantity
        updatedItem.status = updatedItem.quantity === 0 ? 'out-of-stock' : 
                            updatedItem.quantity < 100 ? 'low-stock' : 'available'
        
        try {
          inventory.value[index] = updatedItem
        } catch (apiErr) {
          console.warn('API not available, updating inventory locally')
          inventory.value[index] = updatedItem
        }
      }
    } catch (err) {
      error.value = 'Failed to update inventory item'
      throw err
    }
  }

  const removeInventory = async (id) => {
    try {
      try {
        // API call would go here
      } catch (apiErr) {
        console.warn('API not available, removing inventory locally')
      }
      inventory.value = inventory.value.filter(item => item.id !== id)
    } catch (err) {
      error.value = 'Failed to remove inventory item'
      throw err
    }
  }

  const updateInventoryQuantity = async (id, newQuantity) => {
    try {
      const index = inventory.value.findIndex(item => item.id === id)
      if (index !== -1) {
        const updatedItem = {
          ...inventory.value[index],
          quantity: newQuantity,
          status: newQuantity === 0 ? 'out-of-stock' : 
                 newQuantity < 100 ? 'low-stock' : 'available',
          updatedAt: new Date().toISOString()
        }
        
        try {
          inventory.value[index] = updatedItem
        } catch (apiErr) {
          console.warn('API not available, updating inventory quantity locally')
          inventory.value[index] = updatedItem
        }
      }
    } catch (err) {
      error.value = 'Failed to update inventory quantity'
      throw err
    }
  }

  // Initialize data
  const initializeData = async () => {
    await Promise.all([
      loadShipments(),
      loadInventory(),
      loadWarehouses(),
      loadTransportProviders()
    ])
  }

  return {
    // State
    shipments,
    inventory,
    warehouses,
    transportProviders,
    loading,
    error,
    
    // Getters
    getShipmentById,
    getInventoryById,
    getWarehouseById,
    getTransportProviderById,
    availableInventoryForWarehouse,
    transportForWarehouse,
    
    // Actions
    loadShipments,
    loadInventory,
    loadWarehouses,
    loadTransportProviders,
    addShipment,
    updateShipment,
    removeShipment,
    addInventory,
    updateInventory,
    removeInventory,
    updateInventoryQuantity,
    initializeData
  }
})
