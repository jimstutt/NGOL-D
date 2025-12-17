<template>
  <nav class="left-nav">
    <ul>
      <li><RouterLink to="/dashboard">Dashboard</RouterLink></li>
      <li><RouterLink to="/shipments">Shipments</RouterLink></li>
      <li><RouterLink to="/delivery-notes">Delivery Notes</RouterLink></li>
      <li><RouterLink to="/reports">Reports</RouterLink></li>
      <li><RouterLink to="/admin">Admin</RouterLink></li>
    </ul>
  </nav>
</template>
<style scoped>
.left-nav { width: 110px; background: rgba(250,250,250,0.95); padding: 15px 0; height: 100vh; }
.left-nav ul { list-style: none; padding: 0; margin: 0; }
.left-nav li { margin-bottom: 8px; }
.left-nav a { display: block; padding: 8px 10px; color: #2c3e50; text-decoration: none; font-size: 13px; text-align: center; }
</style>
