<template>
  <div ref="mapElement" class="map"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const mapElement = ref(null)

onMounted(async () => {
  const { Loader } = await import('@googlemaps/js-api-loader')
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBTmKzNwMM1OIruKtneSGHYUYbJHMUL6j0',
    version: 'weekly',
    libraries: ['marker']
  })

  const google = await loader.load()

  const map = new google.maps.Map(mapElement.value, {
    center: { lat: 0.0236, lng: 37.9062 }, // Kenya
    zoom: 6,
    mapId: '1c58c0dd9e35ef9c4882d48a'
  })

  // Blue warehouse
  new google.maps.marker.AdvancedMarkerElement({
    map,
    position: { lat: -1.2864, lng: 36.8172 },
    title: 'Nairobi Warehouse',
    content: createMarker('#3498db', '🏦')
  })

  // Green shipment
  new google.maps.marker.AdvancedMarkerElement({
    map,
    position: { lat: -1.3, lng: 36.83 },
    title: 'In-transit',
    content: createMarker('#2ecc71', '🚛')
  })

  function createMarker(color, icon) {
    const el = document.createElement('div')
    el.innerHTML = `
      <div style="
        background: ${color};
        width: 15px; height: 15px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 10px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
      ">${icon}</div>`
    return el
  }
})
</script>

<style scoped>
.map { width: 100%; height: 100%; }
</style>
