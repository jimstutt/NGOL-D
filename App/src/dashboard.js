/**
 * NGO Logistics Management System - Dashboard
 * Frontend dashboard functionality
 */

class Dashboard {
  constructor() {
    this.map = null;
    this.markers = new Map();
    this.infoWindows = new Map();
    this.activeFilters = {
      showWarehouses: true,
      showShipments: true,
      showInventory: false
    };
    this.socket = null;
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  async init() {
    try {
      console.log('Initializing dashboard...');
      
      // Check if we're on dashboard page
      if (!document.getElementById('dashboard-map')) {
        console.log('Not on dashboard page, skipping initialization');
        return;
      }

      // Load Google Maps
      await this.loadGoogleMaps();
      
      // Initialize map
      this.initMap();
      
      // Load initial data
      await this.loadDashboardData();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Connect to Socket.IO for real-time updates
      this.connectSocketIO();
      
      console.log('Dashboard initialized successfully');
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this.showError('Failed to load dashboard. Please refresh the page.');
    }
  }

  async loadGoogleMaps() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBTmKzNwMM1OIruKtneSGHYUYbJHMUL6j0';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapCallback&libraries=marker&v=beta`;
      script.async = true;
      script.defer = true;
      
      window.initMapCallback = () => {
        console.log('Google Maps API loaded');
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  }

  initMap() {
    const mapElement = document.getElementById('dashboard-map');
    if (!mapElement) {
      throw new Error('Map element not found');
    }

    this.map = new google.maps.Map(mapElement, {
      center: { lat: 0.0236, lng: 37.9062 }, // Center on Kenya
      zoom: 6,
      mapId: '1c58c0dd9e35ef9c',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    console.log('Google Maps initialized');
  }

  async loadDashboardData() {
    try {
      this.showLoading(true);

      // Load statistics
      const statsResponse = await fetch(`${this.apiBaseUrl}/api/dashboard/stats`);
      const statsData = await statsResponse.json();
      
      if (statsData.status === 'success') {
        this.updateStatistics(statsData.data);
      }

      // Load map data
      const mapResponse = await fetch(`${this.apiBaseUrl}/api/dashboard/map-data`);
      const mapData = await mapResponse.json();
      
      if (mapData.status === 'success') {
        this.renderMapMarkers(mapData.data);
      }

      // Load recent shipments
      const shipmentsResponse = await fetch(`${this.apiBaseUrl}/api/shipments`);
      const shipmentsData = await shipmentsResponse.json();
      
      if (shipmentsData.status === 'success') {
        this.updateRecentShipments(shipmentsData.data);
      }

      this.showLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError('Failed to load dashboard data');
      this.showLoading(false);
      
      // Fallback to mock data
      this.useMockData();
    }
  }

  updateStatistics(stats) {
    // Update total shipments
    this.updateCard('total-shipments', stats.totalShipments, stats.shipmentChange);
    
    // Update delivery rate
    this.updateCard('delivery-rate', stats.deliveryRate, stats.deliveryRateChange);
    
    // Update average delivery days
    this.updateCard('avg-delivery', stats.avgDeliveryDays, stats.avgDeliveryChange);
    
    // Update active shipments
    this.updateCard('active-shipments', stats.activeShipments);
    
    // Update warehouse count
    this.updateCard('warehouse-count', stats.totalWarehouses);
    
    // Update inventory count
    this.updateCard('inventory-count', stats.totalInventory);
  }

  updateCard(cardId, value, change = '') {
    const card = document.getElementById(cardId);
    if (!card) return;

    const valueElement = card.querySelector('.stat-value');
    const changeElement = card.querySelector('.stat-change');
    
    if (valueElement) {
      valueElement.textContent = value;
    }
    
    if (changeElement && change) {
      changeElement.textContent = change;
      const trend = change.startsWith('+') ? 'up' : 'down';
      changeElement.className = `stat-change trend-${trend}`;
    }
  }

  renderMapMarkers(data) {
    // Clear existing markers
    this.clearMarkers();

    // Add warehouse markers
    if (this.activeFilters.showWarehouses && data.warehouses) {
      data.warehouses.forEach(warehouse => {
        this.addWarehouseMarker(warehouse);
      });
    }

    // Add shipment markers
    if (this.activeFilters.showShipments && data.shipments) {
      data.shipments.forEach(shipment => {
        this.addShipmentMarker(shipment);
      });
    }

    // Fit map to markers
    this.fitMapToMarkers();
    
    // Update legend
    this.updateLegend();
  }

  addWarehouseMarker(warehouse) {
    if (!warehouse.coordinates || !warehouse.coordinates.coordinates) return;

    const [lng, lat] = warehouse.coordinates.coordinates;
    const position = { lat, lng };

    // Create marker element
    const pinElement = document.createElement('div');
    pinElement.className = 'custom-marker warehouse-marker';
    pinElement.style.width = '15px';
    pinElement.style.height = '15px';
    pinElement.style.backgroundColor = '#4285F4';
    pinElement.style.borderRadius = '50%';
    pinElement.style.border = '2px solid white';
    pinElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    pinElement.style.cursor = 'pointer';
    pinElement.title = warehouse.name;

    // Create marker
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: position,
      title: warehouse.name,
      content: pinElement
    });

    // Add click event
    marker.addListener('click', () => {
      this.showWarehouseInfo(warehouse, marker);
    });

    // Store marker
    this.markers.set(`warehouse-${warehouse._id}`, marker);
  }

  addShipmentMarker(shipment) {
    if (!shipment.coordinates || !shipment.coordinates.coordinates) return;

    const [lng, lat] = shipment.coordinates.coordinates;
    const position = { lat, lng };
    
    // Get color based on status
    const colors = {
      pending: '#FBBC05',
      in_transit: '#34A853',
      delayed: '#EA4335',
      delivered: '#9C27B0',
      cancelled: '#6B7280'
    };
    
    const color = colors[shipment.status] || colors.pending;

    // Create marker element
    const pinElement = document.createElement('div');
    pinElement.className = 'custom-marker shipment-marker';
    pinElement.style.width = '15px';
    pinElement.style.height = '15px';
    pinElement.style.backgroundColor = color;
    pinElement.style.borderRadius = '50%';
    pinElement.style.border = '2px solid white';
    pinElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    pinElement.style.cursor = 'pointer';
    pinElement.title = `${shipment.shipmentId} - ${shipment.status}`;

    // Create marker
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: position,
      title: shipment.shipmentId,
      content: pinElement
    });

