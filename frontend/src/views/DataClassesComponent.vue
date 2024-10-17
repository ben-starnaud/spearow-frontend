<template>
  <div class="data-classes-container">
    <button @click="toggleDropdown" class="dropdown-toggle">
      Supported Data Classes
      <span :class="{ 'arrow-down': !isOpen, 'arrow-up': isOpen }"></span>
    </button>
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-content">
        <p v-if="loading">Loading data classes...</p>
        <p v-if="error" class="error-message">{{ error }}</p>
        <ul v-if="dataClasses.length > 0" class="data-classes-list">
          <li v-for="dataClass in dataClasses" :key="dataClass" class="data-class-item">
            {{ dataClass }}
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

export default {
  name: 'DataClassesComponent',
  setup() {
    const dataClasses = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const isOpen = ref(false);

    const fetchDataClasses = async () => {
      try {
        const response = await apiClient.getDataClasses();
        dataClasses.value = response.data.dataclasses;
      } catch (err) {
        console.error('Error fetching data classes:', err);
        error.value = 'Failed to load data classes. Please try again later.';
      } finally {
        loading.value = false;
      }
    };

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };

    onMounted(fetchDataClasses);

    return {
      dataClasses,
      loading,
      error,
      isOpen,
      toggleDropdown
    };
  }
};
</script>

<style scoped>
.data-classes-container {
  margin: 20px 0;
  font-family: Arial, sans-serif;
}

.dropdown-toggle {
  background-color: #2b193b;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  text-align: left;
}

.arrow-down, .arrow-up {
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transition: transform 0.3s ease;
}

.arrow-down {
  transform: rotate(45deg);
}

.arrow-up {
  transform: rotate(-135deg);
}

.dropdown-content {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
}

.data-classes-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.data-class-item {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
}

.data-class-item:last-child {
  border-bottom: none;
}

.error-message {
  color: red;
  padding: 10px 15px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>