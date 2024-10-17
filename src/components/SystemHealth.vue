
<template>
  <!-- Show WebSocket error if the connection is closed -->
  <div v-if="!isConnected">
    <p>The WebSocket connection is closed. No data is currently available.</p> 
  </div>

  <!-- Show 'No live data' message if there is no live data available -->
  <div v-else-if="filteredSystemData.length === 0">
    <p>No live data is being received at the moment.</p>
  </div>

  <!-- Show system information cards if data is available -->
  <div v-else>
    <div class="grid">
      <div class="card" v-for="(systemInfo, key) in filteredSystemData" :key="key">
        <div class="card-header">
          <h2>{{ key }}</h2>
        </div>
        <div class="metric">
          <i class="fa-solid fa-user-tie"></i>
          <span class="label">Hostname:</span>
          <span>{{ systemInfo.hostname }}</span>
        </div>
        <div class="metric">
          <i class="fas fa-clock"></i>
          <span class="label">Timestamp:</span>
          <span class="timestamp">{{ formatTimestamp(systemInfo.timestamp) }}</span>
        </div>
        <div class="card-body">
          <div class="metric">
            <i class="fas fa-desktop"></i>
            <span class="label">CPU Model:</span>
            <span>{{ systemInfo.cpu_model }}</span>
          </div>
          <div class="metric">
            <i class="fas fa-memory"></i>
            <span class="label">Memory:</span>
            <span>{{ systemInfo.used_memory }} / {{ systemInfo.total_memory }} ({{ getMemoryPercentage(systemInfo.used_memory, systemInfo.total_memory) }}%)</span>
          </div>
          <div class="metric">
            <i class="fa-solid fa-gauge"></i>
            <span class="label">Uptime:</span>
            <span>{{ systemInfo.uptime }}</span>
          </div>
          <div class="metric">
            <i class="fas fa-wifi"></i>
            <span class="label">WiFi:</span>
            <span>{{ systemInfo.wifi }}</span>
          </div>
          <div class="metric">
            <i class="fas fa-network-wired"></i>
            <span class="label">IP Address:</span>
            <span>{{ systemInfo.ip }}</span>
          </div>
          <div class="metric battery-status">
            <span class="label">Battery:</span>
            <div class="battery-container">
              <div class="battery">
                <div class="battery-fill" :style="{ width: batteryPercentage(systemInfo.battery) + '%' }"></div>
              </div>
              <span class="percentage">{{ batteryPercentage(systemInfo.battery) }}%</span>
              <span class="battery-state">{{ batteryState(systemInfo.battery) }}</span>
              <span class="time-to-empty">{{ batteryTimeToEmpty(systemInfo.battery) }}</span>
            </div>
          </div>
          <div class="metric ssh-status">
            <i class="fas fa-server"></i>
            <span class="label">SSH Info:</span>
            <span :class="{'ssh-active': isSshActive(systemInfo.ssh_info), 'ssh-inactive': isSshInactive(systemInfo.ssh_info)}">
              {{ systemInfo.ssh_info }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

 

<script>
import '@fortawesome/fontawesome-free/css/all.css';
import { reactive, onMounted, onBeforeUnmount, computed } from 'vue';

export default {
  setup() {
    const systemData = reactive({}); // Initialize reactive state for system data
    const isConnected = reactive({ value: false }); // Track WebSocket connection status
    const hasLiveData = reactive({ value: false }); // Track if live data is being received
    let socket = null; // Declare socket variable
    let dataTimer = null; // Timer to track data reception
    const DATA_TIMEOUT = 5000;
    const THRESHOLD = 5000; // Set the threshold to 10 seconds (10,000 ms)
    let cleanupInterval = null; // Interval for cleaning up old data

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    };

    const batteryPercentage = (batteryInfo) => {
      const percentageMatch = batteryInfo.match(/percentage:\s*(\d+)%/);
      return percentageMatch ? Math.min(100, parseInt(percentageMatch[1], 10)) : 0;
    };

    const batteryTimeToEmpty = (batteryInfo) => {
      const timeMatch = batteryInfo.match(/time to (full|empty):\s*([\d.]+ hours|[\d.]+ minutes)/);
      return timeMatch ? timeMatch[2] : 'N/A';
    };

    const batteryState = (batteryInfo) => {
      const stateMatch = batteryInfo.match(/state:\s*(\w+)/);
      return stateMatch ? stateMatch[1] : 'unknown';
    };

    const getMemoryPercentage = (usedMemory, totalMemory) => {
      const used = parseFloat(usedMemory);
      const total = parseFloat(totalMemory);
      return ((used / total) * 100).toFixed(2);
    };

    const isSshActive = (sshInfo) => {
      return sshInfo && sshInfo.toLowerCase().includes('active ssh connections');
    };

    const isSshInactive = (sshInfo) => {
      return sshInfo && sshInfo.toLowerCase().includes('no active ssh connections');
    };

    const filteredSystemData = computed(() => {
      const currentTime = new Date().getTime();
      return Object.keys(systemData).reduce((result, key) => {
        const systemInfo = systemData[key];

        // Check if the system info has a valid timestamp and is within the threshold
        if (systemInfo && systemInfo.timestamp) {
          const lastUpdateTime = new Date(systemInfo.timestamp).getTime();
          if (currentTime - lastUpdateTime <= THRESHOLD) {
            result[key] = systemInfo;
          }
        }
        return result;
      }, {});
    });

    const fetchData = () => {
      try {
        socket = new WebSocket('ws://thangavi:8080/SystemMonitoring/clientws');

        socket.onopen = () => {
          console.log('WebSocket connection established');
          isConnected.value = true; // Set connection status to true
        };

        socket.onmessage = (event) => {
          try {
            const message = event.data.trim();

            if (message.includes('Message from queue:')) {
              const jsonData = message.split('Message from queue: ')[1].trim();
              console.log('Raw JSON Data:', jsonData);

              if (jsonData && jsonData !== "No message in the queue.") {
                let data;
                try {
                  data = JSON.parse(jsonData);
                } catch (jsonError) {
                  console.error('JSON parsing error:', jsonError);
                  return; // Exit if JSON parsing fails
                }

                // Update system data with the received data
                Object.keys(data).forEach((key) => {
                  if (data[key].timestamp) {
                    systemData[key] = { ...systemData[key], ...data[key] }; // Update existing or create new data
                  }
                });

                hasLiveData.value = Object.keys(systemData).length > 0; // Set live data flag to true if there are valid entries
                resetDataTimer(); // Reset the data timer
                console.log('Updated system data:', systemData);
              } else {
                console.warn('No valid JSON data received.');
              }
            }
          } catch (error) {
            console.error('Error handling WebSocket message:', error, event.data);
          }
        }; 

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
          console.log('WebSocket connection closed');
          isConnected.value = false; // Set connection status to false
          hasLiveData.value = false; // Reset live data flag
        };
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    };

    const resetDataTimer = () => {
      // Clear the existing timer if it exists
      if (dataTimer) {
        clearTimeout(dataTimer);
      }
      // Set a new timer to check for live data reception
      dataTimer = setTimeout(() => {
        hasLiveData.value = false; // No live data received, set flag to false
      }, DATA_TIMEOUT);
    };

    const cleanupOldData = () => {
      const currentTime = new Date().getTime();
      Object.keys(systemData).forEach((key) => {
        const systemInfo = systemData[key];
        const lastUpdateTime = new Date(systemInfo.timestamp).getTime();
        if (currentTime - lastUpdateTime > THRESHOLD) {
          delete systemData[key]; // Remove old data
        }
      });
    };

    onMounted(() => {
      fetchData(); // Call fetchData when the component is mounted
      cleanupInterval = setInterval(cleanupOldData, 1000); // Clean up old data every 1 second
    });

    onBeforeUnmount(() => {
      if (socket) {
        socket.close(); // Close the WebSocket when the component is unmounted
      }
      if (dataTimer) {
        clearTimeout(dataTimer); // Clear the timer when the component is unmounted
      }
      if (cleanupInterval) {
        clearInterval(cleanupInterval); // Clear the cleanup interval
      }
    });

    return {
      systemData,
      isConnected,
      hasLiveData,
      filteredSystemData, // Return the filtered system data
      // Other methods and computed properties
      formatTimestamp,
      batteryPercentage,
      batteryTimeToEmpty, 
      batteryState,
      getMemoryPercentage,
      isSshActive,
      isSshInactive,
    };
  },
};
</script>


