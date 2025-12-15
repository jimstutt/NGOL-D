<template>
  <nav class="left-nav">
    <ul>
      <li><RouterLink to="/dashboard">Dashboard</RouterLink></li>
      <li><RouterLink to="/shipments">Shipments</RouterLink></li>
      <li><RouterLink to="/reports">Reports</RouterLink></li>
      <li><RouterLink to="/admin">Admin</RouterLink></li>
    </ul>
  </nav>
</template>

<script>
export default { name: 'Navigation' };
</script>

<style scoped>
.left-nav {
  width: 220px;
  background: rgba(250, 250, 250, 0.95);
  border-right: 1px solid #e0e0e0;
  height: 100vh;
  padding: 20px 0;
}
.left-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.left-nav li {
  margin-bottom: 8px;
}
.left-nav a {
  display: block;
  padding: 10px 20px;
  color: #2c3e50; /* ✅ black text (dark gray for readability) */
  text-decoration: none;
}
.left-nav a:hover,
.left-nav a.router-link-active {
  background: #e3f2fd;
  color: #1976d2;
}
</style>
