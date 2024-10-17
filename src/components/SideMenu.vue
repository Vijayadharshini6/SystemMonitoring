<template>
  <div class="side-menu" @click="handleSideMenuClick">
    <h1 class="title">System Health Monitor</h1>
    <ul>
      <!-- Dashboard Menu -->
      <li :class="{ 'active-item': activeMenu === 'dashboard' }" @click="setActiveMenu('dashboard')">
        <router-link to="/system-health" class="side-menu1">Dashboard</router-link>
      </li>

      <!-- Systems Menu -->
      <li 
        :class="{ 'active-item': activeMenu === 'systems' || activeMenu.startsWith('system') }"
        @click="toggleDropdown"
      >
        <a href="#" class="side-menu1">Systems</a>

        <!-- Dropdown list, shown when `showDropdown` is true -->
        <ul v-show="showDropdown" class="dropdown">
          <li v-for="(systemInfo, index) in systemData" :key="index"
              :class="{ 'active-item': activeMenu === `system-${index}` }"
              @click.stop="selectSystem(`system-${index}`)">
            <router-link :to="{ name: 'DrawerTable', params: { systemName: systemInfo }}" exact>
              {{ systemInfo }}
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeMenu: '',
      showDropdown: false,
      systemData: [
        'Abitha', 
        'Hari',
        'Kirthiga',
        'Mounesh',
        'Pragathi', 
        'Praveen', 
        'Swathi', 
        'Thangavi',
        'Thulasi',
        'Dharshini'
      ]
    };
  },
  methods: {
    toggleDropdown(event) {
      event.stopPropagation(); // Prevent the click from bubbling up to document
      this.showDropdown = !this.showDropdown;
      this.activeMenu = this.showDropdown ? 'systems' : '';
    },
    setActiveMenu(menu) {
      this.activeMenu = menu;
      this.showDropdown = false; // Hide dropdown when a menu is clicked
    },
    selectSystem(menu) {
      this.setActiveMenu(menu);
    },
    handleClickOutside(event) {
      const sideMenu = this.$el;
      // Close dropdown if the click is outside the side menu
      if (!sideMenu.contains(event.target)) {
        this.showDropdown = false;
      }
    },
    handleSideMenuClick(event) {
      const clickedElement = event.target;
      const dropdown = this.$el.querySelector('.dropdown');
      const systemsMenu = this.$el.querySelector('.side-menu1'); // "Systems" menu link

      // Check if the click is on "Systems" menu or inside dropdown, otherwise hide the dropdown
      if (clickedElement !== systemsMenu && !dropdown.contains(clickedElement)) {
        this.showDropdown = false;
      }
    }
  },
  mounted() {
    // Add click listener to the document for detecting outside clicks
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    // Remove click listener when the component is destroyed
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>


<style scoped>
/* Your existing styles */
.side-menu {
  width: 250px;
  background-color: #140244;
  color: white;
  padding: 40px;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
}

h1.title {
  font-size: 20px;
}

.side-menu h1 {
  widows: 100%;
  margin-top: 0;
  font-size: 23px;
  margin-bottom: 50px;
}

.side-menu ul {
  list-style: none;
  padding: 0;
}

.side-menu li {
  margin: 15px 0;
  font-size: large;
}

.side-menu a {
  color: white;
  font-size: 20px;
  text-decoration: none;
  display: block; /* Ensure a is block-level */
  padding: 10px 20px; /* Add left padding to align text inside */
  margin: 0;
}

a.side-menu1 {
  padding: 10px 20px;
  display: block;
  text-align: left;
  border-radius: 20px;
}

.active-item a {
  background-color: rgb(163, 26, 26);
}

.dropdown {
  list-style: none;
  padding-left: 20px;
}

.dropdown li {
  margin: 10px 0;
  background-color: transparent;
}

.dropdown a {
  border-radius: 20px;
  color: white;
  padding-left: 40px; /* Indent the dropdown items for a better hierarchy */
}

a.side-menu1[data-v-79f86886] {
  padding: 10px 20px;
  display: block;
  text-align: center;
  font-size: 25px;
  font-family: Georgia, 'Times New Roman';
  border-radius: 20px;
}

.side-menu[data-v-79f86886] a:hover {
  background-color: rgb(31, 17, 83);
  border-radius: 20px;
}

.side-menu[data-v-79f86886] a:hover {
  display: block;
}
</style>