    // Add click event
    marker.addListener('click', () => {
      this.showShipmentInfo(shipment, marker);
    });

    // Store marker
    this.markers.set(`shipment-${shipment._id}`, marker);
  }

  showWarehouseInfo(warehouse, marker) {
    this.closeAllInfoWindows();

    const content = `
      <div class="info-window">
        <h3>${warehouse.name}</h3>
        <div class="info-section">
          <p><strong>Location:</strong> ${warehouse.location}</p>
          <p><strong>Capacity:</strong> ${warehouse.capacity} sq m</p>
          <p><strong>Utilization:</strong> ${warehouse.currentUtilization}%</p>
          <p><strong>Contact:</strong> ${warehouse.contactPerson}</p>
          <p><strong>Email:</strong> ${warehouse.email}</p>
          <p><strong>Phone:</strong> ${warehouse.phone}</p>
        </div>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: content,
      maxWidth: 300
    });

    infoWindow.open(this.map, marker);
    this.infoWindows.set(`warehouse-${warehouse._id}`, infoWindow);
  }

  showShipmentInfo(shipment, marker) {
    this.closeAllInfoWindows();

    const content = `
      <div class="info-window">
        <h3>Shipment: ${shipment.shipmentId}</h3>
        <div class="info-section">
          <p><strong>Status:</strong> <span class="status-badge ${shipment.status}">${shipment.status}</span></p>
          <p><strong>Priority:</strong> ${shipment.priority}</p>
          <p><strong>From:</strong> ${shipment.sourceName}</p>
          <p><strong>To:</strong> ${shipment.destination}</p>
          <p><strong>Item:</strong> ${shipment.description}</p>
          <p><strong>Quantity:</strong> ${shipment.quantity} ${shipment.unit}</p>
          <p><strong>Est. Delivery:</strong> ${new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}</p>
        </div>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: content,
      maxWidth: 300
    });

    infoWindow.open(this.map, marker);
    this.infoWindows.set(`shipment-${shipment._id}`, infoWindow);
  }

  clearMarkers() {
    this.markers.forEach(marker => {
      marker.map = null;
    });
    this.markers.clear();
    this.closeAllInfoWindows();
  }

  closeAllInfoWindows() {
    this.infoWindows.forEach(infoWindow => {
      infoWindow.close();
    });
    this.infoWindows.clear();
  }

  fitMapToMarkers() {
    const bounds = new google.maps.LatLngBounds();
    
    this.markers.forEach(marker => {
      bounds.extend(marker.position);
    });
    
    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds);
      
      // Don't zoom in too close if only one marker
      if (this.markers.size === 1) {
        google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
          if (this.map.getZoom() > 12) {
            this.map.setZoom(12);
          }
        });
      }
    }
  }

  updateLegend() {
    const legend = document.getElementById('map-legend');
    if (!legend) return;

    legend.innerHTML = `
      <div class="legend-title">Map Legend</div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #4285F4;"></div>
        <span>Warehouses</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #FBBC05;"></div>
        <span>Pending Shipments</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #34A853;"></div>
        <span>In Transit</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #EA4335;"></div>
        <span>Delayed</span>
      </div>
    `;
  }

  updateRecentShipments(shipments) {
    const table = document.getElementById('recent-shipments-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Show last 5 shipments
    const recentShipments = shipments.slice(0, 5);
    
    recentShipments.forEach(shipment => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${shipment.shipmentId}</td>
        <td>${shipment.sourceName}</td>
        <td>${shipment.destination}</td>
        <td><span class="status-badge ${shipment.status}">${shipment.status}</span></td>
        <td>${new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}</td>
      `;
      tbody.appendChild(row);
    });
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-dashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadDashboardData();
      });
    }

    // Filter toggles
    const warehouseToggle = document.getElementById('toggle-warehouses');
    if (warehouseToggle) {
      warehouseToggle.addEventListener('change', (e) => {
        this.activeFilters.showWarehouses = e.target.checked;
        this.loadDashboardData();
      });
    }

    const shipmentToggle = document.getElementById('toggle-shipments');
    if (shipmentToggle) {
      shipmentToggle.addEventListener('change', (e) => {
        this.activeFilters.showShipments = e.target.checked;
        this.loadDashboardData();
      });
    }

    // Fit to bounds button
    const fitBoundsBtn = document.getElementById('fit-to-bounds');
    if (fitBoundsBtn) {
      fitBoundsBtn.addEventListener('click', () => {
        this.fitMapToMarkers();
      });
    }
  }

  connectSocketIO() {
    try {
      if (window.io) {
        this.socket = io(this.apiBaseUrl);
        
        this.socket.on('connect', () => {
          console.log('Connected to real-time updates');
        });
        
        this.socket.on('shipmentUpdated', (data) => {
          console.log('Shipment update received:', data);
          this.showNotification(`Shipment ${data.shipmentId} updated`);
          this.loadDashboardData();
        });
      }
    } catch (error) {
      console.warn('Socket.IO not available:', error);
    }
  }

  useMockData() {
    console.log('Using mock data for dashboard');
    
    const mockStats = {
      totalShipments: 156,
      shipmentChange: '+12%',
      deliveryRate: '92%',
      deliveryRateChange: '-5%',
      avgDeliveryDays: 3.2,
      avgDeliveryChange: '+8%',
      activeShipments: 42,
      totalWarehouses: 8,
      totalInventory: 187
    };
    
    this.updateStatistics(mockStats);
  }

  showLoading(show) {
    const loadingElement = document.getElementById('dashboard-loading');
    if (loadingElement) {
      loadingElement.style.display = show ? 'flex' : 'none';
    }
  }

  showError(message) {
    console.error('Dashboard error:', message);
    // Could show a toast notification here
  }

  showNotification(message) {
    console.log('Notification:', message);
    // Could show a toast notification here
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new Dashboard();
  window.dashboard.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
}
