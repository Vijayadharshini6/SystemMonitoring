import { createApp } from 'vue'
import App from './App.vue'

import { createRouter, createWebHistory } from 'vue-router';

import SystemHealth from './components/SystemHealth.vue'; 
import DrawerTable from './components/DrawerTable.vue';// Import your components

// Define your routes


const routes = [

 { path: '/', component: SystemHealth },
 {path:'/system-health',component:SystemHealth},

  { path: '/drawer/:systemName', name: 'DrawerTable', component: DrawerTable, props: true } // Add this route
];

// Create the router instance


const router = createRouter({
 history: createWebHistory(),
  routes,
});

// Create and mount the app
createApp(App)
 .use(router) 
 .mount('#app');