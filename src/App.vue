
<template>
  <div id="app">
    <SideMenu /> 
   
    <div class="main-content">
      <router-view /> <!-- This will render the currently active route component -->
    </div>
  </div>
</template>

<script>
import SideMenu from './components/SideMenu.vue'; // Import the SideMenu component
export default {
  name: 'App',
  components: {
    SideMenu,
  },
};

</script>

<style>
body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 0;
}
h1{
  text-align: center;
}

.main-content {
  margin-left: 200px; /* Leave space for the side menu */
  padding: 20px;
  flex-grow: 1; /* This allows the main content area to take remaining space */
}

.container {
  max-width: 100%;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>