<style scoped>
/* * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
} */
.grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  flex-wrap: wrap;
  justify-content: flex-start; /* Align items to the left */
  gap: 20px; /* Adjust the gap between cards */
  padding: 20px;
  margin-left: 100px;
}

.card {
  background-color: #fff;
  border: 1px solid #2196F3;
  border-radius: 8px;
  padding: 20px;
  flex: 1 1 calc(33.33% - 40px); /* 3 cards per row, subtracting gap */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  min-width: 300px;
}


.card:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  margin-top: 10px;
}

.metric {
  display: flex;
  align-items: center;
  margin: 18px 0;
}

.metric .label {
  font-weight: bold;
  margin-right: 5px;
}

.metric i {
  color: #2196F3;
  margin-right: 15px;
}

.battery-status {
  display: flex;
  align-items: center;
}

.battery-container {
  display: flex;
  align-items: center;
}

.battery {
  width: 40px;
  height: 15px;
  border: 1px solid #2196F3;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
}

.battery-fill {
  height: 100%;
  background: #2196F3;
  transition: width 0.3s ease;
}

.percentage {
  font-weight: bold;
  color: #2196F3;
  font-size: 16px;
  margin-left: 10px;
}

.time-to-empty {
  margin-left: 10px;
  font-weight: bold;
  color: #333;
}

.battery-state {
  margin-left: 10px;
}

.ssh-active {
  color: red;
}

.ssh-inactive {
  color: green;
}
</style>