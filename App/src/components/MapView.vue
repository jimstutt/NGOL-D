<!-- App/src/components/MapView.vue -->
<template>
  <div id="map" ref="mapRef" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const mapRef = ref(null);

onMounted(async () => {
  try {
    // ✅ Works with @googlemaps/js-api-loader@1.15.1 (confirmed latest working with Loader)
    const { Loader } = await import('@googlemaps/js-api-loader');
    const loader = new Loader({
      apiKey: 'AIzaSyBTmKzNwMM1OIruKtneSGHYUYbJHMUL6j0',
      version: 'weekly',
      libraries: ['marker']
    });

    // ✅ Critical: await loader.load() BEFORE using google
    await loader.load();

    // ✅ Now 'google' is defined
    const map = new google.maps.Map(mapRef.value, {
      center: { lat: 0.0236, lng: 37.9062 }, // Kenya
      zoom: 6,
      mapId: '1c58c0dd9e35ef9c4882d48a'     // from NGOLTechSpec.md
    });

    // 15px markers — per spec
    const createMarker = (color, icon) => {
      const el = document.createElement('div');
      el.innerHTML = `<div style="
        background: ${color};
        width: 15px; height: 15px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${icon}</div>`;
      return el;
    };

    // Blue warehouse
    new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: -1.2864, lng: 36.8172 },
      title: 'Nairobi Warehouse',
      content: createMarker('blue', '🏦')
    });

    // Green shipment
    new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: -1.3, lng: 36.83 },
      title: 'In-transit Shipment',
      content: createMarker('green', '🚚')
    });

    console.log('✅ Google Maps loaded');
  } catch (err) {
    console.error('❌ Google Maps failed:', err);
    alert('Map failed to load. Check API key and network.');
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>
