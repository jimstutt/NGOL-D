<template>
  <div class="map-container">
    <div ref="mapContainer" class="map-element"></div>
    <div class="map-controls">
      <div class="map-legend">
        <h6>Map Legend</h6>
        <div class="legend-item">
          <div class="legend-color warehouse"></div>
          <span>Warehouses</span>
        </div>
        <div class="legend-item">
          <div class="legend-color in-transit"></div>
          <span>In-Transit Shipments</span>
        </div>
        <div class="legend-item">
          <div class="legend-color delayed"></div>
          <span>Delayed Shipments</span>
        </div>
        <div class="legend-item">
          <div class="legend-color pending"></div>
          <span>Pending Shipments</span>
        </div>
      </div>
      <div class="visibility-controls">
        <button 
          @click="toggleWarehouses" 
          :class="['btn', 'btn-sm', showWarehouses ? 'btn-primary' : 'btn-outline-primary']"
        >
          Show Warehouses
        </button>
        <button 
          @click="toggleShipments" 
          :class="['btn', 'btn-sm', showShipments ? 'btn-primary' : 'btn-outline-primary']"
        >
          Show Shipments
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";

export default {
  name: 'MapView',
  data() {
    return {
      map: null,
      loader: null,
      markers: [],
      showWarehouses: true,
      showShipments: true,
      warehouses: [
        {
          id: 1,
          location: "Nairobi Main Warehouse",
          lat: -1.2921,
          lng: 36.8219,
          capacity: 5000,
          utilization: 75,
          status: "operational"
        },
        {
          id: 2,
          location: "Mombasa Port Warehouse",
          lat: -4.0435,
          lng: 39.6682,
          capacity: 3000,
          utilization: 60,
          status: "operational"
        },
        {
          id: 3,
          location: "Kisumu Regional Warehouse",
          lat: -0.1022,
          lng: 34.7617,
          capacity: 2000,
          utilization: 45,
          status: "operational"
        }
      ],
      shipments: [
        {
          id: 1,
          trackingNumber: "SH-001",
          source: "Nairobi Main Warehouse",
          destination: "Kakuma Refugee Camp",
          lat: -1.2921,
          lng: 36.8219,
          status: "in-transit",
          priority: "high"
        },
        {
          id: 2,
          trackingNumber: "SH-002",
          source: "Mombasa Port Warehouse",
          destination: "Dadaab Refugee Camp",
          lat: -4.0435,
          lng: 39.6682,
          status: "delayed",
          priority: "medium"
        },
        {
          id: 3,
          trackingNumber: "SH-003",
          source: "Kisumu Regional Warehouse",
          destination: "Lodwar Town",
          lat: -0.1022,
          lng: 34.7617,
          status: "pending",
          priority: "low"
        }
      ]
    }
  },
  async mounted() {
    await this.initializeMap();
    this.loadMarkers();
  },
  beforeUnmount() {
    this.clearMarkers();
  },
  methods: {
    async initializeMap() {
      try {
        this.loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["marker"],
          mapIds: [import.meta.env.VITE_GOOGLE_MAPS_MAP_ID]
        });

        const { Map } = await this.loader.importLibrary("maps");
        
        this.map = new Map(this.$refs.mapContainer, {
          center: { lat: -1.2921, lng: 36.8219 },
          zoom: 6,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          styles: [
            {
              "featureType": "administrative",
              "elementType": "geometry",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "administrative.land_parcel",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "administrative.neighborhood",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "poi",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "road",
              "elementType": "labels.icon",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "transit",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "water",
              "elementType": "labels.text",
              "stylers": [{ "visibility": "off" }]
            }
          ]
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        this.$emit('mapError', error.message);
      }
    },

    async loadMarkers() {
      this.clearMarkers();
      
      if (this.showWarehouses) {
        await this.createWarehouseMarkers();
      }
      
      if (this.showShipments) {
        await this.createShipmentMarkers();
      }
    },

    async createWarehouseMarkers() {
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

      this.warehouses.forEach(warehouse => {
        const pinElement = new PinElement({
          background: '#4285F4',
          borderColor: '#1a73e8',
          glyphColor: '#ffffff',
          scale: 1.2
        });

        const marker = new AdvancedMarkerElement({
          map: this.map,
          position: { lat: warehouse.lat, lng: warehouse.lng },
          content: pinElement.element,
          title: warehouse.location
        });

        const infoWindow = new google.maps.InfoWindow({
          content: this.createWarehouseInfoContent(warehouse)
        });

        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });

        this.markers.push({ marker, infoWindow, type: 'warehouse' });
      });
    },

    async createShipmentMarkers() {
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

      this.shipments.forEach(shipment => {
        let pinConfig;
        
        switch(shipment.status) {
          case 'in-transit':
            pinConfig = {
              background: '#34A853',
              borderColor: '#2E8B47',
              glyphColor: '#ffffff'
            };
            break;
          case 'delayed':
            pinConfig = {
              background: '#EA4335',
              borderColor: '#D33426',
              glyphColor: '#ffffff'
            };
            break;
          case 'pending':
            pinConfig = {
              background: '#FBBC05',
              borderColor: '#E6A704',
              glyphColor: '#ffffff'
            };
            break;
          default:
            pinConfig = {
              background: '#4285F4',
              borderColor: '#1a73e8',
              glyphColor: '#ffffff'
            };
        }

        const pinElement = new PinElement(pinConfig);
        
        const marker = new AdvancedMarkerElement({
          map: this.map,
          position: { lat: shipment.lat, lng: shipment.lng },
          content: pinElement.element,
          title: `Shipment: ${shipment.trackingNumber}`
        });

        const infoWindow = new google.maps.InfoWindow({
          content: this.createShipmentInfoContent(shipment)
        });

        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });

        this.markers.push({ marker, infoWindow, type: 'shipment' });
      });
    },

    createWarehouseInfoContent(warehouse) {
      return `
        <div class="map-info-window">
          <h6>${warehouse.location}</h6>
          <div class="info-details">
            <p><strong>Capacity:</strong> ${warehouse.capacity} sq m</p>
            <p><strong>Utilization:</strong> ${warehouse.utilization}%</p>
            <p><strong>Status:</strong> <span class="status-${warehouse.status}">${warehouse.status}</span></p>
          </div>
          <div class="info-actions">
            <button onclick="console.log('View warehouse ${warehouse.id}')" class="btn-info">View Details</button>
          </div>
        </div>
      `;
    },

    createShipmentInfoContent(shipment) {
      const statusClass = `status-${shipment.status}`;
      return `
        <div class="map-info-window">
          <h6>Shipment ${shipment.trackingNumber}</h6>
          <div class="info-details">
            <p><strong>Source:</strong> ${shipment.source}</p>
            <p><strong>Destination:</strong> ${shipment.destination}</p>
            <p><strong>Status:</strong> <span class="${statusClass}">${shipment.status}</span></p>
            <p><strong>Priority:</strong> ${shipment.priority}</p>
          </div>
          <div class="info-actions">
            <button onclick="console.log('Track shipment ${shipment.id}')" class="btn-info">Track Shipment</button>
          </div>
        </div>
      `;
    },

    clearMarkers() {
      this.markers.forEach(({ marker, infoWindow }) => {
        marker.map = null;
        infoWindow.close();
      });
      this.markers = [];
    },

    toggleWarehouses() {
      this.showWarehouses = !this.showWarehouses;
      this.loadMarkers();
    },

    toggleShipments() {
      this.showShipments = !this.showShipments;
      this.loadMarkers();
    }
  },
  watch: {
    showWarehouses() {
      this.loadMarkers();
    },
    showShipments() {
      this.loadMarkers();
    }
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.map-element {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
}

.map-legend {
  margin-bottom: 15px;
}

.map-legend h6 {
  margin-bottom: 10px;
  color: #333;
  font-weight: 600;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 8px;
  border: 2px solid;
}

.legend-color.warehouse {
  background: #4285F4;
  border-color: #1a73e8;
}

.legend-color.in-transit {
  background: #34A853;
  border-color: #2E8B47;
}

.legend-color.delayed {
  background: #EA4335;
  border-color: #D33426;
}

.legend-color.pending {
  background: #FBBC05;
  border-color: #E6A704;
}

.visibility-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.visibility-controls .btn {
  font-size: 0.8rem;
  padding: 6px 12px;
}

:deep(.map-info-window) {
  padding: 8px;
  max-width: 250px;
}

:deep(.map-info-window h6) {
  margin: 0 0 8px 0;
  color: #333;
  font-weight: 600;
}

:deep(.info-details) {
  margin-bottom: 10px;
}

:deep(.info-details p) {
  margin: 4px 0;
  font-size: 0.9rem;
  color: #666;
}

:deep(.info-details strong) {
  color: #333;
}

:deep(.status-operational) {
  color: #34A853;
  font-weight: 600;
}

:deep(.status-in-transit) {
  color: #34A853;
  font-weight: 600;
}

:deep(.status-delayed) {
  color: #EA4335;
  font-weight: 600;
}

:deep(.status-pending) {
  color: #FBBC05;
  font-weight: 600;
}

:deep(.info-actions) {
  text-align: center;
}

:deep(.btn-info) {
  background: #4285F4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

:deep(.btn-info:hover) {
  background: #3367D6;
}
</style>
