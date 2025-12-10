<template>
  <div class="fallback-map">
    <div class="fallback-content">
      <i class="fas fa-map-marked-alt"></i>
      <h3>Interactive Map</h3>
      <p>Google Maps integration will appear here when configured.</p>
      <div class="fallback-data">
        <div class="data-grid">
          <div class="data-item" v-for="warehouse in warehouses" :key="warehouse.id">
            <span class="pin warehouse"></span>
            <span>{{ warehouse.name }}</span>
          </div>
          <div class="data-item" v-for="shipment in shipments" :key="shipment.id">
            <span class="pin" :class="shipment.status"></span>
            <span>{{ shipment.name }} ({{ shipment.status }})</span>
          </div>
        </div>
      </div>
      <div class="setup-instructions">
        <h4>Setup Instructions:</h4>
        <ol>
          <li>Get a Google Maps API key from <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
          <li>Enable "Maps JavaScript API" and "Marker Library"</li>
          <li>Add your API key to the .env file as VITE_GOOGLE_MAPS_API_KEY</li>
          <li>Restart the development server</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FallbackMap',
  props: {
    warehouses: {
      type: Array,
      default: () => []
    },
    shipments: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.fallback-map {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.fallback-content {
  text-align: center;
  padding: 40px;
  max-width: 600px;
}

.fallback-content i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.fallback-content h3 {
  margin-bottom: 15px;
  font-size: 24px;
}

.fallback-content p {
  margin-bottom: 30px;
  opacity: 0.9;
}

.fallback-data {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  text-align: left;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
}

.pin {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.pin.warehouse {
  background: #3498db;
}

.pin.in-transit {
  background: #2ecc71;
}

.pin.delayed {
  background: #e74c3c;
}

.pin.pending {
  background: #f39c12;
}

.setup-instructions {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  text-align: left;
}

.setup-instructions h4 {
  margin-bottom: 15px;
  text-align: center;
}

.setup-instructions ol {
  padding-left: 20px;
}

.setup-instructions li {
  margin-bottom: 8px;
  opacity: 0.9;
}

.setup-instructions a {
  color: #3498db;
  text-decoration: none;
}

.setup-instructions a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .data-grid {
    grid-template-columns: 1fr;
  }
}
</style>
